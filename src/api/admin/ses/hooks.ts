import { z } from "zod";
import { MedusaError } from "@medusajs/utils";
import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import { ITemplate } from "../../../admin/hooks";

export function useParseRequestBodyToTemplate(req: MedusaRequest): ITemplate {
  const schema = z.object({
    id: z.string().min(1),
    subject: z.string(),
    html: z.string().nullable(),
    text: z.string().nullable(),
    mjml: z.string(),
  });

  // @ts-ignore
  const { success, error, data } = schema.safeParse(JSON.parse(req.body));
  if (!success) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, error);
  }

  return data;
}

export function useParseParamsId(req: MedusaRequest): string {
  const schema = z.object({
    id: z.string().min(1).max(100),
  });

  // @ts-ignore
  const { success, error, data } = schema.safeParse({ id: req.params.id });

  if (!success) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, error);
  }

  return data.id;
}
