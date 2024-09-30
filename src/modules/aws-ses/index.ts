import { awsSesModuleService, moduleService } from "./services";
//import { loadProviders } from "./loaders/providers";
import { Module } from "@medusajs/utils";

export const AWSSES_MODULE = "awsSesModuleService";

export default Module(AWSSES_MODULE, {
  service: moduleService,
  //loaders: [loadProviders],
});
