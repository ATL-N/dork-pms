// app/components/settings/GeneralSettings.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { useNotification } from '@/app/context/NotificationContext';
import { useFarm } from '@/app/context/FarmContext';

export default function GeneralSettings({ farm }) {
  const [farmName, setFarmName] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNotification } = useNotification();
  const { setCurrentFarm } = useFarm();

  useEffect(() => {
    if (farm) {
      setFarmName(farm.name || '');
      setFarmLocation(farm.location || '');
    }
  }, [farm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/farms/${farm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: farmName, location: farmLocation }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update farm details');
      }

      const updatedFarm = await response.json();
      setCurrentFarm(updatedFarm);
      addNotification('Farm details updated successfully!', 'success');
    } catch (error) {
      addNotification(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[color:var(--card)] p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-medium text-[color:var(--foreground)] mb-4">
        General Information
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="farmName" className="block text-sm font-medium text-[color:var(--muted-foreground)]">
            Farm Name
          </label>
          <input
            id="farmName"
            type="text"
            value={farmName}
            onChange={(e) => setFarmName(e.target.value)}
            className="input w-full mt-1"
            required
          />
        </div>
        <div>
          <label htmlFor="farmLocation" className="block text-sm font-medium text-[color:var(--muted-foreground)]">
            Location
          </label>
          <input
            id="farmLocation"
            type="text"
            value={farmLocation}
            onChange={(e) => setFarmLocation(e.target.value)}
            className="input w-full mt-1"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
