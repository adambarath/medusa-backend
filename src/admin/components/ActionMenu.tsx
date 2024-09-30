"use client";

import "./dropdown-styles.css";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"; // import DropdownMenu from "@medusajs/ui" did not work (onclick)
import { usePrompt } from "@medusajs/ui";
import {
  EllipsisHorizontal,
  PencilSquare,
  ComputerDesktop,
  Trash,
} from "@medusajs/icons";
import { ITemplate, useSesTemplateDelete } from "../hooks";

interface ActionMenuProps {
  template: ITemplate;
  editTemplate: any;
  preview: any;
}

const ActionMenu = ({ template, editTemplate, preview }: ActionMenuProps) => {
  // console.log("----------------- ActionMenu", template);

  const dialog = usePrompt();
  async function deleteTemplate(templateId) {
    const userHasConfirmed = await dialog({
      title: "Delete Template",
      description: "Are you sure you want to completely delete this template?",
    });
    if (userHasConfirmed) {
      useSesTemplateDelete(templateId);
    }
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button>
          <EllipsisHorizontal />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={5}
          className="DropdownMenuContent"
        >
          <DropdownMenu.Item className="DropdownMenuItem gap-x-2">
            <button
              onClick={() => preview(template.id)}
              className="flex flex-nowrap"
            >
              <ComputerDesktop className="text-ui-fg-subtle mr-2" />
              Preview
            </button>
          </DropdownMenu.Item>
          <DropdownMenu.Item className="DropdownMenuItem gap-x-2">
            <button
              onClick={() => editTemplate(template.id)}
              className="flex flex-nowrap"
            >
              <PencilSquare className="text-ui-fg-subtle mr-2" />
              Edit
            </button>
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item className="DropdownMenuItem gap-x-2 text-rose-700">
            <button
              onClick={async () => deleteTemplate(template.id)}
              className="flex flex-nowrap"
            >
              <Trash className="text-rose-700 text-ui-fg-subtle mr-2" />
              Delete
            </button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default ActionMenu;
