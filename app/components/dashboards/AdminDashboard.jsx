// app/components/dashboards/AdminDashboard.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { Users, Home, Briefcase, UserCheck, Download, Feather } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import SummaryCard from './SummaryCard';
import Link from 'next/link';
import LoadingSpinner from '../LoadingSpinner';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const RequestList = ({ requests, type }) => {
    if (!requests || requests.length === 0) {
        return <p className="text-[color:var(--muted-foreground)] text-center py-8">No pending {type} requests.</p>;
    }
    const viewLink = type === 'owners' ? '/admin/users' : '/admin/veterinarians';
    return (
        <ul className="divide-y divide-[color:var(--border)]">
            {requests.map(req => (
                <li key={req.id} className="py-3 flex justify-between items-center">
                    <div>
                        <p className="font-medium">{req.name}</p>
                        <p className="text-sm text-[color:var(--muted-foreground)]">{req.email}</p>
                    </div>
                    <Link href={viewLink} className="btn-primary text-sm">Review</Link>
                </li>
            ))}
        </ul>
    );
};

const exportToCSV = (data, filename) => {
    const csvContent = "data:text/csv;charset=utf-8,"
        + data.map(row => Object.values(row).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('owners');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/dashboard/admin');
        if (!res.ok) throw new Error('Failed to fetch admin data');
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

  const { summary, requests, analytics } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button onClick={() => exportToCSV(analytics.farmLocations, 'farm_locations_distribution')} className="btn-secondary flex items-center gap-2">
            <Download size={16} /> Export Summary
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard title="Total Users" value={summary.totalUsers} icon={<Users />} />
        <SummaryCard title="Total Farms" value={summary.totalFarms} icon={<Home />} />
        <SummaryCard title="Total Active Birds" value={summary.totalBirds.toLocaleString()} icon={<Feather />} />
        <SummaryCard title="Pending Approvals" value={(requests.owners.count || 0) + (requests.vets.count || 0)} icon={<UserCheck />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 card p-6">
            <h2 className="font-medium mb-4">User Growth (Last 6 Months)</h2>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="var(--primary)" name="New Users" />
                </BarChart>
            </ResponsiveContainer>
        </div>
        <div className="lg:col-span-2 card p-6">
            <h2 className="font-medium mb-4">Top Farm Locations</h2>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={analytics.farmLocations} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                        {analytics.farmLocations.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-medium">Pending Approvals</h2>
        <div className="flex border-b border-[color:var(--border)] mt-2 mb-4">
            <button onClick={() => setActiveTab('owners')} className={`px-4 py-2 font-medium flex items-center gap-2 ${activeTab === 'owners' ? 'text-[color:var(--primary)] border-b-2 border-[color:var(--primary)]' : 'text-[color:var(--muted-foreground)]'}`}>
                Owner Requests <span className="text-xs bg-[color:var(--muted)] px-1.5 py-0.5 rounded-full">{requests.owners.count || 0}</span>
            </button>
            <button onClick={() => setActiveTab('vets')} className={`px-4 py-2 font-medium flex items-center gap-2 ${activeTab === 'vets' ? 'text-[color:var(--primary)] border-b-2 border-[color:var(--primary)]' : 'text-[color:var(--muted-foreground)]'}`}>
                Vet Requests <span className="text-xs bg-[color:var(--muted)] px-1.5 py-0.5 rounded-full">{requests.vets.count || 0}</span>
            </button>
        </div>
        <div>
            {activeTab === 'owners' && <RequestList requests={requests.owners.data} type="owners" />}
            {activeTab === 'vets' && <RequestList requests={requests.vets.data} type="vets" />}
        </div>
      </div>
    </div>
  );
}
