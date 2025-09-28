// app/components/modals/TaskModal.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { useNotification } from '@/app/context/NotificationContext';
import LoadingSpinner from '../LoadingSpinner';
import Modal from '../Modal';

export default function TaskModal({ isOpen, onClose, onTaskSaved, farmId, task }) {
  const { addNotification } = useNotification();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    flockId: '',
    assignedToId: '',
  });
  const [flocks, setFlocks] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().substring(0, 16) : '',
        flockId: task.flockId || '',
        assignedToId: task.assignedToId || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        flockId: '',
        assignedToId: '',
      });
    }
  }, [task]);

  useEffect(() => {
    const fetchData = async () => {
      if (!farmId) return;
      setIsFetchingData(true);
      try {
        // In a real app, you might have dedicated endpoints for this
        const [flocksRes, staffRes] = await Promise.all([
          fetch(`/api/farms/${farmId}/flocks`), // Assuming this endpoint exists
          fetch(`/api/farms/${farmId}/staff`)   // Assuming this endpoint exists
        ]);

        if (!flocksRes.ok) throw new Error('Failed to fetch flocks');
        const flocksData = await flocksRes.json();
        setFlocks(flocksData);

        if (!staffRes.ok) throw new Error('Failed to fetch staff');
        const staffData = await staffRes.json();
        setWorkers(staffData.filter(s => s.role === 'WORKER'));

      } catch (error) {
        addNotification(error.message, 'error');
      } finally {
        setIsFetchingData(false);
      }
    };
    fetchData();
  }, [farmId, addNotification]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const url = task ? `/api/tasks/${task.id}` : `/api/farms/${farmId}/tasks`;
    const method = task ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...formData,
            assignedToId: formData.assignedToId || null, // Send null if 'Any worker' is selected
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to ${task ? 'update' : 'create'} task`);
      }

      addNotification(`Task ${task ? 'updated' : 'created'} successfully!`, 'success');
      onTaskSaved();
    } catch (error) {
      addNotification(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Need to create these API routes: /api/farms/[farmId]/flocks and /api/farms/[farmId]/staff
  // For now, I will assume they exist and proceed with the UI.
  // I will create them later if they don't exist.

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task ? 'Edit Task' : 'Create New Task'} hideDefaultButtons>
      {isFetchingData ? <LoadingSpinner /> : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="label">Title</label>
            <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label htmlFor="description" className="label">Description</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} className="input"></textarea>
          </div>
          <div>
            <label htmlFor="dueDate" className="label">Due Date</label>
            <input type="datetime-local" id="dueDate" name="dueDate" value={formData.dueDate} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label htmlFor="flockId" className="label">Flock</label>
            <select id="flockId" name="flockId" value={formData.flockId} onChange={handleChange} className="input" required>
              <option value="">Select a flock</option>
              {flocks.map(flock => (
                <option key={flock.id} value={flock.id}>{flock.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="assignedToId" className="label">Assign To</label>
            <select id="assignedToId" name="assignedToId" value={formData.assignedToId} onChange={handleChange} className="input">
              <option value="">Any Worker</option>
              {workers.map(worker => (
                <option key={worker.user.id} value={worker.user.id}>{worker.user.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? <LoadingSpinner /> : (task ? 'Save Changes' : 'Create Task')}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
