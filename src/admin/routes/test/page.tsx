import { useState } from "react";
import { defineRouteConfig } from "@medusajs/admin-sdk";
import { AiAssistent } from "@medusajs/icons";
import { Container } from "@medusajs/ui";

export const config = defineRouteConfig({
  label: "Assistant",
  icon: AiAssistent,
});

const TemplateSettingsPage = function () {
  "use client";

  return <Container className="mb-4"></Container>;
};

export default TemplateSettingsPage;
