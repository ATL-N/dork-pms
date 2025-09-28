// app/components/modals/CustomScheduleModal.jsx
"use client";

import React, { useState } from 'react';

export default function CustomScheduleModal({ schedule, onSave, onClose }) {
  const [taskName, setTaskName] = useState(schedule?.taskName || '');
  const [taskType, setTaskType] = useState(schedule?.taskType || 'daily');
  const [times, setTimes] = useState(schedule?.times?.join(', ') || '');
  const [applyToAllFarms, setApplyToAllFarms] = useState(schedule?.applyToAllFarms || false);


  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      taskName,
      taskType,
      times: times.split(',').map(t => t.trim()),
      applyToAllFarms,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 sm:p-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white">{schedule ? 'Edit' : 'Create'} Custom Schedule</h2>
      <div>
        <label htmlFor="taskName" className="block text-sm font-medium text-gray-600 dark:text-gray-300">Task Name</label>
        <input
          id="taskName"
          type="text"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          className="input w-full mt-1"
          required
        />
      </div>
       <div>
        <label htmlFor="taskType" className="block text-sm font-medium text-gray-600 dark:text-gray-300">Task Type</label>
        <select
          id="taskType"
          value={taskType}
          onChange={(e) => setTaskType(e.target.value)}
          className="input w-full mt-1"
          required
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      <div>
        <label htmlFor="times" className="block text-sm font-medium text-gray-600 dark:text-gray-300">Times (comma-separated, 24-hour format)</label>
        <input
          id="times"
          type="text"
          value={times}
          onChange={(e) => setTimes(e.target.value)}
          className="input w-full mt-1"
          placeholder="e.g., 06:00, 18:00"
          required
        />
      </div>
       <div className="flex items-center">
        <input
          id="applyToAllFarms"
          type="checkbox"
          checked={applyToAllFarms}
          onChange={(e) => setApplyToAllFarms(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="applyToAllFarms" className="ml-2 block text-sm text-gray-800 dark:text-gray-300">
          Apply to all my farms
        </label>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" className="btn-primary">Save</button>
      </div>
    </form>
  );
}
