import mjml2html from "mjml";
import { Lifetime, AwilixContainer } from "awilix";
import * as aws from "@aws-sdk/client-ses";
import path from "path";
import fs from "fs";
import { readdir } from "node:fs/promises";
import { exec } from "child_process";
import { MedusaError, ContainerRegistrationKeys } from "@medusajs/utils";
import { ITransactionBaseService } from "@medusajs/types";
import validEvents from "../constants/validEvents";
import Handlebars from "handlebars";
import nodemailer from "nodemailer";
import NotificationDataService from "./notification-data";
// import NotificationDataService from "./notification-data";

export interface SESOptions {
  access_key_id: string;
  secret_access_key: string;
  region: string;
  from: string;
  template_path?: string;
  partial_path?: string;
  order_placed_cc?: string;
  localization?: any;
  enable_endpoint?: string;
  enable_sim_mode?: boolean;
  enableUI?: boolean;
}

interface SendOptions {
  from: string;
  to: string;
  subject: string;
  html?: string;
  text?: string;
  attachments?: any[];
}

export default class awsSesModuleService implements ITransactionBaseService {
  static LIFE_TIME = Lifetime.TRANSIENT;
  static identifier = "ses";

  protected readonly notificationDataService_: NotificationDataService;
  private options_: SESOptions;
  private templatePath_: string;
  private partialPath_: string;
  private transporter_: nodemailer.Transporter;

  constructor(
    options: SESOptions,
    notificationDataService: NotificationDataService
  ) {
    console.log(
      "-----------------------------------awsSesModuleService--------------------------------------"
    );

    this.options_ = options;
    this.notificationDataService_ = notificationDataService;

    //console.log(options);
    //console.log(JSON.stringify(options));

    this.templatePath_ = this.options_.template_path.startsWith("/")
      ? path.resolve(this.options_.template_path) // The path given in options is absolute
      : path.join(__dirname, "../../../..", this.options_.template_path); // The path given in options is relative

    if (this.options_.partial_path) {
      this.partialPath_ = this.options_.partial_path.startsWith("/")
        ? path.resolve(this.options_.partial_path) // The path given in options is absolute
        : path.join(__dirname, "../../../..", this.options_.partial_path); // The path given in options is relative
      fs.readdirSync(this.partialPath_).forEach((filename) => {
        if (filename.endsWith(".hbs")) {
          const name = path.parse(filename).name;
          Handlebars.registerPartial(
            name,
            Handlebars.compile(
              fs.readFileSync(path.join(this.partialPath_, filename), "utf8")
            )
          );
        }
      });
    }

    const ses = new aws.SES({
      region: this.options_.region,
      credentials: {
        accessKeyId: this.options_.access_key_id,
        secretAccessKey: this.options_.secret_access_key,
      },
    });

    this.transporter_ = nodemailer.createTransport({
      SES: { ses, aws },
    });
  }

  // @ts-ignore
  async sendNotification(event, eventData, attachmentGenerator) {
    if (eventData?.no_notification) {
      return;
    }

    let templateId = event;

    const data = await this.notificationDataService_.fetchData(
      event,
      eventData,
      attachmentGenerator
    );
    
    if (!data.email) return;
    if (data.locale) {
      templateId =
        this.getLocalizedTemplateId(event, data.locale) || templateId;
    }

    const { subject, html, text, mjml } = await this.compileTemplate(
      templateId,
      data
    );

    if (!subject || (!html && !text)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "SES service: The requested templates were not found. Check template path in config."
      );
    }

    // compile mjml to html
    const htmlOutput = mjml2html(mjml, {});
    const htmlFromMjml = htmlOutput.html;

    let sendOptions: SendOptions = {
      from: this.options_.from,
      to: data.email,
      subject,
      html: htmlFromMjml, // html,
      text,
    };

    /*
        // * see fetchAttachments: https://github.com/pevey/medusa-plugin-ses/blob/main/src/services/notification-data.ts
        const attachments = await this.notificationDataService_.fetchAttachments(
           event,
           data,
           attachmentGenerator
        )

        if (attachments?.length) {
           sendOptions.attachments = attachments.map((a) => {
              return {
                 content: a.base64,
                 filename: a.name,
                 encoding: 'base64',
                 contentType: a.type
              }
           })
        }
        // */

    //const status = await this.transporter_.sendMail(sendOptions).then(() => "sent").catch(() => "failed")
    let status;
    await this.transporter_
      .sendMail(sendOptions)
      .then(() => {
        status = "sent";
      })
      .catch((error) => {
        status = "failed";
        console.log(error);
      });

    if (event === "order.placed" && this.options_.order_placed_cc) {
      const recipients = this.options_.order_placed_cc.split(",");
      for (let recipient of recipients) {
        recipient = recipient.trim();
        await this.transporter_.sendMail({
          ...sendOptions,
          to: recipient,
          subject: `[CC] ${sendOptions.subject}`,
        });
      }
    }

    // We don't want heavy docs stored in DB
    delete sendOptions.attachments;

    return { to: data.email, status, data: sendOptions };
  }

  // @ts-ignore
  async resendNotification(notification, config, attachmentGenerator) {
    let sendOptions: SendOptions = {
      ...notification.data,
      to: config.to || notification.to,
    };

    /*
        // * see fetchAttachments: https://github.com/pevey/medusa-plugin-ses/blob/main/src/services/notification-data.ts
        const attachs = await this.notificationDataService_.fetchAttachments(
           notification.event_name,
           notification.data.dynamic_template_data,
           attachmentGenerator
        )

        sendOptions.attachments = attachs.map((a) => {
           return {
              content: a.base64,
              filename: a.name,
              encoding: 'base64',
              contentType: a.type
           }
        })
        // */

    //const status = await this.transporter_.sendMail(sendOptions).then(() => "sent").catch(() => "failed")
    let status;
    await this.transporter_
      .sendMail(sendOptions)
      .then(() => {
        status = "sent";
      })
      .catch((error) => {
        status = "failed";
        console.log(error);
      });

    return { to: sendOptions.to, status, data: sendOptions };
  }

  /**
   * Sends an email using SES.
   * @param {string} template_id - id of template to use
   * @param {string} from - sender of email
   * @param {string} to - receiver of email
   * @param {Object} data - data to send in mail (match with template)
   * @param {boolean} fromEndpoint - whether the request came from the API endpoint {default: false}
   * @return {Promise} result of the send operation
   */
  async sendEmail(
    template_id,
    from,
    to,
    data,
    from_endpoint = false,
    force_sim_mode = false
  ) {
    // This function is used by the /ses/send API endpoint included in this plugin.
    // The endpoint is disabled by default.
    try {
      const { subject, html, text } = await this.compileTemplate(
        template_id,
        data
      );
      if (!subject || (!html && !text)) {
        return {
          message:
            "Message not sent. Templates were not found or a compile error was encountered.",
          results: {
            subject,
            html,
            text,
          },
        };
      }
      if ((from_endpoint && this.options_.enable_sim_mode) || force_sim_mode) {
        return {
          message: "Message could have been sent.",
          results: {
            subject,
            html,
            text,
          },
        };
      } else {
        return this.transporter_.sendMail({
          from: from,
          to: to,
          subject,
          html,
          text,
        });
      }
    } catch (error) {
      throw error;
    }
  }

  async compileTemplate(templateId, data) {
    const subjectTemplate = fs.existsSync(
      path.join(this.templatePath_, templateId, "subject.hbs")
    )
      ? Handlebars.compile(
          fs.readFileSync(
            path.join(this.templatePath_, templateId, "subject.hbs"),
            "utf8"
          )
        )
      : null;

    const htmlTemplate = fs.existsSync(
      path.join(this.templatePath_, templateId, "html.hbs")
    )
      ? Handlebars.compile(
          fs.readFileSync(
            path.join(this.templatePath_, templateId, "html.hbs"),
            "utf8"
          )
        )
      : null;

    const textTemplate = fs.existsSync(
      path.join(this.templatePath_, templateId, "text.hbs")
    )
      ? Handlebars.compile(
          fs.readFileSync(
            path.join(this.templatePath_, templateId, "text.hbs"),
            "utf8"
          )
        )
      : null;

    const mjmlTemplate = fs.existsSync(
      path.join(this.templatePath_, templateId, "mjml.hbs")
    )
      ? Handlebars.compile(
          fs.readFileSync(
            path.join(this.templatePath_, templateId, "mjml.hbs"),
            "utf8"
          )
        )
      : null;

    return {
      subject: subjectTemplate ? subjectTemplate(data) : "",
      html: htmlTemplate ? htmlTemplate(data) : "",
      text: textTemplate ? textTemplate(data) : "",
      mjml: mjmlTemplate ? mjmlTemplate(data) : "",
    };
  }

  getLocalizedTemplateId(event, locale) {
    if (this.options_.localization && this.options_.localization[locale]) {
      const map = this.options_.localization[locale];
      return map[event];
    }
    return null;
  }

  async listTemplates() {
    let templates = [];
    let files = await readdir(this.templatePath_);
    let eventIds = files.map((file) => file);
    for (let file of files) {
      const eventId = file;
      if (validEvents.includes(eventId)) {
        templates.push({
          id: eventId,
          templateId: eventId,
          eventId: eventId,
          subject: fs.existsSync(
            path.join(this.templatePath_, file, "subject.hbs")
          ),
          html: fs.existsSync(path.join(this.templatePath_, file, "html.hbs")),
          text: fs.existsSync(path.join(this.templatePath_, file, "text.hbs")),
          mjml: fs.existsSync(path.join(this.templatePath_, file, "mjml.hbs")),
          path: path.join(this.templatePath_, file),
        });
      }
    }

    const missing = validEvents.filter((event) => !eventIds.includes(event));
    return { templates, missing };
  }

  async getTemplate(templateId) {
    const subjectTemplate = fs.existsSync(
      path.join(this.templatePath_, templateId, "subject.hbs")
    )
      ? fs.readFileSync(
          path.join(this.templatePath_, templateId, "subject.hbs"),
          "utf8"
        )
      : null;

    const htmlTemplate = fs.existsSync(
      path.join(this.templatePath_, templateId, "html.hbs")
    )
      ? fs.readFileSync(
          path.join(this.templatePath_, templateId, "html.hbs"),
          "utf8"
        )
      : null;

    const textTemplate = fs.existsSync(
      path.join(this.templatePath_, templateId, "text.hbs")
    )
      ? fs.readFileSync(
          path.join(this.templatePath_, templateId, "text.hbs"),
          "utf8"
        )
      : null;

    const mjmlTemplate = fs.existsSync(
      path.join(this.templatePath_, templateId, "mjml.hbs")
    )
      ? fs.readFileSync(
          path.join(this.templatePath_, templateId, "mjml.hbs"),
          "utf8"
        )
      : null;

    return {
      subject: subjectTemplate,
      html: htmlTemplate,
      text: textTemplate,
      mjml: mjmlTemplate,
    };
  }

  async deleteTemplate(templateId) {
    fs.rm(path.join(this.templatePath_, templateId), {
      force: true,
      recursive: true,
    });
    // await exec("rm " + path.join(this.templatePath_, templateId, "subject.hbs"));
    // await exec("rm " + path.join(this.templatePath_, templateId, "html.hbs"));
    // await exec("rm " + path.join(this.templatePath_, templateId, "text.hbs"));
    // await exec("rm " + path.join(this.templatePath_, templateId, "mjml.hbs"));

    return { result: "ok" };
  }

  async saveTemplate({ templateId, subject, html, text, mjml }) {
    // check if in valid events
    //fs.mkdir()fs.mkdir(path.join(this.templatePath_, templateId));
    await exec("mkdir " + path.join(this.templatePath_, templateId));
    await exec(
      "touch " + path.join(this.templatePath_, templateId, "subject.hbs")
    );
    await exec(
      "touch " + path.join(this.templatePath_, templateId, "html.hbs")
    );
    await exec(
      "touch " + path.join(this.templatePath_, templateId, "text.hbs")
    );
    await exec(
      "touch " + path.join(this.templatePath_, templateId, "mjml.hbs")
    );

    await fs.writeFileSync(
      path.join(this.templatePath_, templateId, "subject.hbs"),
      subject,
      { encoding: "utf8", flag: "w" }
    );
    await fs.writeFileSync(
      path.join(this.templatePath_, templateId, "html.hbs"),
      html ?? "",
      { encoding: "utf8", flag: "w" }
    );
    await fs.writeFileSync(
      path.join(this.templatePath_, templateId, "text.hbs"),
      text ?? "",
      { encoding: "utf8", flag: "w" }
    );
    await fs.writeFileSync(
      path.join(this.templatePath_, templateId, "mjml.hbs"),
      mjml,
      { encoding: "utf8", flag: "w" }
    );
    return { templateId, subject, html, text, mjml };
  }
}
