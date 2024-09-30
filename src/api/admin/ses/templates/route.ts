import awsSesModuleService from "../../../../modules/aws-ses/services/awsses-module-service";
import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import { useAwsSesModuleService } from "./hooks";
import { useParseParamsId, useParseRequestBodyToTemplate } from "../hooks";

// ADMIN - GET ALL ACTIVE TEMPLATES
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const sesService: awsSesModuleService = useAwsSesModuleService(req.scope);
  let response = await sesService.listTemplates();

  return res.json(response);
}

// // ADMIN - CREATE TEMPLATE
// export async function POST(
//   req: MedusaRequest,
//   res: MedusaResponse
// ): Promise<void> {
//   console.log("// ADMIN - CREATE TEMPLATE");

//   const data = useParseRequestBodyToTemplate(req);
//   const templateId = data.id;

//   const sesService: awsSesModuleService = useAwsSesModuleService(req.scope);
//   let templateUpdated = await sesService.saveTemplate({
//     templateId,
//     subject: data.subject,
//     html: data.html,
//     text: data.text,
//     mjml: data.mjml,
//   });

//   return res.json(templateUpdated);
// }
