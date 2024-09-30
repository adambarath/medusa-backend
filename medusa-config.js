const { loadEnv, defineConfig, Modules } = require("@medusajs/utils");

loadEnv(process.env.NODE_ENV, process.cwd());

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS,
      adminCors: process.env.ADMIN_CORS,
      authCors: process.env.AUTH_CORS,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  modules: {
    // https://github.com/pevey/medusa-plugin-ses
    awsSesModuleService: {
      resolve: "./modules/aws-ses",
      options: {
        access_key_id: process.env.SES_ACCESS_KEY_ID,
        secret_access_key: process.env.SES_SECRET_ACCESS_KEY,
        region: process.env.SES_REGION,
        from: process.env.SES_FROM,
        template_path: process.env.SES_TEMPLATE_PATH,
        partial_path: process.env.SES_PARTIAL_PATH,
        // optional string containing email address separated by comma
        // order_placed_cc: 'person1@example.com,person2@example.com', 
        enable_endpoint: process.env.SES_ENABLE_ENDPOINT,
        enable_sim_mode: process.env.SES_ENABLE_SIM_MODE
      },
    },

    [Modules.NOTIFICATION]: {
      resolve: "@medusajs/notification",
      options: {
        providers: [
          {
            resolve: "@medusajs/notification-sendgrid",
            id: "sendgrid",
            options: {
              channels: ["email"],
              api_key: process.env.SENDGRID_API_KEY,
              from: process.env.SENDGRID_FROM,
            },
          },
          {
            resolve: "@medusajs/notification-local",
            id: "notification-local-logger",
            options: {
              channels: ["email-test"],
            },
          },
        ],
      },
    },

    [Modules.PAYMENT]: {
      resolve: "@medusajs/payment",
      options: {
        providers: [
          {
            resolve: "@medusajs/payment-stripe",
            id: "stripe",
            options: {
              apiKey: process.env.STRIPE_API_KEY,
              webhookSecret: process.env.STRIPE_API_WEBHOOK_SECRET,
              // capture: process.env.STRIPE_API_,
              // automatic_payment_methods: process.env.STRIPE_API_,
              // payment_description: process.env.STRIPE_API_,
            },
          },
        ],
      },
    },

  },
});
