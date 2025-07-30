// app/components/dashboards/WorkerDashboard.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { CheckCircle, ClipboardList, AlertTriangle } from 'lucide-react';
import SummaryCard from './SummaryCard';
import Alerts from './Alerts';
import LoadingSpinner from '../LoadingSpinner';
import { useSession } from 'next-auth/react';

export default function WorkerDashboard() {
  const { data: session } = useSession();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/dashboard/worker');
        if (!res.ok) throw new Error('Failed to fetch worker data');
        const jsonData = await res.json();
        setData(jsonData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleTaskStatusChange = async (taskId, newStatus) => {
    // TODO: Implement API call to update task status
    console.log(`Updating task ${taskId} to ${newStatus}`);
    // Refetch or update state optimistically
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!data) return null;

  const { tasks = [], alerts = [] } = data;
  const pendingTasks = tasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS');
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Welcome, {session?.user?.name || 'Worker'}!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SummaryCard 
          title="Total Assigned Tasks" 
          value={tasks.length} 
          icon={<ClipboardList />} 
        />
        <SummaryCard 
          title="Pending / In Progress" 
          value={pendingTasks.length} 
          icon={<AlertTriangle />}
          className={pendingTasks.length > 0 ? 'text-yellow-500' : ''}
        />
        <SummaryCard 
          title="Tasks Completed" 
          value={completedTasks.length} 
          icon={<CheckCircle />}
          className="text-green-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h2 className="font-medium mb-4">Your Active Tasks</h2>
          <ul className="divide-y divide-[color:var(--border)]">
            {tasks.length > 0 ? tasks.map(task => (
              <li key={task.id} className="py-3 flex justify-between items-center">
                <div>
                  <p>{task.title}</p>
                  <p className="text-sm text-[color:var(--muted-foreground)]">Farm: {task.farm.name}</p>
                </div>
                <select 
                  value={task.status} 
                  onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                  className={`input text-sm p-1 rounded-md ${
                    task.status === 'COMPLETED' ? 'bg-green-100 border-green-300' : 'bg-yellow-100 border-yellow-300'
                  }`}
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </li>
            )) : <p className="text-[color:var(--muted-foreground)]">No tasks assigned at the moment.</p>}
          </ul>
        </div>
        <div className="card p-6">
          <h2 className="font-medium mb-4">Notifications</h2>
          <Alerts alerts={alerts} />
          {alerts.length === 0 && <p className="text-[color:var(--muted-foreground)]">No notifications.</p>}
        </div>
      </div>
    </div>
  );
}
