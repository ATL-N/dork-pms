// app/components/dashboards/WorkerDashboard.jsx
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, ClipboardList, AlertTriangle, SkipForward } from 'lucide-react';
import SummaryCard from './SummaryCard';
import Alerts from './Alerts';
import LoadingSpinner from '../LoadingSpinner';
import { useSession } from 'next-auth/react';
import { useNotification } from '@/app/context/NotificationContext';

export default function WorkerDashboard() {
  const { data: session } = useSession();
  const { addNotification } = useNotification();
  const [tasks, setTasks] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const farmId = session?.user?.farms?.[0]?.id;

  const fetchTasks = useCallback(async () => {
    if (!farmId) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/farms/${farmId}/tasks`);
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const jsonData = await res.json();
      setTasks(jsonData);
    } catch (err) {
      setError(err.message);
      addNotification(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [farmId, addNotification]);

  useEffect(() => {
    fetchTasks();
    // Mock alerts for now
    setAlerts([
        { id: 1, message: 'Low inventory for Broiler Starter Feed.', level: 'warning' },
        { id: 2, message: 'Vaccination for Flock B is due tomorrow.', level: 'info' },
    ]);
  }, [fetchTasks]);

  const handleTaskStatusChange = async (taskId, newStatus) => {
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
      // Refetch tasks to show the latest status
      fetchTasks();
    } catch (err) {
      setError(err.message);
      addNotification(err.message, 'error');
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  const pendingTasks = tasks.filter(t => t.status === 'PENDING');
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED');
  const skippedTasks = tasks.filter(t => t.status === 'SKIPPED');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Welcome, {session?.user?.name || 'Worker'}!</h1>
      <p className="text-[color:var(--muted-foreground)]">
        You are currently viewing tasks for farm: <strong>{session?.user?.farms?.[0]?.name}</strong>
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          title="Total Tasks Today" 
          value={tasks.length} 
          icon={<ClipboardList />} 
        />
        <SummaryCard 
          title="Pending" 
          value={pendingTasks.length} 
          icon={<AlertTriangle />}
          className={pendingTasks.length > 0 ? 'text-yellow-500' : ''}
        />
        <SummaryCard 
          title="Completed" 
          value={completedTasks.length} 
          icon={<CheckCircle />}
          className="text-green-500"
        />
        <SummaryCard 
          title="Skipped" 
          value={skippedTasks.length} 
          icon={<SkipForward />}
          className="text-gray-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h2 className="font-medium mb-4">Today's Task List</h2>
          <div className="space-y-4">
            {tasks.length > 0 ? tasks.map(task => (
              <div key={task.id} className="p-4 rounded-lg border border-[color:var(--border)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-grow">
                  <p className="font-semibold">{task.title}</p>
                  <p className="text-sm text-[color:var(--muted-foreground)]">
                    <strong>Flock:</strong> {task.flock.name} ({task.flock.breed})
                  </p>
                  {task.description && <p className="text-sm mt-1">{task.description}</p>}
                   <p className="text-xs text-[color:var(--muted-foreground)] mt-2">
                    Due: {new Date(task.dueDate).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                    <select 
                      value={task.status} 
                      onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                      className={`input text-sm p-2 rounded-md ${
                        task.status === 'COMPLETED' ? 'bg-green-100 border-green-300' : 
                        task.status === 'SKIPPED' ? 'bg-gray-100 border-gray-300' :
                        'bg-yellow-100 border-yellow-300'
                      }`}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="SKIPPED">Skipped</option>
                    </select>
                </div>
              </div>
            )) : <p className="text-[color:var(--muted-foreground)] text-center py-8">No tasks scheduled for today.</p>}
          </div>
        </div>
        <div className="card p-6">
          <h2 className="font-medium mb-4">Notifications & Alerts</h2>
          <Alerts alerts={alerts} />
          {alerts.length === 0 && <p className="text-[color:var(--muted-foreground)]">No new notifications.</p>}
        </div>
      </div>
    </div>
  );
}
