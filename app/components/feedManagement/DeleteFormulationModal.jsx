// app/components/feedManagement/DeleteFormulationModal.js
"use client";

import { X } from "lucide-react";

const DeleteFormulationModal = ({
  onClose,
  formulation,
  onDeleteFormulation,
}) => {
  const handleDelete = () => {
    onDeleteFormulation(formulation.id);
    onClose();
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-4 text-[color:var(--foreground)]">
        Delete Feed Formulation
      </h2>
      <p className="mb-4">
        Are you sure you want to delete the formulation "
        <strong>{formulation.name}</strong>"? This will also return the
        ingredients back to the inventory. This action cannot be undone.
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

export default DeleteFormulationModal;
