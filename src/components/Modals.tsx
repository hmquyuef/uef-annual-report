import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";

interface ModalProps {
  title: string;
  bodyContent: React.ReactNode;
  isOpen: boolean;
  size?:
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "xs"
    | "full";
  actionLabel: string;
  closeLabel: string;
  onClose: () => void;
  onAction: () => void;
}

const Modals: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  bodyContent,
  size,
  onAction,
  actionLabel,
  closeLabel,
}) => {
  return (
    <Modal
      backdrop="blur"
      size={`${size || "md"}`}
      placement="top"
      isDismissable={false}
      isOpen={isOpen}
      onOpenChange={onClose}
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: "easeOut",
            },
          },
          exit: {
            y: -20,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: "easeIn",
            },
          },
        },
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
            <ModalBody>{bodyContent}</ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                {closeLabel || "Close"}
              </Button>
              {actionLabel && actionLabel != "" ? (
                <Button
                  color="primary"
                  onPress={async () => {
                    await onAction();
                    onClose();
                  }}
                >
                  {actionLabel || "Action"}
                </Button>
              ) : null}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default Modals;
