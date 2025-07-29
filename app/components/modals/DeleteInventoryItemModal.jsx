// app/components/modals/DeleteInventoryItemModal.jsx
"use client";
import React from 'react';

export default function DeleteInventoryItemModal({ item, onClose, onConfirm, isSubmitting }) {
  return (
    <div className="bg-[color:var(--card)] p-6 rounded-lg shadow-lg w-full max-w-md">
      <h2 className="text-xl font-bold mb-2 text-[color:var(--destructive)]">Delete Inventory Item</h2>
      <p className="text-[color:var(--muted-foreground)] mb-6">
        Are you sure you want to delete the item "{item.name}"? This action is not permanent and can be undone by contacting support.
      </p>
      <div className="flex justify-end gap-3">
        <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </button>
        <button
          type="button"
          className="btn-danger"
          onClick={onConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Deleting...' : 'Delete Item'}
        </button>
      </div>
    </div>
  );
}
