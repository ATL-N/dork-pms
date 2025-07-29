// app/components/dashboards/AdminDashboard.jsx
"use client";
import React from 'react';
import { Users, Home, UserCheck, Clock } from 'lucide-react';
import SummaryCard from './SummaryCard';
import RecentActivity from './RecentActivity';
import Link from 'next/link';

export default function AdminDashboard({ users = [], farms = [], ownerRequests = [] }) {
  const recentActivities = ownerRequests.slice(0, 5).map(req => ({
    id: req.id,
    action: `New owner request from ${req.user.name || req.user.email}`,
    time: new Date(req.createdAt).toLocaleDateString(),
    href: '/staff' // Link to the staff page where they can approve
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          title="Total Users" 
          value={users.length} 
          icon={<Users />} 
        />
        <SummaryCard 
          title="Total Farms" 
          value={farms.length} 
          icon={<Home />} 
        />
        <SummaryCard 
          title="Approved Owners" 
          value={users.filter(u => u.ownerApprovalStatus === 'APPROVED').length} 
          icon={<UserCheck />} 
        />
        <SummaryCard 
          title="Pending Requests" 
          value={ownerRequests.length} 
          icon={<Clock />} 
          className={ownerRequests.length > 0 ? 'text-yellow-500' : ''}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h2 className="font-medium mb-4">Pending Owner Requests</h2>
          {ownerRequests.length > 0 ? (
            <ul className="divide-y divide-[color:var(--border)]">
              {ownerRequests.map(req => (
                <li key={req.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{req.user.name}</p>
                    <p className="text-sm text-[color:var(--muted-foreground)]">{req.user.email}</p>
                  </div>
                  <Link href="/staff" className="btn-primary text-sm">
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
