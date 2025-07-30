// app/components/dashboards/ManagerDashboard.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Feather, Droplet, AlertTriangle, ClipboardList } from 'lucide-react';
import SummaryCard from './SummaryCard';
import Alerts from './Alerts';
import LoadingSpinner from '../LoadingSpinner';
import { useFarm } from '@/app/context/FarmContext';

export default function ManagerDashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentFarm } = useFarm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // The manager dashboard can show either aggregated data or specific farm data
        // For now, we fetch aggregated data as requested.
        const res = await fetch(`/api/dashboard/manager`);
        if (!res.ok) throw new Error('Failed to fetch manager data');
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

  if (isLoading) return <LoadingSpinner />;
  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!data) return null;

  const { summary, production, alerts, tasks } = data;
  const dashboardTitle = currentFarm ? `${currentFarm.name} - Manager` : "Manager's Dashboard";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{dashboardTitle}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          title="Total Active Flocks" 
          value={summary.activeFlocks} 
          icon={<Feather />} 
        />
        <SummaryCard 
          title="Feed Inventory (kg)" 
          value={summary.feedInventory} 
          icon={<Droplet />} 
          tooltip="This is a placeholder value"
        />
        <SummaryCard 
          title="Avg. Mortality Rate" 
          value={`${summary.mortalityRate}%`}
          icon={<AlertTriangle />}
          className={summary.mortalityRate > 5 ? 'text-red-500' : 'text-green-500'}
          tooltip="This is a placeholder value"
        />
        <SummaryCard 
          title="Total Pending Tasks" 
          value={summary.pendingTasks} 
          icon={<ClipboardList />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h2 className="font-medium mb-4">Production Overview</h2>
          <p className="text-center text-[color:var(--muted-foreground)] h-full flex items-center justify-center">
            Production data is not yet available in the aggregated view.
          </p>
          {/* <ResponsiveContainer width="100%" height={300}>
            <BarChart data={production}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="eggs" fill="var(--primary)" name="Eggs" />
            </BarChart>
          </ResponsiveContainer> */}
        </div>
        <div className="card p-6">
          <h2 className="font-medium mb-4">Alerts</h2>
          <Alerts alerts={alerts} />
           {alerts.length === 0 && <p className="text-[color:var(--muted-foreground)]">No alerts at the moment.</p>}
        </div>
      </div>
    </div>
  );
}
