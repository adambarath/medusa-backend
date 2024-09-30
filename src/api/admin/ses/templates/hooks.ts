import { MedusaContainer } from "@medusajs/medusa";
import {
  ConfigModule,
  ICartModuleService,
  IOrderModuleService,
  IStoreModuleService,
  IUserModuleService,
} from "@medusajs/types";
import awsSesModuleService, {
  SESOptions,
} from "../../../../modules/aws-ses/services/awsses-module-service";
import NotificationDataService from "../../../../modules/aws-ses/services/notification-data";
import { Modules } from "@medusajs/utils";

export const getConfig = function (config: ConfigModule) {
  // console.log(
  //   "---------getConfig---------------------------------------------------------------------------------------------------------------------------------------------------------------------"
  // );
  // console.log(config.modules);

  const sesConfig: SESOptions =
    config.modules["awsSesModuleService"]["options"];
  //plugins.find((p: any) => p.key === AWSSES_MODULE)["options"];

  return sesConfig;
};

export const useNotificationDataService = function (container: MedusaContainer) {
  // import { AWSSES_MODULE } from "src/modules/aws-ses"; // can not use it from here
  //const sesService: awsSesModuleService = container.resolve(AWSSES_MODULE);

  const cs: ICartModuleService = container.resolve(Modules.CART);
  const os: IOrderModuleService = container.resolve(Modules.ORDER);
  const ss: IStoreModuleService = container.resolve(Modules.STORE);
  const us: IUserModuleService = container.resolve(Modules.USER);

  const service: NotificationDataService = new NotificationDataService({
    cartService: cs,
    orderService: os,
    storeService: ss,
    userService: us,
  });
  return service;
};

export const useAwsSesModuleService = function (container: MedusaContainer) {
  // import { AWSSES_MODULE } from "src/modules/aws-ses"; // can not use it from here
  //const sesService: awsSesModuleService = container.resolve(AWSSES_MODULE);

  const config: ConfigModule = container.resolve("configModule");

  const sesService: awsSesModuleService = new awsSesModuleService(
    getConfig(config),
    useNotificationDataService(container)
  );
  return sesService;
};
