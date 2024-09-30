import mjml2html from "mjml";
import awsSesModuleService from "../../../../../../modules/aws-ses/services/awsses-module-service";
import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import { useAwsSesModuleService } from "../../hooks";
import { useParseParamsId } from "../../../hooks";

// ADMIN - GET TEMPLATE PREVIEW
// "/admin/ses/templates/:id/preview"
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  console.log("// ADMIN - GET TEMPLATE PREVIEW");

  const templateId = useParseParamsId(req);

  const sesService: awsSesModuleService = useAwsSesModuleService(req.scope);
  let template = await sesService.getTemplate(templateId);

  //const {html} = await sesService.compileTemplate(templateId, {});
  const htmlOutput = mjml2html(template.mjml, { minify: true });
  const html = htmlOutput.html;
  //console.log(html);

  res.set("Content-Type", "text/html");
  return res.send(Buffer.from(html));
}
