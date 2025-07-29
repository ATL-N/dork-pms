'use client';

import { useState, useEffect } from 'react';
import Modal from '@/app/components/Modal';

export default function SetMinThresholdModal({ isOpen, onClose, onSave, item }) {
  const [minThreshold, setMinThreshold] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && item) {
      setMinThreshold(item.minThreshold || '');
      setError(null);
    }
  }, [isOpen, item]);

  const handleSave = async () => {
    const threshold = parseFloat(minThreshold);
    if (isNaN(threshold) || threshold < 0) {
      setError('Please enter a valid non-negative number for the threshold.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({ minThreshold: threshold });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} hideDefaultButtons={true}>
      <h2 className="text-2xl font-bold mb-2">Set Minimum Threshold for {item.name}</h2>
      <p className="text-sm text-[color:var(--muted-foreground)] mb-4">
        Current Threshold: {item.minThreshold || 'Not set'}
      </p>
      
      {error && <p className="text-red-500 bg-red-100 p-2 rounded-md mb-4">{error}</p>}

      <div>
        <label className="block text-gray-700">New Threshold</label>
        <input
          type="number"
          value={minThreshold}
          onChange={(e) => setMinThreshold(e.target.value)}
          className="input w-full"
          placeholder="e.g., 10"
          min="0"
        />
        <p className="text-xs text-[color:var(--muted-foreground)] mt-1">
          Set the quantity at which you want to receive a low stock warning.
        </p>
      </div>

      <div className="flex justify-end mt-6 gap-3">
        <button type="button" onClick={onClose} disabled={isSubmitting} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">
          Cancel
        </button>
        <button onClick={handleSave} disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Saving...' : 'Set Threshold'}
        </button>
      </div>
    </Modal>
  );
}
