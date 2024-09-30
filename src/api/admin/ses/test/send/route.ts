import { json, Router } from "express";
import { z } from "zod";
import { MedusaError } from "@medusajs/utils";
import awsSesModuleService from "../../../../../modules/aws-ses/services/awsses-module-service";
import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import { useAwsSesModuleService } from "../../templates/hooks";

// SES - TEST TEMPLATE
// ENDPOINT FOR TESTING TEMPLATES - NO AUTH!!! - REQUIRES PASSKEY
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const schema = z.object({
    pass_key: z.string().min(1),
    template_id: z.string().min(1),
    from: z.string().min(1),
    to: z.string().min(1),
    data: z.object({}).passthrough(),
  });

  // @ts-ignore
  const { success, error, data } = schema.safeParse(req.body);
  if (!success) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, error);
  }

  const sesService: awsSesModuleService = useAwsSesModuleService(req.scope);
  sesService
    .sendEmail(data.template_id, data.from, data.to, data.data, true)
    .then((result) => {
      return res.json(result);
    });
}
