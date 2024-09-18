"use client";

import React from "react";
import { Modal, ModalBody, ModalContent, Spinner } from "@nextui-org/react";

interface LoadingProps {
  isOpen: boolean;
}

const Loading: React.FC<LoadingProps> = ({ isOpen }) => {
  return (
    <>
      <Modal
        isOpen={isOpen}
        size="sm"
        hideCloseButton={true}
        className="h-40 w-52"
        motionProps={{
          variants: {
            enter: {
              y: 0,
              opacity: 1,
              transition: {
                duration: 0.4,
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
          {() => (
            <>
              <ModalBody className="h-full">
                <Spinner
                  label="Đang tải dữ liệu..."
                  color="warning"
                  labelColor="warning"
                  className="h-full"
                />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
export default Loading;
