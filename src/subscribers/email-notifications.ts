import type { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa";
import { Modules } from "@medusajs/utils";
import SESService from "../modules/aws-ses/services/awsses-module-service";
import { AWSSES_MODULE } from "../modules/aws-ses";
import validEvents from "../modules/aws-ses/constants/validEvents";

export default async function productCreateHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  
    const sesService: SESService = container.resolve(AWSSES_MODULE)
    // await sesService.sendNotification(data.id, )
}

export const config: SubscriberConfig = {
  event: validEvents
};
