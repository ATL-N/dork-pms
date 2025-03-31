// components/flockManagement/DeleteFlockModal.js
import React from "react";
import Modal, { ModalFooter } from "../Modal";

export default function DeleteFlockModal({
  isOpen,
  onClose,
  flock,
  onDeleteFlock,
}) {
  return (
    <>
      <div className="space-y-4 text-red-500">
        <p className="text-red-500">
          Are you sure you want to <b className="text-red-700">delete</b>{" "}
          <b>{flock?.name}</b>?
        </p>
        <p className="text-[color:var(--muted-foreground)]">
          This action cannot be undone. If you want to keep the flock's
          historical data, consider archiving it instead.
        </p>
        {/* <ModalFooter
          onCancel={onClose}
          onConfirm={() => {
            onDeleteFlock(flock.id);
            onClose();
          }}
          confirmText="Delete Flock"
        /> */}
      </div>
    </>
  );
}
