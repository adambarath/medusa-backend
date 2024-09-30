import type {
  MedusaRequest,
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/medusa";
import { MedusaError } from "@medusajs/utils";
import { Modules } from "@medusajs/utils";
import { IOrderModuleService } from "@medusajs/types";
import { HttpTypes, OrderDTO, ProductDTO } from "@medusajs/framework/types";

// http://localhost:9000/store/notification?order_id=order_01J91HYB35DQ56V6RV7ZV36H2T
export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse<ProductDTO[]>
) => {
  //   if (!req.auth_context?.actor_id) {
  //     throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "401");
  //   }

  const orderId = (req.query.order_id as string) || "";
  if (!orderId) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Order ID is required"
    );
  }
  // get product service
  const service: IOrderModuleService = req.scope.resolve(Modules.ORDER);

  // retrieve product variants by barcode
  const order = await service.retrieveOrder(orderId, {
    //         // select: [
    //         //   "shipping_total",
    //         //   "discount_total",
    //         //   "tax_total",
    //         //   "refunded_total",
    //         //   "gift_card_total",
    //         //   "subtotal",
    //         //   "total",
    //         // ],
    relations: [
      //"*payment_collections.payments",
      "items",
      "transactions",
      "summary",
      "metadata",
      "billing_address",
      "shipping_address",
      "shipping_methods",
      //"customer",
      //   "discounts",
      //   "discounts.rule",
      //   "shipping_methods.shipping_option",
      //   "payments",
      //   "fulfillments",
      //   "returns",
      //   "gift_cards",
      //   "gift_card_transactions",
    ],
  });

  res.json(order);
};
