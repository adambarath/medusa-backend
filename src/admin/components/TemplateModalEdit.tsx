"use client";

import { useState, useEffect, useCallback, act } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import {
  Heading,
  Button,
  FocusModal,
  Textarea,
  Tabs,
  usePrompt,
  Input,
  Label,
  Table,
  Container,
  IconButton,
  DropdownMenu,
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
  CommandLine,
  BookOpen,
  Eye,
} from "@medusajs/icons";
import { ITemplate, useSesTemplate, useSesTemplateUpdate } from "../hooks";
import CodeMirror from "@uiw/react-codemirror";

interface TemplateEditorProps {
  editOpen: boolean;
  closeEdit: any;
  activeTemplate: ITemplate;
}

const TemplateEditor = function ({
  editOpen,
  closeEdit,
  activeTemplate,
}: TemplateEditorProps) {
  console.log(
    "-------------------------------------------------TemplateEditor Component"
  );

  const { register, handleSubmit, control, reset } = useForm<ITemplate>({
    //defaultValues: activeTemplate,
    values: activeTemplate, // will get updated once values returns, this can be a state variable
  });
  const onSubmit: SubmitHandler<ITemplate> = (data) => saveEdit(data);
  const saveEdit = async function (data) {
    console.log("TODO save", data);

    await useSesTemplateUpdate(data);

    // do entity update, etc.
    closeEdit();
  };

  useEffect(() => {
    reset();
  }, [activeTemplate]);

  return (
    <FocusModal
      open={editOpen}
      onOpenChange={(modalOpened) => {
        if (!modalOpened) {
          closeEdit();
        }
      }}
    >
      <FocusModal.Content>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FocusModal.Header className="flex items-end">
            <div>
              <Button type="button" onClick={closeEdit} variant="secondary">
                Discard
              </Button>
              <Button type="submit" className="ml-2">
                Save
              </Button>
            </div>
          </FocusModal.Header>
          <FocusModal.Body className="p-4 overflow-y-auto">
            <Heading level="h1" className="text-center">
              {activeTemplate.id}
            </Heading>
            <div className="flex px-1 items-end">
              <div className="flex-grow py-6">
                <Label className="mt-4" weight="plus" htmlFor="subject">
                  Subject
                </Label>
                <Input {...register("subject")} />
                <Input {...register("id")} type="hidden" />
                <Input {...register("text")} type="hidden" />
                <Input {...register("html")} type="hidden" />
              </div>
              {/* <div className="py-6 pl-2 ml-auto">
                <IconButton size="large" type="button">
                  <Eye />
                </IconButton>
                <IconButton size="large" className="ml-2" type="button">
                  <BookOpen />
                </IconButton>
              </div> */}
            </div>

            <Label className="mt-4" weight="plus" htmlFor="subject">
              MJML
            </Label>
            <Controller
              control={control}
              name="mjml"
              render={({ field: { onChange, onBlur, value } }) => (
                <CodeMirror
                  value={value}
                  height="auto"
                  onChange={(v, viewUpdate) => onChange(v)}
                  defaultValue="<mjml><mj-body></mjml></mj-body>"
                  theme="dark"
                  className="text-[1rem] rounded-lg overflow-hidden"
                />
              )}
            />

            {/* <Tabs defaultValue="subject">
            <Tabs.List className="my-4">
              <Tabs.Trigger value="subject">Subject</Tabs.Trigger>
              <Tabs.Trigger value="text">Text</Tabs.Trigger>
              <Tabs.Trigger value="html">HTML</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="subject">
              <Textarea value={template?.subject} />
            </Tabs.Content>
            <Tabs.Content value="text">
              <Textarea rows={20} value={template?.text} />
            </Tabs.Content>
            <Tabs.Content value="html">
              <Textarea
                rows={20}
                className="resize rounded-xl"
                value={template?.html}
              />
            </Tabs.Content>
          </Tabs> */}
          </FocusModal.Body>
        </form>
      </FocusModal.Content>
    </FocusModal>
  );
};

export default TemplateEditor;
