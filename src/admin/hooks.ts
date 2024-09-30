// import { useAdminCustomQuery, useAdminCustomPost, useAdminCustomDelete } from "medusa-react"

/*
export const useSesTemplate = function (id: string) {
  return useAdminCustomQuery(`/admin/ses/templates/${id}`, ["ses", id]);
};

export const useSesTemplatePreview = (id: string) => {
  return useAdminCustomQuery(`/admin/ses/templates/${id}/preview`, ["ses", id]);
};

export const useSesTemplateDelete = (id: string) => {
  return useAdminCustomDelete(`/admin/ses/templates/${id}`, ["ses", id]);
};

export const useSesTemplateCreate = ({ templateId, subject, html, text }) => {
  return useAdminCustomPost(`/admin/ses/templates`, ["ses", "create"]);
};

export const useSesTemplateUpdate = ({ templateId, subject, html, text }) => {
  return useAdminCustomPost(`/admin/ses/templates/${templateId}`, [
    "ses",
    "update",
  ]);
};

export const useSesTemplates = () => {
  return useAdminCustomQuery(`/admin/ses/templates`, ["ses", "list"]);
};
// */
// --------------------------------------------------------------------------------------------------

import defaultTemplates from "../modules/aws-ses/constants/defaultTemplates";
export interface ITemplate {
  id?: string;
  subject?: string;
  html?: string;
  text?: string;
  mjml?: string;
}

export const useSesTemplate = async function (id: string) {
  const r = await fetch(`/admin/ses/templates/${id}`);
  const activeTemplate: ITemplate = { ...(await r.json()) };

  if (activeTemplate?.html && !activeTemplate?.mjml) {
    console.log(
      "TODO: warning => activeTemplate?.html && !activeTemplate?.mjml"
    );
  }

  const initialSubject =
    activeTemplate?.subject ||
    defaultTemplates[id]?.subject ||
    defaultTemplates["fallback"]?.subject;

  const initialValue =
    activeTemplate?.mjml ||
    defaultTemplates[id]?.mjml ||
    defaultTemplates["fallback"]?.mjml;

  activeTemplate.id = id;
  activeTemplate.subject = activeTemplate.subject || initialSubject;
  activeTemplate.mjml = activeTemplate.mjml || initialValue;

  console.log(activeTemplate);

  return activeTemplate;
};

export const useSesTemplatePreview = (id: string) => {
  return fetch(`/admin/ses/templates/${id}/preview`);
};

export const useSesTemplateDelete = (id: string) => {
  return fetch(`/admin/ses/templates/${id}`, {
    method: "DELETE",
    // headers: {
    //   Accept: "application/json",
    //   "Content-Type": "application/json",
    // },
    // body: JSON.stringify({ a: 1, b: "Textual content" }),
  });
};

export const useSesTemplateCreate = (data: ITemplate) => {
  return fetch(`/admin/ses/templates`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const useSesTemplateUpdate = (data: ITemplate) => {
  return fetch(`/admin/ses/templates/${data.id}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const useSesTemplates = () => {
  return fetch(`/admin/ses/templates`);
};
