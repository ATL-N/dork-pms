// app/components/settings/CustomTaskScheduleManager.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit } from 'lucide-react';
import { useNotification } from '@/app/context/NotificationContext';
import LoadingSpinner from '../LoadingSpinner';
import Modal from '../Modal';
import CustomScheduleModal from '../modals/CustomScheduleModal';

export default function CustomTaskScheduleManager({ farm }) {
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const { addNotification } = useNotification();

  const fetchSchedules = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/farms/${farm.id}/custom-task-schedules`);
      if (!res.ok) throw new Error('Failed to fetch schedules');
      const data = await res.json();
      setSchedules(data);
    } catch (error) {
      addNotification(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (farm) {
      fetchSchedules();
    }
  }, [farm]);

  const handleSave = async (scheduleData) => {
    const url = selectedSchedule
      ? `/api/farms/${farm.id}/custom-task-schedules/${selectedSchedule.id}`
      : `/api/farms/${farm.id}/custom-task-schedules`;
    const method = selectedSchedule ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save schedule');
      }

      addNotification('Schedule saved successfully!', 'success');
      setShowModal(false);
      fetchSchedules();
    } catch (error) {
      addNotification(error.message, 'error');
    }
  };

  const handleDelete = async (scheduleId) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;

    try {
      const res = await fetch(`/api/farms/${farm.id}/custom-task-schedules/${scheduleId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete schedule');
      }

      addNotification('Schedule deleted successfully!', 'success');
      fetchSchedules();
    } catch (error) {
      addNotification(error.message, 'error');
    }
  };

  const handleToggleCustomSchedules = async (event) => {
    const enabled = event.target.checked;
    try {
      const res = await fetch(`/api/farms/${farm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ useCustomSchedule: enabled }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update farm settings');
      }
      addNotification(`Custom schedules ${enabled ? 'enabled' : 'disabled'}`, 'success');
    } catch (error) {
      addNotification(error.message, 'error');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="useCustomSchedule"
            defaultChecked={farm.useCustomSchedule}
            onChange={handleToggleCustomSchedules}
            className="h-4 w-4 rounded border-[color:var(--border)] text-[color:var(--primary)] focus:ring-[color:var(--ring)]"
          />
          <label htmlFor="useCustomSchedule" className="ml-2 block text-sm text-[color:var(--foreground)]">
            Enable Custom Schedules
          </label>
        </div>
        <button
          onClick={() => {
            setSelectedSchedule(null);
            setShowModal(true);
          }}
          className="btn-primary flex items-center"
        >
          <Plus size={16} className="mr-1" /> New Schedule
        </button>
      </div>

      <div className="space-y-4">
        {schedules.map((schedule) => (
          <div key={schedule.id} className="bg-[color:var(--muted)] p-4 rounded-lg flex justify-between items-center">
            <div>
              <p className="font-bold text-[color:var(--foreground)]">{schedule.taskName}</p>
              <p className="text-sm text-[color:var(--muted-foreground)]">{schedule.times.join(', ')}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedSchedule(schedule);
                  setShowModal(true);
                }}
                className="p-1 text-[color:var(--muted-foreground)] hover:text-[color:var(--primary)]"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleDelete(schedule.id)}
                className="p-1 text-[color:var(--muted-foreground)] hover:text-[color:var(--destructive)]"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <CustomScheduleModal
            schedule={selectedSchedule}
            onSave={handleSave}
            onClose={() => setShowModal(false)}
          />
        </Modal>
      )}
    </div>
  );
}
