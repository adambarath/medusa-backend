// original implementation is at:
// https://github.com/pevey/medusa-plugin-ses/blob/main/src/services/notification-data.ts

import { Lifetime } from "awilix";
import { ITransactionBaseService } from "@medusajs/types";
import type {
  ICustomerModuleService,
  ICartModuleService,
  IOrderModuleService,
  IStoreModuleService,
  IUserModuleService,
} from "@medusajs/framework/types";
import { convertToLocale } from "../util/money";

export default class NotificationDataService
  implements ITransactionBaseService
{
  static identifier = "notificationDataService";
  static LIFE_TIME = Lifetime.SCOPED;

  protected readonly cartService_: ICartModuleService;
  protected readonly orderService_: IOrderModuleService;
  protected readonly storeService_: IStoreModuleService;
  //   protected readonly totalsService_: TotalsService;
  protected readonly userService_: IUserModuleService;

  constructor({ cartService, orderService, storeService, userService }) {
    //super(arguments[0]);
    this.cartService_ = cartService;
    this.orderService_ = orderService;
    this.storeService_ = storeService;
    this.userService_ = userService;
  }

  async fetchData(event, data, attachmentGenerator) {
    const noun = event.split(".")[0];
    switch (noun) {
      case "auth":
        return this.getUserData(event, data, attachmentGenerator);
      case "customer":
        return this.getCustomerData(event, data, attachmentGenerator);
      case "invite":
        return this.getInviteData(event, data, attachmentGenerator);
      case "order":
        return await this.getOrderData(event, data, attachmentGenerator);
      case "user":
        return this.getUserData(event, data, attachmentGenerator);
      default:
        return {};
    }
  }

  getCustomerData(event, data, attachmentGenerator) {
    return data;
  }

  getInviteData(event, data, attachmentGenerator) {
    return { ...data, email: data.user_email };
  }

  async getOrderData(event, data, attachmentGenerator) {
    const verb = event.split(".")[1];
    if (verb === "refund_created") {
      // todo: not valid events
    } else {
      const order = await this.orderService_.retrieveOrder(data.id, {
        // select: [
        //   "shipping_total",
        //   "discount_total",
        //   "tax_total",
        //   "refunded_total",
        //   "gift_card_total",
        //   "subtotal",
        //   "total",
        // ],
        relations: [
          "*payment_collections.payments",
          "items",
          "customer",
          "billing_address",
          "shipping_address",
          "discounts",
          "discounts.rule",
          "shipping_methods",
          "shipping_methods.shipping_option",
          "payments",
          "fulfillments",
          "returns",
          "gift_cards",
          "gift_card_transactions",
        ],
      });
      const currencyCode = order.currency_code.toUpperCase();
      const locale = await this.extractLocale(order);

      if (
        verb === "return_requested" ||
        verb === "items_returned" ||
        verb === "return_action_required"
      ) {
        // todo: these are not valid event type currently
      } else {
        /*
        const taxRate = order.tax_rate / 100;
        let items = await Promise.all(
          order.items.map(async (i: any) => {
            i.totals = await this.totalsService_.getLineItemTotals(i, order, {
              include_tax: true,
              use_tax_lines: true,
            });
            i.thumbnail = this.normalizeThumbUrl_(i.thumbnail);
            i.discounted_price = `${this.humanPrice_(
              i.totals.total / i.quantity,
              currencyCode
            )} ${currencyCode}`;
            i.price = `${this.humanPrice_(
              i.totals.original_total / i.quantity,
              currencyCode
            )} ${currencyCode}`;
            return i;
          })
        );

        let discounts = [];
        if (order.discounts) {
          discounts = order.discounts.map((discount) => {
            return {
              is_giftcard: false,
              code: discount.code,
              descriptor: `${discount.rule.value}${
                discount.rule.type === "percentage" ? "%" : ` ${currencyCode}`
              }`,
            };
          });
        }

        let giftCards = [];
        if (order.gift_cards) {
          giftCards = order.gift_cards.map((gc) => {
            return {
              is_giftcard: true,
              code: gc.code,
              descriptor: `${gc.value} ${currencyCode}`,
            };
          });
          discounts.concat(giftCards);
        }
        return {
          ...order,
          locale,
          has_discounts: order.discounts.length,
          has_gift_cards: order.gift_cards.length,
          date: order.created_at.toDateString(),
          items,
          discounts,
          subtotal: `${this.humanPrice_(
            order.subtotal * (1 + taxRate),
            currencyCode
          )} ${currencyCode}`,
          gift_card_total: `${this.humanPrice_(
            order.gift_card_total * (1 + taxRate),
            currencyCode
          )} ${currencyCode}`,
          tax_total: `${this.humanPrice_(
            order.tax_total,
            currencyCode
          )} ${currencyCode}`,
          discount_total: `${this.humanPrice_(
            order.discount_total * (1 + taxRate),
            currencyCode
          )} ${currencyCode}`,
          shipping_total: `${this.humanPrice_(
            order.shipping_total * (1 + taxRate),
            currencyCode
          )} ${currencyCode}`,
          total: `${this.humanPrice_(
            order.total,
            currencyCode
          )} ${currencyCode}`,
        };
        // */
      }
    }
  }

  getUserData(event, data, attachmentGenerator) {
    return data;
  }

  processItems_(items, taxRate, currencyCode) {
    return items.map((i) => {
      return {
        ...i,
        thumbnail: this.normalizeThumbUrl_(i.thumbnail),
        price: `${this.humanPrice_(
          i.unit_price * (1 + taxRate),
          currencyCode
        )} ${currencyCode}`,
      };
    });
  }

  humanPrice_(amount, currency_code) {
    if (!amount) {
      amount = 0.0 as number;
    }

    return convertToLocale({ amount, currency_code }) as string;
  }

  normalizeThumbUrl_(url) {
    if (!url) {
      return null;
    }

    if (url.startsWith("http")) {
      return url;
    } else if (url.startsWith("//")) {
      return `https:${url}`;
    }
    return url;
  }

  async extractLocale(fromOrder) {
    if (fromOrder) {
      if (
        fromOrder.billing_address &&
        fromOrder.billing_address?.country_code
      ) {
        return fromOrder.billing_address.country_code;
      }
    }

    return null;
  }
}
