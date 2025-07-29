// app/components/modals/ArchiveFlockModal.jsx
"use client";
import React from 'react';

export default function ArchiveFlockModal({ flock, onClose, onConfirm, isSubmitting }) {
  return (
    <div className="bg-[color:var(--card)] p-6 rounded-lg shadow-lg w-full max-w-md">
      <h2 className="text-xl font-bold mb-2 text-[color:var(--destructive)]">Archive Flock</h2>
      <p className="text-[color:var(--muted-foreground)] mb-6">
        Are you sure you want to archive the flock "{flock.name}"? This action will move the flock to the archived list.
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
          {isSubmitting ? 'Archiving...' : 'Archive Flock'}
        </button>
      </div>
    </div>
  );
}
