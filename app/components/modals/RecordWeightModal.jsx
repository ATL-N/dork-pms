// app/components/modals/RecordWeightModal.jsx
"use client";
import React, { useState } from 'react';
import { format } from 'date-fns';

export default function RecordWeightModal({ flock, onClose, onSave, isSubmitting }) {
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!weight || !date) return;
    onSave({ date, weight: parseFloat(weight) });
  };

  return (
    <div className="bg-[color:var(--card)] p-6 rounded-lg shadow-lg w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">Record Weight for {flock.name}</h2>
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
          <label className="block text-sm font-medium mb-1">Average Weight (g)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="input w-full"
            placeholder="e.g., 950"
            required
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Weight'}
          </button>
        </div>
      </form>
    </div>
  );
}
