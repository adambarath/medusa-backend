import awsSesModuleService from "../../../../../modules/aws-ses/services/awsses-module-service";
import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import { useAwsSesModuleService } from "../hooks";
import { useParseParamsId, useParseRequestBodyToTemplate } from "../../hooks";

// ADMIN - GET TEMPLATE
// "/admin/ses/templates/:id"
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const id = useParseParamsId(req);

  const sesService: awsSesModuleService = useAwsSesModuleService(req.scope);
  let template = await sesService.getTemplate(id);
  return res.json(template);
}

// ADMIN - DELETE TEMPLATE
export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const id = useParseParamsId(req);

  const sesService: awsSesModuleService = useAwsSesModuleService(req.scope);
  let result = await sesService.deleteTemplate(id);
  return res.json(result);
}

// ADMIN - UPDATE TEMPLATE
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  console.log("// ADMIN - UPDATE TEMPLATE");

  const templateId = useParseParamsId(req);
  const data = useParseRequestBodyToTemplate(req);

  const sesService: awsSesModuleService = useAwsSesModuleService(req.scope);
  let templateUpdated = await sesService.saveTemplate({
    templateId,
    subject: data.subject,
    html: data.html,
    text: data.text,
    mjml: data.mjml,
  });

  return res.json(templateUpdated);
}
