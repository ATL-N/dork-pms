// app/farm/[farmId]/health/page.jsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Calendar, Plus, Trash2, Edit, Save } from 'lucide-react';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { useNotification } from '@/app/context/NotificationContext';
import { format } from 'date-fns';

export default function FarmHealthSchedulePage() {
    const params = useParams();
    const farmId = params.farmId;
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { addNotification } = useNotification();
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editedTask, setEditedTask] = useState({});

    const fetchHealthTasks = useCallback(async () => {
        if (!farmId) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/farms/${farmId}/health-tasks`);
            if (!res.ok) throw new Error('Failed to fetch health tasks');
            const data = await res.json();
            setTasks(data);
        } catch (error) {
            addNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [farmId, addNotification]);

    useEffect(() => {
        fetchHealthTasks();
    }, [fetchHealthTasks]);

    const handleEdit = (task) => {
        setEditingTaskId(task.id);
        setEditedTask({ ...task });
    };

    const handleCancel = () => {
        setEditingTaskId(null);
        setEditedTask({});
    };

    const handleSave = async (taskId) => {
        try {
            const res = await fetch(`/api/farms/${farmId}/health-tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editedTask),
            });
            if (!res.ok) throw new Error('Failed to save task');
            addNotification('Task updated successfully', 'success');
            setEditingTaskId(null);
            fetchHealthTasks();
        } catch (error) {
            addNotification(error.message, 'error');
        }
    };
    
    const handleDelete = async (taskId) => {
        if (!confirm('Are you sure you want to delete this task?')) return;
        try {
            await fetch(`/api/farms/${farmId}/health-tasks/${taskId}`, { method: 'DELETE' });
            addNotification('Task deleted successfully', 'success');
            fetchHealthTasks();
        } catch (error) {
            addNotification(error.message, 'error');
        }
    };

    const handleInputChange = (e, field) => {
        setEditedTask({ ...editedTask, [field]: e.target.value });
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Calendar /> Health Schedules
                </h1>
                <button className="btn-primary flex items-center gap-2">
                    <Plus size={18} /> Add New Task
                </button>
            </div>

            <div className="card p-4">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="p-3">Flock</th>
                                <th className="p-3">Task</th>
                                <th className="p-3">Scheduled Date</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map(task => (
                                <tr key={task.id} className="border-b border-border">
                                    {editingTaskId === task.id ? (
                                        <>
                                            <td className="p-3">{task.flock.name}</td>
                                            <td className="p-3"><input type="text" value={editedTask.taskName} onChange={(e) => handleInputChange(e, 'taskName')} className="input" /></td>
                                            <td className="p-3"><input type="date" value={format(new Date(editedTask.scheduledDate), 'yyyy-MM-dd')} onChange={(e) => handleInputChange(e, 'scheduledDate')} className="input" /></td>
                                            <td className="p-3">
                                                <select value={editedTask.status} onChange={(e) => handleInputChange(e, 'status')} className="input">
                                                    <option value="SCHEDULED">Scheduled</option>
                                                    <option value="COMPLETED">Completed</option>
                                                    <option value="MISSED">Missed</option>
                                                </select>
                                            </td>
                                            <td className="p-3 flex gap-2">
                                                <button onClick={() => handleSave(task.id)} className="btn-success p-2"><Save size={16} /></button>
                                                <button onClick={handleCancel} className="btn-secondary p-2"><Trash2 size={16} /></button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="p-3">{task.flock.name}</td>
                                            <td className="p-3">{task.taskName}</td>
                                            <td className="p-3">{format(new Date(task.scheduledDate), 'PPP')}</td>
                                            <td className="p-3">{task.status}</td>
                                            <td className="p-3 flex gap-2">
                                                <button onClick={() => handleEdit(task)} className="btn-primary p-2"><Edit size={16} /></button>
                                                <button onClick={() => handleDelete(task.id)} className="btn-destructive p-2"><Trash2 size={16} /></button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
