// import { moduleProviderLoader } from "@medusajs/framework/modules-sdk";
// import {
//   LoaderOptions,
//   ModuleProvider,
//   ModulesSdkTypes,
// } from "@medusajs/framework/types";
// import {
//   ContainerRegistrationKeys,
//   lowerCaseFirst,
//   promiseAll,
// } from "@medusajs/framework/utils";
// import { awsSesModuleService } from "../services";
// import { Lifetime, asFunction, asValue } from "awilix";

// export const NotificationIdentifiersRegistrationName =
//   "communication_providers_identifier"

// const NotificationProviderRegistrationPrefix = "awsses_"

// const registrationFn = async (klass, container, pluginOptions) => {
//   container.register({
//     [NotificationProviderRegistrationPrefix + pluginOptions.id]: asFunction(
//       (cradle) => new klass(cradle, pluginOptions.options ?? {}),
//       {
//         lifetime: klass.LIFE_TIME || Lifetime.SINGLETON,
//       }
//     ),
//   });

//   container.registerAdd(
//     NotificationIdentifiersRegistrationName,
//     asValue(pluginOptions.id)
//   );
// };

// export default async ({
//   container,
//   options,
// }: LoaderOptions<
//   (
//     | ModulesSdkTypes.ModuleServiceInitializeOptions
//     | ModulesSdkTypes.ModuleServiceInitializeCustomDataLayerOptions
//   ) & { providers: ModuleProvider[] }
// >): Promise<void> => {
//   await moduleProviderLoader({
//     container,
//     providers: options?.providers || [],
//     registerServiceFn: registrationFn,
//   });
// };



// function validateProviders(providers: { channels: string[] }[]) {
//   const hasForChannel = {};
//   providers.forEach((provider) => {
//     provider.channels.forEach((channel) => {
//       if (hasForChannel[channel]) {
//         throw new Error(
//           `Multiple providers are configured for the same channel: ${channel}`
//         );
//       }
//       hasForChannel[channel] = true;
//     });
//   });
// }
