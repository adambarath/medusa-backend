import type { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa";
import { Modules } from "@medusajs/utils";
import {
  INotificationModuleService,
  CreateNotificationDTO,
} from "@medusajs/types";

export default async function productCreateHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const notificationModuleService: INotificationModuleService =
    container.resolve(Modules.NOTIFICATION);

  console.log(
    "-------------------------------------------------------------------------------------------------------------------------------------------"
  );
  await notificationModuleService.createNotifications({
    to: "test@gmail.com",
    from: "test@medusajs.com", // Optional var, verified sender required
    channel: "email-test",
    template: "product-created",
    data,
    //   attachments: [ // optional var
    //     {
    //       content: base64,
    //       content_type: "image/png", // mime type
    //       filename: filename.ext,
    //       disposition: "attachment or inline attachment",
    //       id: "id", // only needed for inline attachment
    //     },
    //   ],
  } as CreateNotificationDTO);
}

export const config: SubscriberConfig = {
  event: "product.created",
};
