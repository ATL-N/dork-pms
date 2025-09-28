// app/components/flocks/FlockDetails.jsx
"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { differenceInDays, format, addDays } from 'date-fns';
import { Droplet, Egg, Activity, Shield, BarChart as BarChartIcon, ExternalLink, DollarSign, Calendar } from 'lucide-react';

// Helper to process and combine data for the chart
const processFlockDataForChart = (flock) => {
    if (!flock) return [];

    const combinedData = {};
    const startDate = new Date(flock.startDate);

    const processRecords = (records, key, valueField) => {
        (records || []).forEach(rec => {
            const day = differenceInDays(new Date(rec.date), startDate);
            if (!combinedData[day]) combinedData[day] = { day };
            combinedData[day][key] = (combinedData[day][key] || 0) + rec[valueField];
        });
    };

    processRecords(flock.mortalityRecords, 'mortality', 'quantity');
    processRecords(flock.feedConsumption, 'feed', 'quantity');
    processRecords(flock.birdResales, 'birdsSold', 'quantity');

    if (flock.type === 'LAYER') {
        processRecords(flock.eggProductionRecords, 'eggs', 'totalEggs');
    }
    
    (flock.growthRecords || []).forEach(rec => {
        const day = differenceInDays(new Date(rec.date), startDate);
        if (!combinedData[day]) combinedData[day] = { day };
        combinedData[day].weight = rec.weight;
    });

    return Object.values(combinedData).sort((a, b) => a.day - b.day);
};

const tooltipStyle = {
    backgroundColor: 'var(--card)',
    color: 'var(--foreground)',
    border: '1px solid var(--border)',
};

const formatDateRange = (task) => {
    const startDate = new Date(task.scheduledDate);
    if (!task.durationInDays || task.durationInDays <= 1) {
        return format(startDate, 'MMM dd');
    }
    const endDate = addDays(startDate, task.durationInDays - 1);
    return `${format(startDate, 'MMM dd')} - ${format(endDate, 'MMM dd')}`;
};


export default function FlockDetails({ 
    flock, 
    onRecordFeed,
    onRecordMortality, 
    onRecordWeight, 
    onRecordHealthEvent,
    onRecordEggs,
    onRecordBirdSale
}) {
    
    const chartData = processFlockDataForChart(flock);
    const [upcomingTasks, setUpcomingTasks] = useState([]);
    const [isLoadingSchedule, setIsLoadingSchedule] = useState(true);

    useEffect(() => {
        const fetchSchedule = async () => {
            if (!flock?.id) return;
            setIsLoadingSchedule(true);
            try {
                const res = await fetch(`/api/farms/${flock.farmId}/health-tasks`);
                if (!res.ok) throw new Error('Failed to fetch health schedule');
                const allTasks = await res.json();
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const relevantTasks = allTasks
                    .filter(task => 
                        task.flockId === flock.id && 
                        task.status !== 'COMPLETED' &&
                        new Date(task.scheduledDate) >= today
                    )
                    .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
                
                setUpcomingTasks(relevantTasks);
            } catch (error) {
                console.error("Error fetching health schedule:", error);
            } finally {
                setIsLoadingSchedule(false);
            }
        };

        fetchSchedule();
    }, [flock?.id, flock?.farmId]);


    const actionButtons = [
        { label: "Record Feed", icon: Droplet, onClick: onRecordFeed, type: 'all' },
        { label: "Record Mortality", icon: Activity, onClick: onRecordMortality, type: 'all' },
        { label: "Record Weight", icon: BarChartIcon, onClick: onRecordWeight, type: 'all' },
        { label: "Record Health Event", icon: Shield, onClick: onRecordHealthEvent, type: 'all' },
        { label: "Record Bird Sale", icon: DollarSign, onClick: onRecordBirdSale, type: 'all' },
        { label: "Record Eggs", icon: Egg, onClick: onRecordEggs, type: 'LAYER' },
    ];

    return (
        <div className="space-y-6">
            {flock.status === 'active' && (
                <div className="card p-4">
                    <h3 className="font-medium mb-3 text-center">Quick Actions</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                        {actionButtons.filter(btn => btn.type === 'all' || btn.type === flock.type).map(btn => (
                            <button key={btn.label} className="btn-primary flex flex-col items-center justify-center h-20 text-center" onClick={btn.onClick}>
                                <btn.icon size={20} />
                                <span className="text-xs mt-1">{btn.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-4">
                    <h3 className="font-medium mb-4">Weight & Feed Performance</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" name="Age (days)" />
                                <YAxis yAxisId="left" stroke="#8884d8" label={{ value: 'Weight (g)', angle: -90, position: 'insideLeft' }} />
                                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" label={{ value: 'Feed (kg)', angle: -90, position: 'insideRight' }} />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Legend />
                                <Line yAxisId="right" type="monotone" dataKey="feed" name="Feed Consumed (kg)" stroke="#82ca9d" />
                                <Line yAxisId="left" type="monotone" dataKey="weight" name="Avg Weight (g)" stroke="#8884d8" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                {flock.type === 'LAYER' ? (
                    <div className="card p-4">
                        <h3 className="font-medium mb-4">Production & Mortality</h3>
                         <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="day" name="Age (days)" />
                                    <YAxis yAxisId="left" stroke="#ffc658" label={{ value: 'Eggs', angle: -90, position: 'insideLeft' }} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#ff7300" label={{ value: 'Mortality', angle: -90, position: 'insideRight' }} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Legend />
                                    <Line yAxisId="left" type="monotone" dataKey="eggs" name="Eggs Collected" stroke="#ffc658" />
                                    <Line yAxisId="right" type="monotone" dataKey="mortality" name="Mortalities" stroke="#ff7300" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                ) : (
                    <div className="card p-4">
                        <h3 className="font-medium mb-4">Sales & Mortality</h3>
                         <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="day" name="Age (days)" />
                                    <YAxis yAxisId="left" stroke="#3498db" label={{ value: 'Birds Sold', angle: -90, position: 'insideLeft' }} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#e74c3c" label={{ value: 'Mortality', angle: -90, position: 'insideRight' }} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Legend />
                                    <Line yAxisId="left" type="monotone" dataKey="birdsSold" name="Birds Sold" stroke="#3498db" />
                                    <Line yAxisId="right" type="monotone" dataKey="mortality" name="Mortalities" stroke="#e74c3c" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                <div className="card p-4 flex flex-col">
                    <h3 className="font-medium mb-3 flex items-center gap-2"><Calendar size={18} /> Upcoming Health Schedule</h3>
                    <div className="overflow-y-auto flex-grow max-h-96">
                        {isLoadingSchedule ? <p className="text-sm text-center text-[color:var(--muted-foreground)]">Loading schedule...</p> : upcomingTasks.length > 0 ? (
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-[color:var(--muted-foreground)] uppercase bg-[color:var(--muted)]">
                                    <tr>
                                        <th scope="col" className="px-4 py-3">Age (Day)</th>
                                        <th scope="col" className="px-4 py-3">Date</th>
                                        <th scope="col" className="px-4 py-3">Task</th>
                                        <th scope="col" className="px-4 py-3">Method</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {upcomingTasks.map((task) => {
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        const startDate = new Date(task.scheduledDate);
                                        startDate.setHours(0, 0, 0, 0);
                                        const endDate = addDays(startDate, task.durationInDays || 1);
                                        const isActive = today >= startDate && today < endDate;

                                        return (
                                            <tr key={task.id} className={`border-b border-[color:var(--border)] ${isActive ? 'bg-blue-500/20' : ''}`}>
                                                <td className="px-4 py-3 font-medium">{differenceInDays(startDate, new Date(flock.startDate))}</td>
                                                <td className="px-4 py-3 font-semibold text-xs">{formatDateRange(task)}</td>
                                                <td className="px-4 py-3">{task.taskName}</td>
                                                <td className="px-4 py-3 text-[color:var(--muted-foreground)]">{task.method}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : <p className="text-sm text-center text-[color:var(--muted-foreground)] pt-4">No upcoming tasks on the schedule.</p>}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-4">
                    <h3 className="font-medium mb-3 flex items-center gap-2"><Activity size={18} /> Recent Activity</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {flock.healthTasks?.filter(t => t.status === 'COMPLETED').length > 0 ? flock.healthTasks.filter(t => t.status === 'COMPLETED').map((task, index) => (
                            <div key={index} className="text-sm flex justify-between items-center p-2 border-b border-[color:var(--border)]">
                                <span>{task.taskName} ({task.taskType})</span>
                                <span className="text-[color:var(--muted-foreground)]">{format(new Date(task.completedDate), 'yyyy-MM-dd')}</span>
                            </div>
                        )) : <p className="text-sm text-[color:var(--muted-foreground)]">No recent health events recorded.</p>}
                         <div className="pt-2">
                             <Link href={`/health?flockId=${flock.id}`} className="flex items-center justify-center text-sm p-2 rounded-md hover:bg-[color:var(--accent)] text-[color:var(--primary)] font-semibold">
                                <span>View Full Health History</span>
                                <ExternalLink size={16} className="ml-2" />
                            </Link>
                         </div>
                    </div>
                </div>
                 <div className="card p-4">
                     <h3 className="font-medium mb-3">Quick Links</h3>
                     <div className="space-y-2">
                        <Link href={`/production?flockId=${flock.id}`} className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-[color:var(--accent)]">
                            <span>View Full Production Data</span>
                            <ExternalLink size={16} />
                        </Link>
                     </div>
                </div>
            </div>
        </div>
    );
}
