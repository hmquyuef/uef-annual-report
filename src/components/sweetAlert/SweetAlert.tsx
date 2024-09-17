"use client";

import React, { useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

// Define props interface
interface SweetAlertProps {
  open: boolean;
  status?: "add" | "update" | "delete" | "error" | "info" | "";
  title?: React.ReactNode;
  content?: React.ReactNode;
  onClose: () => void;
  confirmButtonText?: string;
  isSuccess?: boolean;
}

const SweetAlert: React.FC<SweetAlertProps> = ({
  open,
  status,
  title,
  content,
  onClose,
  confirmButtonText,
  isSuccess,
}) => {
  useEffect(() => {
    if (open && typeof window !== "undefined") {
      MySwal.fire({
        title: title ? (
          <div
            className={
              status === "add"
                ? "text-green-400"
                : status === "update"
                ? "text-blue-400"
                : status === "delete" || status === "error"
                ? "text-red-400"
                : ""
            }
          >
            {title}
          </div>
        ) : (
          ""
        ),
        html: content ? (
          <div
            className={
              status === "delete" || status === "error" ? "text-red-400" : ""
            }
          >
            {content}
          </div>
        ) : (
          ""
        ),
        confirmButtonText: confirmButtonText || "OK",
        icon: isSuccess ? "success" : undefined,
        didOpen: () => {},
        willClose: () => {
          onClose();
        },
      });
    }
  }, [open, title, content, onClose, confirmButtonText, isSuccess, status]);

  return null;
};

export default SweetAlert;
