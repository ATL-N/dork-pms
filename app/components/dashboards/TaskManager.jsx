// app/components/dashboards/TaskManager.jsx
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useFarm } from '@/app/context/FarmContext';
import { useNotification } from '@/app/context/NotificationContext';
import LoadingSpinner from '../LoadingSpinner';
import Modal from '../Modal';
import TaskModal from '../modals/TaskModal';

export default function TaskManager({ fetchAllFarms = false }) {
  const { data: session } = useSession();
  const { currentFarm } = useFarm();
  const { addNotification } = useNotification();

  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const farmId = currentFarm?.id;

  const fetchTasks = useCallback(async () => {
    let url = '/api/farms/tasks';
    if (!fetchAllFarms) {
        if (!farmId) {
            setIsLoading(false);
            return;
        }
        url = `/api/farms/${farmId}/tasks`;
    }
    
    try {
      setIsLoading(true);
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const jsonData = await res.json();
      setTasks(jsonData);
    } catch (err) {
      setError(err.message);
      addNotification(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [farmId, fetchAllFarms, addNotification]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleOpenModal = (task = null) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
    setShowTaskModal(false);
  };

  const handleTaskSaved = () => {
    handleCloseModal();
    fetchTasks();
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update task status');
      }

      addNotification('Task status updated successfully!', 'success');
      fetchTasks(); // Refetch to show the updated status
    } catch (err) {
      addNotification(err.message, 'error');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete task');
      }

      addNotification('Task deleted successfully!', 'success');
      fetchTasks();
    } catch (err) {
      setError(err.message);
      addNotification(err.message, 'error');
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-medium">Task Management</h2>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center">
          <Plus size={16} className="mr-1" /> New Task
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[color:var(--border)]">
              <th className="p-2">Title</th>
              <th className="p-2">Flock</th>
              <th className="p-2">Due Date</th>
              <th className="p-2">Status</th>
              <th className="p-2">Assigned To</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id} className="border-b border-[color:var(--border)]">
                <td className="p-2">{task.title}</td>
                <td className="p-2">{task.flock.name}</td>
                <td className="p-2">{new Date(task.dueDate).toLocaleString()}</td>
                <td className="p-2">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className={`px-2 py-1 text-xs rounded-full border-none outline-none ${
                      task.status === 'COMPLETED' ? 'bg-green-200 text-green-800' :
                      task.status === 'SKIPPED' ? 'bg-gray-200 text-gray-800' :
                      'bg-yellow-200 text-yellow-800'
                    }`}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="SKIPPED">SKIPPED</option>
                  </select>
                </td>
                <td className="p-2">{task.assignedTo?.name || 'Any worker'}</td>
                <td className="p-2 flex gap-2">
                  <button onClick={() => handleOpenModal(task)} className="p-1 hover:text-[color:var(--primary)]">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDeleteTask(task.id)} className="p-1 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tasks.length === 0 && <p className="text-center text-[color:var(--muted-foreground)] py-8">No tasks found for this farm.</p>}
      </div>

      {showTaskModal && (
        <TaskModal
          isOpen={showTaskModal}
          onClose={handleCloseModal}
          onTaskSaved={handleTaskSaved}
          farmId={farmId}
          task={selectedTask}
        />
      )}
    </div>
  );
}
