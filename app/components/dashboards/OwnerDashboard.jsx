// app/components/dashboards/OwnerDashboard.jsx
"use client";
import React from 'react';
import Link from 'next/link';
import { DollarSign, Feather, Users, TrendingUp, AlertTriangle, ChevronRight } from 'lucide-react';
import SummaryCard from './SummaryCard';
import RecentActivity from './RecentActivity';
import ProductionChart from './ProductionChart';
import Alerts from './Alerts';

export default function OwnerDashboard({ farm, farmData }) {
  // Destructure with default values to prevent errors if farmData is null
  const { 
    summary = {}, 
    recentActivities = [], 
    production = [], 
    alerts = [], 
    attentionFlocks = [] 
  } = farmData || {};

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{farm?.name || 'Owner'} Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          title="Total Flocks" 
          value={summary.totalFlocks ?? 'N/A'}
          icon={<Feather />} 
        />
        <SummaryCard 
          title="Total Birds" 
          value={summary.activeBirds ?? 'N/A'}
          icon={<Users />} 
        />
        <SummaryCard 
          title="Alerts" 
          value={summary.alertsCount ?? 'N/A'}
          icon={<AlertTriangle />}
          className={summary.alertsCount > 0 ? 'text-yellow-500' : ''}
        />
        <SummaryCard 
          title="Revenue (This Month)" 
          value={summary.revenueThisMonth ?? 'N/A'}
          icon={<DollarSign />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h2 className="font-medium mb-4">Weekly Production Overview</h2>
          {production.length > 0 ? (
            <ProductionChart data={production} />
          ) : (
            <p className="text-center text-[color:var(--muted-foreground)] h-full flex items-center justify-center">No production data available.</p>
          )}
        </div>
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-medium mb-4">Flocks Requiring Action</h2>
            <div className="space-y-3">
              {attentionFlocks.length > 0 ? attentionFlocks.map(flock => (
                <Link href={`/flocks?flockId=${flock.id}`} key={flock.id}>
                  <div className="p-3 border rounded-lg hover:bg-[color:var(--muted)] cursor-pointer flex justify-between items-center">
                    <div>
                      <p className="font-bold">{flock.name}</p>
                      <p className="text-sm text-[color:var(--muted-foreground)]">{flock.reason}</p>
                    </div>
                    <ChevronRight size={20} />
                  </div>
                </Link>
              )) : <p className="text-[color:var(--muted-foreground)]">All flocks are up to date.</p>}
            </div>
          </div>
          <div className="card p-6">
            <h2 className="font-medium mb-4">General Alerts</h2>
            <Alerts alerts={alerts.filter(a => !a.id.startsWith('vacc-') && !a.id.startsWith('feed-'))} />
          </div>
        </div>
      </div>
      
      <div className="card p-6">
        <h2 className="font-medium mb-4">Recent Farm Activity</h2>
        <RecentActivity activities={recentActivities} />
      </div>
    </div>
  );
}
