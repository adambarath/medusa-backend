"use client";

import {
  Heading,
  Button,
  Container,
  FocusModal,
  Input,
  Label,
} from "@medusajs/ui";
import { ITemplate } from "../hooks";
import { useRef, useState } from "react";

interface TemplatePreviewProps {
  isOpen: boolean;
  close: any;
  activeTemplate: ITemplate;
}

const TemplatePreview = function ({
  isOpen,
  close,
  activeTemplate,
}: TemplatePreviewProps) {
  console.log(
    "-------------------------------------------------TemplatePreview Component"
  );

  return (
    <FocusModal
      open={isOpen}
      onOpenChange={(modalOpened) => {
        if (!modalOpened) {
          close();
        }
      }}
    >
      <FocusModal.Content>
        <FocusModal.Header className="flex items-end">
          <div>
            <Button type="button" onClick={close} variant="secondary">
              Close
            </Button>
          </div>
        </FocusModal.Header>
        <FocusModal.Body className="p-4 overflow-y-auto">
          <Heading level="h1" className="text-center">
            {activeTemplate.id}
          </Heading>

          <Label className="mt-4" weight="plus" htmlFor="subject">
            Subject
          </Label>
          <Input disabled value={activeTemplate.subject} />

          <Label className="mt-4" weight="plus" htmlFor="subject">
            MJML - as HTML
          </Label>
          <Container className="mb-4 bg-ui-bg-field-hover">
            <div className="flex flex-row min-h-screen justify-center items-center ">
              <FrameWrapper
                src={`/admin/ses/templates/${activeTemplate.id}/preview`}
              ></FrameWrapper>
            </div>
          </Container>
        </FocusModal.Body>
      </FocusModal.Content>
    </FocusModal>
  );
};

interface FrameWrapperProps {
  src: string;
}
function FrameWrapper({ src }: FrameWrapperProps) {
  const ref = useRef();
  const [height, setHeight] = useState("0px");
  const onLoad = () => {
    setHeight(ref.current.contentWindow.document.body.scrollHeight + "px");
  };
  return (
    <iframe
      ref={ref}
      onLoad={onLoad}
      id="previewFrame"
      src={src}
      width="100%"
      height={height}
      scrolling="no"
      frameBorder="0"
      style={{
        maxWidth: 640,
        width: "100%",
        overflow: "auto",
        backgroundColor: "white",
      }}
    ></iframe>
  );
}

export default TemplatePreview;
