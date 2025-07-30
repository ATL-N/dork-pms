// app/components/dashboards/AdminDashboard.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { Users, Home, UserCheck, Clock } from 'lucide-react';
import SummaryCard from './SummaryCard';
import RecentActivity from './RecentActivity';
import Link from 'next/link';
import LoadingSpinner from '../LoadingSpinner';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const { users, farms, ownerRequests } = data;

  const recentActivities = (ownerRequests.requests || []).slice(0, 5).map(req => ({
    id: req.id,
    action: `New owner request from ${req.name || req.email}`,
    time: new Date(req.createdAt).toLocaleDateString(),
    href: '/admin' // Link to the admin page where they can approve
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          title="Total Users" 
          value={users.total} 
          icon={<Users />} 
        />
        <SummaryCard 
          title="Total Farms" 
          value={farms.total} 
          icon={<Home />} 
        />
        <SummaryCard 
          title="Pending Requests" 
          value={ownerRequests.count} 
          icon={<Clock />} 
          className={ownerRequests.count > 0 ? 'text-yellow-500' : ''}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h2 className="font-medium mb-4">Pending Owner Requests</h2>
          {ownerRequests.count > 0 ? (
            <ul className="divide-y divide-[color:var(--border)]">
              {ownerRequests.requests.map(req => (
                <li key={req.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{req.name}</p>
                    <p className="text-sm text-[color:var(--muted-foreground)]">{req.email}</p>
                  </div>
                  <Link href="/admin" className="btn-primary text-sm">
                    View Request
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[color:var(--muted-foreground)]">No pending requests.</p>
          )}
        </div>
        <div className="card p-6">
          <h2 className="font-medium mb-4">Recent Activity</h2>
          <RecentActivity activities={recentActivities} />
        </div>
      </div>
    </div>
  );
}
