// app/settings/page.jsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Settings, CalendarCog, Home } from 'lucide-react';

import LoadingSpinner from '../components/LoadingSpinner';
import { useNotification } from '../context/NotificationContext';
import GeneralSettings from '../components/settings/GeneralSettings';
import CustomTaskScheduleManager from '../components/settings/CustomTaskScheduleManager';

export default function SettingsPage() {
  const [farms, setFarms] = useState([]);
  const [activeFarm, setActiveFarm] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(true);
  const { addNotification } = useNotification();
  const { data: session } = useSession();

  const fetchUserFarms = useCallback(async () => {
    if (!session) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/user/farms');
      if (!res.ok) throw new Error('Failed to fetch farms');
      const farmsData = await res.json();
      setFarms(farmsData);
      if (farmsData.length > 0) {
        setActiveFarm(farmsData[0]);
      }
    } catch (err) {
      addNotification(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [session, addNotification]);

  useEffect(() => {
    fetchUserFarms();
  }, [fetchUserFarms]);

  const handleFarmChange = (farm) => {
    setActiveFarm(farm);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="flex flex-wrap items-center gap-2 border-b border-[color:var(--border)] pb-2">
        <span className="font-medium mr-2">Farms:</span>
        {farms.length > 0 ? farms.map(farm => (
          <button
            key={farm.id}
            className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-2 ${
              activeFarm?.id === farm.id
                ? "bg-[color:var(--primary)] text-white"
                : "bg-[color:var(--card)] hover:bg-[color:var(--accent)]"
            }`}
            onClick={() => handleFarmChange(farm)}
          >
            <Home size={16} />
            {farm.name}
          </button>
        )) : !isLoading && <p className="text-sm text-[color:var(--muted-foreground)]">No farms found.</p>}
      </div>

      {activeFarm ? (
        <div>
          <div className="flex border-b border-[color:var(--border)] mb-6">
            <button
              className={`px-4 py-2 font-medium flex items-center gap-2 ${
                activeTab === 'general'
                  ? "text-[color:var(--primary)] border-b-2 border-[color:var(--primary)]"
                  : "text-[color:var(--muted-foreground)]"
              }`}
              onClick={() => setActiveTab('general')}
            >
              <Settings size={16} /> General
            </button>
            <button
              className={`px-4 py-2 font-medium flex items-center gap-2 ${
                activeTab === 'schedules'
                  ? "text-[color:var(--primary)] border-b-2 border-[color:var(--primary)]"
                  : "text-[color:var(--muted-foreground)]"
              }`}
              onClick={() => setActiveTab('schedules')}
            >
              <CalendarCog size={16} /> Task Schedules
            </button>
          </div>

          <div>
            {activeTab === 'general' && (
              <GeneralSettings farm={activeFarm} />
            )}
            {activeTab === 'schedules' && (
              <div className="bg-[color:var(--card)] p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-medium text-[color:var(--foreground)] mb-4">
                  Custom Task Schedules for {activeFarm.name}
                </h3>
                <p className="text-sm text-[color:var(--muted-foreground)] mb-4">
                  Create custom schedules for your tasks. If enabled, these schedules will override the default task generation.
                </p>
                <CustomTaskScheduleManager farm={activeFarm} />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold">No Farm Selected</h2>
          <p className="mt-2 text-[color:var(--muted-foreground)]">Please select a farm to manage its settings, or add a new farm.</p>
        </div>
      )}
    </div>
  );
}
