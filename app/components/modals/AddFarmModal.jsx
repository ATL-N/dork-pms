// app/components/modals/AddFarmModal.jsx
"use client";
import React, { useState } from 'react';
import Modal from '../Modal';
import { useNotification } from '@/app/context/NotificationContext';

export default function AddFarmModal({ isOpen, onClose, onFarmAdded }) {
  const [farmName, setFarmName] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/farms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: farmName, location }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create farm');
      }

      addNotification('Farm created successfully!', 'success');
      onFarmAdded(); // Callback to refresh the dashboard data
      onClose(); // Close the modal
    } catch (error) {
      addNotification(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-2xl font-bold mb-4">Create a New Farm</h2>
        <div>
          <label htmlFor="farmName" className="form-label">Farm Name</label>
          <input
            id="farmName"
            type="text"
            value={farmName}
            onChange={(e) => setFarmName(e.target.value)}
            className="input"
            required
          />
        </div>
        <div>
          <label htmlFor="location" className="form-label">Location (e.g., City, State)</label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="input"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Farm'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
