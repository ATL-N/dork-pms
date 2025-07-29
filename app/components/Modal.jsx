// components/Modal.js
"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

const Modal = ({
  children,
  onClose,
  title,
  onConfirm,
  confirmText = "Are you sure you want to confirm this action?",
  cancelText = "Are you sure you want to close?",
  isSubmitting = false,
  hideDefaultButtons = false,
}) => {
  const [showConfirmationPrompt, setShowConfirmationPrompt] = useState(false);
  const [action, setAction] = useState(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        handleCloseClick();
      }
    };
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseClick();
    }
  };

  const handleCloseClick = () => {
    setShowConfirmationPrompt(true);
    setAction("close");
  };

  const handleConfirmClick = () => {
    setShowConfirmationPrompt(true);
    setAction("confirm");
  };

  const handleConfirmAction = () => {
    if (action === "confirm") {
      if (onConfirm) onConfirm();
    }
    if (action === "close") {
      onClose();
    }
    setShowConfirmationPrompt(false);
  };

  const handleCancelAction = () => {
    setShowConfirmationPrompt(false);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-40"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      onClick={handleBackdropClick}
    >
      <div
        className="bg-[color:var(--card)] text-[color:var(--card-foreground)] rounded-lg p-6 w-full max-w-[80vw] max-h-[85vh] relative shadow-lg border border-[color:var(--border)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className="absolute top-2 right-2 text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)] z-50"
          onClick={handleCloseClick}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Optional title*/}
        {title && (
          <h2 className="text-xl font-bold mb-4 text-[color:var(--foreground)]">
            {title}
          </h2>
        )}

        {/* Scrollable content */}
        <div className="overflow-auto max-h-[calc(85vh-10rem)]">{children}</div>

        {/* Action buttons */}
        {!hideDefaultButtons && (
          <div className="mt-6 flex justify-end gap-3">
            <button
              className="bg-[color:var(--muted)] hover:bg-[color:var(--muted-foreground)] text-[color:var(--foreground)] px-4 py-2 rounded-md transition-colors"
              onClick={handleCloseClick}
            >
              Cancel
            </button>
            <button
              className="bg-[color:var(--primary)] hover:bg-[color:var(--primary-dark)] text-white px-4 py-2 rounded-md transition-colors flex items-center"
              onClick={handleConfirmClick}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Confirm"
              )}
            </button>
          </div>
        )}

        {/* Confirmation Dialog */}
        {showConfirmationPrompt && (
          <div className="absolute inset-0 bg-[color:var(--card)] bg-opacity-95 flex items-center justify-center rounded-lg">
            <div className="p-6 max-w-md">
              <h3 className="text-lg font-medium mb-3 text-[color:var(--foreground)]">
                {action === "confirm"
                  ? "Proceed with this action?"
                  : "Close this dialog?"}
              </h3>
              <p className="mb-6 text-[color:var(--muted-foreground)]">
                {action === "confirm"
                  ? confirmText
                  : cancelText}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  className="bg-[color:var(--muted)] hover:bg-[color:var(--muted-foreground)] text-[color:var(--foreground)] px-4 py-2 rounded-md transition-colors"
                  onClick={handleCancelAction}
                >
                  Go Back
                </button>
                <button
                  className={`
                    ${
                      action === "confirm"
                        ? "bg-[color:var(--primary)] hover:bg-[color:var(--primary-dark)]"
                        : "bg-[color:var(--destructive)] hover:opacity-90"
                    } 
                    text-white px-4 py-2 rounded-md transition-colors
                  `}
                  onClick={handleConfirmAction}
                >
                  {action === "confirm" ? "Yes, Confirm" : "Yes, Close"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;

