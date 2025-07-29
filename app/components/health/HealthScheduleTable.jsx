
// app/components/health/HealthScheduleTable.jsx
"use client";

import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Edit, Trash2, Plus } from 'lucide-react';

export default function HealthScheduleTable({ tasks, onEdit, onDelete, onAdd }) {
    const [sortConfig, setSortConfig] = useState({ key: 'scheduledDate', direction: 'ascending' });

    const sortedTasks = useMemo(() => {
        let sortableTasks = [...tasks];
        if (sortConfig !== null) {
            sortableTasks.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableTasks;
    }, [tasks, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getFlockColor = (flockId) => {
        let hash = 0;
        for (let i = 0; i < flockId.length; i++) {
            hash = flockId.charCodeAt(i) + ((hash << 5) - hash);
        }
        let color = '#';
        for (let i = 0; i < 3; i++) {
            let value = (hash >> (i * 8)) & 0xFF;
            color += ('00' + value.toString(16)).substr(-2);
        }
        return color;
    };

    const getTaskTypeColor = (taskType) => {
        switch (taskType) {
            case 'Vaccination':
                return "bg-cyan-700";
            case 'Medication':
                return 'bg-gray-700';
            case 'Checkup':
                return 'bg-pink-100';
            default:
                return 'bg-gray-600';
        }
    };

    return (
        <div className="card p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Health Schedules</h3>
                <button onClick={onAdd} className="btn-primary flex items-center gap-2">
                    <Plus size={18} />
                    New Schedule
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full table-auto">
                    <thead>
                        <tr className="bg-muted">
                            <th className="p-3 text-left cursor-pointer" onClick={() => requestSort('flock.name')}>Flock</th>
                            <th className="p-3 text-left cursor-pointer" onClick={() => requestSort('taskName')}>Task</th>
                            <th className="p-3 text-left cursor-pointer" onClick={() => requestSort('scheduledDate')}>Scheduled Date</th>
                            <th className="p-3 text-left cursor-pointer" onClick={() => requestSort('status')}>Status</th>
                            <th className="p-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedTasks.map(task => {
                            const flockColor = getFlockColor(task.flockId);
                            const taskTypeColor = getTaskTypeColor(task.taskType);
                            return (
                                <tr key={task.id} className={`border-b border-border ${taskTypeColor}`}>
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: flockColor }}></span>
                                            <span>{task.flock.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-3">{task.taskName}</td>
                                    <td className="p-3">{format(new Date(task.scheduledDate), 'PPP')}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${task.status === 'COMPLETED' ? 'bg-green-500' : task.status === 'PENDING' ? 'bg-yellow-500' : 'bg-red-500'}`}>
                                            {task.status}
                                        </span>
                                    </td>
                                    <td className="p-3 flex items-center gap-2">
                                        <button onClick={() => onEdit(task)} className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-md">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => onDelete(task)} className="p-1.5 text-red-500 hover:bg-red-100 rounded-md">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
