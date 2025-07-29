// app/components/modals/RecordMortalityModal.jsx
"use client";
import React, { useState } from 'react';
import { format } from 'date-fns';

export default function RecordMortalityModal({ flock, onClose, onSave, isSubmitting }) {
  const [quantity, setQuantity] = useState('');
  const [cause, setCause] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!quantity || !date) return;
    onSave({ date, quantity: parseInt(quantity), cause });
  };

  return (
    <div className="bg-[color:var(--card)] p-6 rounded-lg shadow-lg w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">Record Mortality for {flock.name}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Number of Birds</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="input w-full"
            placeholder="e.g., 15"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Cause of Mortality (Optional)</label>
          <input
            type="text"
            value={cause}
            onChange={(e) => setCause(e.target.value)}
            className="input w-full"
            placeholder="e.g., Coccidiosis"
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Record'}
          </button>
        </div>
      </form>
    </div>
  );
}
