// app/components/dashboards/VetDashboard.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { Stethoscope, ArrowRight, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import SummaryCard from './SummaryCard';
import Alerts from './Alerts';
import LoadingSpinner from '../LoadingSpinner';

export default function VetDashboard() {
  const [accessibleFarms, setAccessibleFarms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/dashboard/vet');
        if (!res.ok) throw new Error('Failed to fetch vet data');
        const jsonData = await res.json();
        setAccessibleFarms(jsonData);
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

  const farmsNeedingAttention = accessibleFarms.filter(
    farm => farm.healthStatus === 'Needs Attention'
  );

  const alerts = farmsNeedingAttention.map(farm => ({
    id: farm.id,
    type: 'warning',
    title: farm.name,
    message: 'This farm\'s health status needs attention. Review health records.',
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Veterinarian Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          title="Accessible Farms" 
          value={accessibleFarms.length} 
          icon={<Stethoscope />} 
        />
        <SummaryCard 
          title="Farms Needing Attention" 
          value={farmsNeedingAttention.length} 
          icon={<AlertTriangle />}
          className={farmsNeedingAttention.length > 0 ? 'text-yellow-500' : ''}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h2 className="font-medium mb-4">Farms with Access</h2>
          <div className="space-y-3">
            {accessibleFarms.length > 0 ? accessibleFarms.map(farm => (
              <Link href={`/farm/${farm.id}/health`} key={farm.id}>
                <div className="p-4 border rounded-lg hover:bg-[color:var(--muted)] cursor-pointer flex justify-between items-center">
                  <div>
                    <p className="font-bold">{farm.name}</p>
                    <p className="text-sm text-[color:var(--muted-foreground)]">{farm.location}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`badge ${
                      farm.healthStatus === 'Good' || farm.healthStatus === 'Excellent'
                        ? 'badge-success' 
                        : 'badge-warning'
                    }`}>
                      {farm.healthStatus}
                    </span>
                    <ArrowRight size={20} />
                  </div>
                </div>
              </Link>
            )) : <p className="text-[color:var(--muted-foreground)]">No farms have granted you access yet.</p>}
          </div>
        </div>
        <div className="card p-6">
          <Alerts alerts={alerts} />
        </div>
      </div>
    </div>
  );
}