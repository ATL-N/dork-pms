// app/components/flocks/FlockDetails.jsx
"use client";
import React from 'react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { differenceInDays, format } from 'date-fns';
import { Droplet, Egg, Activity, Shield, BarChart as BarChartIcon, ExternalLink, DollarSign } from 'lucide-react';

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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-4">
                    <h3 className="font-medium mb-3">Recent Health Events</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {flock.healthTasks?.length > 0 ? flock.healthTasks.map((task, index) => (
                            <div key={index} className="text-sm flex justify-between items-center p-2 border-b border-[color:var(--border)]">
                                <span>{task.taskName} ({task.taskType})</span>
                                <span className="text-[color:var(--muted-foreground)]">{format(new Date(task.completedDate), 'yyyy-MM-dd')}</span>
                            </div>
                        )) : <p className="text-sm text-[color:var(--muted-foreground)]">No health events recorded.</p>}
                    </div>
                </div>
                <div className="card p-4">
                     <h3 className="font-medium mb-3">Quick Links</h3>
                     <div className="space-y-2">
                        <Link href={`/health?flockId=${flock.id}`} className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-[color:var(--accent)]">
                            <span>View Full Health History</span>
                            <ExternalLink size={16} />
                        </Link>
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
