// app/components/dashboards/ManagerDashboard.jsx
"use client";
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Feather, Droplet, AlertTriangle, ClipboardList } from 'lucide-react';
import SummaryCard from './SummaryCard';
import Alerts from './Alerts';

export default function ManagerDashboard({ farm, farmData }) {
  const { summary, production, alerts, tasks } = farmData;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{farm?.name} - Manager Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          title="Active Flocks" 
          value={summary.activeFlocks} 
          icon={<Feather />} 
        />
        <SummaryCard 
          title="Feed Inventory (kg)" 
          value={summary.feedInventory} 
          icon={<Droplet />} 
        />
        <SummaryCard 
          title="Mortality Rate" 
          value={`${summary.mortalityRate}%`}
          icon={<AlertTriangle />}
          className={summary.mortalityRate > 5 ? 'text-red-500' : 'text-green-500'}
        />
        <SummaryCard 
          title="Pending Tasks" 
          value={tasks.length} 
          icon={<ClipboardList />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h2 className="font-medium mb-4">Weekly Production Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={production}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="eggs" fill="var(--primary)" name="Eggs" />
              <Bar dataKey="meat" fill="var(--secondary)" name="Meat (kg)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-6">
          <Alerts alerts={alerts} />
        </div>
      </div>
    </div>
  );
}
