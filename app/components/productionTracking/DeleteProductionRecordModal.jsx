// app/components/productionTracking/DeleteProductionRecordModal.js
"use client";

import { X } from "lucide-react";

const DeleteProductionRecordModal = ({
  onClose,
  record,
  recordType,
  onDeleteRecord,
}) => {
  const handleDelete = () => {
    onDeleteRecord(record.id);
    onClose();
  };
  return (
    <>
      <h2 className="text-xl font-bold mb-4 text-[color:var(--foreground)]">
        Delete Production Record
      </h2>
      <p className="mb-4">
        Are you sure you want to delete this{" "}
        {recordType === "egg" ? "egg" : "meat"} production record for{" "}
        <strong>{record.flockName}</strong> on <strong>{record.date}</strong>?
        This action cannot be undone.
      </p>
      <div className="flex justify-end gap-4">
        <button
          onClick={onClose}
          className="btn-secondary" // Use your secondary button style
        >
          Cancel
        </button>
        <button onClick={handleDelete} className="btn-destructive">
          Delete
        </button>
      </div>
    </>
  );
};

export default DeleteProductionRecordModal;
