// app/components/dashboards/WorkerDashboard.jsx
"use client";
import React from 'react';
import { CheckCircle, ClipboardList, AlertTriangle } from 'lucide-react';
import SummaryCard from './SummaryCard';
import Alerts from './Alerts';

export default function WorkerDashboard({ user, tasks, alerts }) {
  const pendingTasks = tasks.filter(t => t.status === 'Pending');
  const completedTasks = tasks.filter(t => t.status === 'Completed');

  const handleTaskStatusChange = async (taskId, newStatus) => {
    // This would ideally be a POST/PUT request to an API endpoint
    console.log(`Updating task ${taskId} to ${newStatus}`);
    // You would then refetch the data to update the UI
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Welcome, {user?.name || 'Worker'}!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          title="Assigned Tasks" 
          value={tasks.length} 
          icon={<ClipboardList />} 
        />
        <SummaryCard 
          title="Tasks Pending" 
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
          <h2 className="font-medium mb-4">Your Daily Tasks</h2>
          <ul className="divide-y divide-[color:var(--border)]">
            {tasks.length > 0 ? tasks.map(task => (
              <li key={task.id} className="py-3 flex justify-between items-center">
                <p>{task.description}</p>
                <select 
                  value={task.status} 
                  onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                  className={`input text-sm p-1 rounded-md ${
                    task.status === 'Completed' ? 'bg-green-100 border-green-300' : 'bg-yellow-100 border-yellow-300'
                  }`}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </li>
            )) : <p className="text-[color:var(--muted-foreground)]">No tasks assigned for today.</p>}
          </ul>
        </div>
        <div className="card p-6">
          <Alerts alerts={alerts} />
        </div>
      </div>
    </div>
  );
}
