"use client";

import { useEffect, useState } from "react";
import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ChatBubbleLeftRight } from "@medusajs/icons";
import {
  Heading,
  Table,
  Container,
  Select,
  useToggleState,
} from "@medusajs/ui";
import {
  PlusMini,
  XMark,
  Check,
  EllipsisHorizontal,
  PencilSquare,
  ComputerDesktop,
  Trash,
} from "@medusajs/icons";
import ActionMenu from "../../components/ActionMenu";
import NoSubjectTooltip from "../../components/NoSubjectTooltip";
import NoTextTooltip from "../../components/NoTextTooltip";
import NoHtmlTooltip from "../../components/NoHtmlTooltip";
import NoBodyTooltip from "../../components/NoBodyTooltip";

import {
  useSesTemplates,
  useSesTemplate,
  useSesTemplateDelete,
  ITemplate,
} from "../../hooks";
import TemplateEditor from "../../components/TemplateModalEdit";
import TemplatePreview from "../../components/TemplateModalPreview";


export const highlights = [
  ["14", "label", "The label of the UI route's sidebar item."],
  ["15", "icon", "The icon of the UI route's sidebar item."],
];

export const config = defineRouteConfig({
  label: "Email Templates",
  // description: "Manage email templates for notifications",
  icon: ChatBubbleLeftRight,
});

const TemplateSettingsPage = function () {
  const [response, setResponse] = useState({
    isLoading: true,
    data: { templates: [], missing: [] },
  });
  useEffect(() => {
    async function getData() {
      const r = await useSesTemplates();
      setResponse({ isLoading: false, data: await r.json() });
    }
    getData();
  }, []);

  
  const [editOpen, showEdit, closeEdit] = useToggleState();
  const [previewOpen, showPreview, closePreview] = useToggleState();
  const [activeTemplate, setActiveTemplate] = useState<ITemplate>();
  const editTemplate = async (value) => {
    const activeTemplateId = value;
    const template = await useSesTemplate(activeTemplateId);
    setActiveTemplate(template);
    console.log(template);
    showEdit();
  };

  const previewTemplate = async (value) => { 
   const activeTemplateId = value;
    const template = await useSesTemplate(activeTemplateId);
    setActiveTemplate(template);
    console.log(template);
    showPreview();
  }

  console.log(response);
  return (
    <Container className="mb-4">
      {activeTemplate && (
        <><TemplateEditor
          editOpen={editOpen}
          closeEdit={closeEdit}
          activeTemplate={activeTemplate}
        />
        <TemplatePreview
          isOpen={previewOpen}
          close={closePreview}
          activeTemplate={activeTemplate}
        />
        </>
      )}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Heading level="h1">Email Templates</Heading>
          <Heading level="h3" className="text-grey-50 pt-1.5">
            Manage your email templates
          </Heading>
        </div>
        <div className="flex items-center space-x-2">
          {/* <DropdownMenu>
                  <DropdownMenu.Trigger asChild>
                     <Button variant="secondary"><PlusMini /> Add Template</Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content align="end">
                     <DropdownMenu.Item className="gap-x-2">
                        <div className="flex flex-nowrap">
                           <PlusMini className="text-ui-fg-subtle mr-2" />Create New Template
                        </div>
                     </DropdownMenu.Item>
                     <DropdownMenu.Item className="gap-x-2">
                        <div className="flex flex-nowrap">
                           <PlusMini className="text-ui-fg-subtle mr-2" />Create Template from Existing
                        </div>
                     </DropdownMenu.Item>
                  </DropdownMenu.Content>
               </DropdownMenu> */}
          <Select onValueChange={editTemplate}>
            <Select.Trigger>
              <PlusMini /> Add Template &nbsp;
            </Select.Trigger>
            <Select.Content align="end">
              {!response.isLoading &&
                response.data.missing?.map((template) => {
                  return (
                    <Select.Item key={template} value={template}>
                      {template}
                    </Select.Item>
                  );
                })}
            </Select.Content>
          </Select>
        </div>
      </div>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Event ID</Table.HeaderCell>
            <Table.HeaderCell className="text-center">Subject</Table.HeaderCell>
            <Table.HeaderCell className="text-center">Text</Table.HeaderCell>
            <Table.HeaderCell className="text-center">HTML</Table.HeaderCell>
            <Table.HeaderCell></Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {!response.isLoading &&
            response.data.templates?.map((template) => {
              return (
                <Table.Row
                  key={template.eventId}
                  className="[&_td:last-child]:w-[1%] [&_td:last-child]:whitespace-nowrap pr-0 mr-0"
                >
                  <Table.Cell>{template.eventId}</Table.Cell>
                  <Table.Cell>
                    {template.subject && (
                      <Check className="text-emerald-600 mx-auto" />
                    )}
                    {!template.subject && (
                      <NoSubjectTooltip>
                        <XMark className="text-rose-700 mx-auto" />
                      </NoSubjectTooltip>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {template.text && (
                      <Check className="text-emerald-600 mx-auto" />
                    )}
                    {!template.text && template.html && (
                      <NoTextTooltip>
                        <XMark className="text-amber-500 mx-auto" />
                      </NoTextTooltip>
                    )}
                    {!template.text && !template.html && (
                      <NoBodyTooltip>
                        <XMark className="text-rose-700 mx-auto" />
                      </NoBodyTooltip>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {template.html && (
                      <Check className="text-emerald-600 mx-auto" />
                    )}
                    {!template.html && template.text && (
                      <NoHtmlTooltip>
                        <XMark className="text-amber-500 mx-auto" />
                      </NoHtmlTooltip>
                    )}
                    {!template.html && !template.text && (
                      <NoBodyTooltip>
                        <XMark className="text-rose-700 mx-auto" />
                      </NoBodyTooltip>
                    )}
                  </Table.Cell>
                  <Table.Cell className="text-right mr-0 pr-0">
                     <ActionMenu template={template} editTemplate={editTemplate} preview={previewTemplate} />
                  </Table.Cell>
                </Table.Row>
              );
            })}
        </Table.Body>
      </Table>
    </Container>
  );
};

export default TemplateSettingsPage;
