// app/components/health/HealthCalendar.jsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, ChevronLeft, ChevronRight, CheckSquare } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, parseISO } from 'date-fns';
import LoadingSpinner from '../LoadingSpinner';
import { useNotification } from '../../context/NotificationContext';
import Link from 'next/link';
import CompleteTaskModal from '../modals/CompleteTaskModal';
import Modal from '../Modal';

export default function HealthCalendar({ farmId }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { addNotification } = useNotification();
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    const fetchHealthTasks = useCallback(async () => {
        if (!farmId) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/farms/${farmId}/health-tasks`);
            if (!res.ok) throw new Error('Failed to fetch health tasks');
            const data = await res.json();
            const formattedTasks = data.map(task => ({
                ...task,
                date: parseISO(task.scheduledDate),
            }));
            setTasks(formattedTasks);
        } catch (error) {
            addNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [farmId, addNotification]);

    useEffect(() => {
        fetchHealthTasks();
    }, [fetchHealthTasks]);

    const handleCompleteClick = (task, e) => {
        e.stopPropagation(); 
        e.preventDefault();
        setSelectedTask(task);
        setShowCompleteModal(true);
    };

    const renderHeader = () => (
        <div className="flex items-center justify-between py-2">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-md hover:bg-accent">
                <ChevronLeft size={20} />
            </button>
            <h2 className="text-lg font-semibold">
                {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-md hover:bg-accent">
                <ChevronRight size={20} />
            </button>
        </div>
    );

    const renderDays = () => {
        const days = [];
        const dateFormat = "E";
        const startDate = startOfWeek(currentMonth);
        for (let i = 0; i < 7; i++) {
            days.push(
                <div className="text-center font-medium text-sm text-muted-foreground" key={i}>
                    {format(addDays(startDate, i), dateFormat)}
                </div>
            );
        }
        return <div className="grid grid-cols-7">{days}</div>;
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days = [];
        let day = startDate;

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const cloneDay = day;
                const dayTasks = tasks.filter(task => isSameDay(task.date, cloneDay));

                days.push(
                    <div
                        className={`h-36 p-2 border-t border-l border-border flex flex-col ${!isSameMonth(day, monthStart) ? "bg-muted/50 text-muted-foreground" : ""
                            } ${isSameDay(day, new Date()) ? "bg-blue-50" : ""}`}
                        key={day.toString()}
                    >
                        <span className={`font-medium text-sm ${isSameDay(day, new Date()) ? "text-primary" : ""}`}>{format(day, "d")}</span>
                        <div className="flex-grow overflow-y-auto text-xs space-y-1 mt-1 pr-1">
                            {dayTasks.map(task => (
                                <Link key={task.id} href={`/farm/${farmId}/?flockId=${task.flockId}`} className={`block p-1.5 rounded-md text-white transition-colors ${task.status === 'COMPLETED' ? 'bg-green-500' : task.status === 'PENDING' ? 'bg-yellow-500' : 'bg-red-500'}`}>
                                    
                                        <div className="font-semibold">{task.taskName}</div>
                                        <div className="text-white/80">{task.flock.name}</div>
                                        {task.status !== 'COMPLETED' && (
                                            <button 
                                                onClick={(e) => handleCompleteClick(task, e)}
                                                className="mt-1 text-xs flex items-center gap-1 bg-white/20 hover:bg-white/40 px-2 py-0.5 rounded"
                                            >
                                                <CheckSquare size={12} /> Mark as Done
                                            </button>
                                        )}
                                    
                                </Link>
                            ))}
                        </div>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7" key={day.toString()}>
                    {days}
                </div>
            );
            days = [];
        }
        return <div className="border-r border-b border-border">{rows}</div>;
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="card p-4">
            <div className="flex items-center gap-2 mb-4">
                <Calendar className="text-primary" />
                <h3 className="text-lg font-semibold">Health Schedule</h3>
            </div>
            {renderHeader()}
            {renderDays()}
            {renderCells()}
            <div className="flex items-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                    <span>Pending</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span>Completed</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span>Missed</span>
                </div>
            </div>
            {showCompleteModal && selectedTask && (
                <Modal onClose={() => setShowCompleteModal(false)}>
                    <CompleteTaskModal 
                        task={selectedTask}
                        farmId={farmId}
                        onTaskCompleted={() => {
                            setShowCompleteModal(false);
                            fetchHealthTasks();
                        }}
                        onClose={() => setShowCompleteModal(false)}
                    />
                </Modal>
            )}
        </div>
    );
}