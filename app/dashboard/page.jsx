// app/dashboard/page.jsx
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useFarm } from '../context/FarmContext';
import AdminDashboard from '../components/dashboards/AdminDashboard';
import OwnerDashboard from '../components/dashboards/OwnerDashboard';
import ManagerDashboard from '../components/dashboards/ManagerDashboard';
import WorkerDashboard from '../components/dashboards/WorkerDashboard';
import VetDashboard from '../components/dashboards/VetDashboard';
import LoadingSpinner from '../components/LoadingSpinner';
import { differenceInDays } from 'date-fns';

// --- Business Logic for Alerts ---
const SCHEDULES = {
  BROILER: {
    VACCINATION: [
      { name: 'Marek\'s Disease', dueDays: 1 },
      { name: 'Newcastle (B1)', dueDays: 7 },
      { name: 'Gumboro (IBD)', dueDays: 14 },
      { name: 'Newcastle (LaSota)', dueDays: 28 },
    ],
    FEED: [
      { name: 'Starter', endDays: 14 },
      { name: 'Grower', endDays: 28 },
      { name: 'Finisher', endDays: Infinity },
    ],
  },
  LAYER: {
    VACCINATION: [
      { name: 'Marek\'s Disease', dueDays: 1 },
      { name: 'Newcastle (B1)', dueDays: 7 },
      { name: 'Gumboro (IBD)', dueDays: 14 },
      { name: 'Fowl Pox', dueDays: 42 },
      { name: 'Newcastle (LaSota) Boost', dueDays: 56 },
    ],
    FEED: [
      { name: 'Starter', endDays: 42 },
      { name: 'Grower', endDays: 112 },
      { name: 'Layer', endDays: Infinity },
    ],
  },
  default: { VACCINATION: [], FEED: [] }
};

const getExpectedFeedType = (ageInDays, feedSchedule) => {
  const feed = feedSchedule.find(f => ageInDays <= f.endDays);
  return feed ? feed.name : 'Unknown';
};

// --- Mock API Functions ---
const fetchAdminData = async () => {
  const users = await fetch('/api/admin/users').then(res => res.json());
  const farms = await fetch('/api/admin/farms').then(res => res.json());
  const ownerRequests = await fetch('/api/admin/owner-requests').then(res => res.json());
  return { users, farms, ownerRequests };
};

const fetchVetData = async () => {
  return [
    { id: 'farm-1', name: 'Green Valley Farms', location: 'California, USA', healthStatus: 'Good' },
    { id: 'farm-2', name: 'Sunrise Poultry', location: 'Texas, USA', healthStatus: 'Needs Attention' },
  ];
};

const fetchOwnerDashboardData = async (farmId) => {
  console.log(`Fetching owner data for farm ${farmId}`);
  const flocks = await fetch(`/api/farms/${farmId}/flocks`).then(res => res.json());
  const financials = await fetch(`/api/farms/${farmId}/financials`).then(res => res.json());
  const production = await fetch(`/api/farms/${farmId}/production?period=weekly`).then(res => res.json());
  const recentActivities = await fetch(`/api/farms/${farmId}/activity?limit=5`).then(res => res.json());

  const today = new Date();
  const alerts = [];
  const attentionFlocks = [];

  for (const flock of flocks) {
    if (flock.status !== 'ACTIVE') continue;

    const ageInDays = differenceInDays(today, new Date(flock.startDate));
    const flockType = flock.type.toUpperCase();
    const schedule = SCHEDULES[flockType] || SCHEDULES.default;
    let needsAttention = false;

    // 1. Check for overdue vaccinations
    const vaccinations = await fetch(`/api/farms/${farmId}/flocks/${flock.id}/vaccination-records`).then(res => res.json());
    const recordedVaccineNames = vaccinations.map(v => v.vaccine);

    for (const sched of schedule.VACCINATION) {
      if (ageInDays > sched.dueDays && !recordedVaccineNames.includes(sched.name)) {
        alerts.push({
          id: `vacc-${flock.id}-${sched.name}`,
          type: 'warning',
          title: `Vaccination Overdue: ${flock.name}`,
          message: `${sched.name} was due around day ${sched.dueDays}. Please record it.`,
        });
        needsAttention = true;
      }
    }

    // 2. Check for feed changes
    const expectedFeed = getExpectedFeedType(ageInDays, schedule.FEED);
    if (flock.currentFeedType !== expectedFeed) {
      alerts.push({
        id: `feed-${flock.id}`,
        type: 'info',
        title: `Feed Change Recommended: ${flock.name}`,
        message: `Flock is ${ageInDays} days old. Recommended to switch to ${expectedFeed}.`,
      });
      needsAttention = true;
    }
    
    if(needsAttention) {
        attentionFlocks.push({
            id: flock.id,
            name: flock.name,
            age: ageInDays,
            reason: alerts.find(a => a.id.includes(flock.id))?.title || 'Needs Review'
        });
    }
  }

  return {
    summary: {
      totalFlocks: flocks.length,
      activeBirds: flocks.reduce((acc, f) => acc + f.quantity, 0),
      eggProductionToday: production.summary.today,
      revenueThisMonth: financials.revenue.monthly,
      alertsCount: alerts.length,
    },
    production: production.chartData,
    recentActivities,
    alerts,
    attentionFlocks,
  };
};


export default function DashboardPage() {
  const { data: session, status } = useSession();
  const { currentFarm } = useFarm();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = useCallback(async () => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    try {
      setIsLoading(true);
      const userType = session.user?.userType;
      const role = currentFarm?.users?.find(u => u.userId === session.user?.id)?.role;
      let data;

      if (userType === 'ADMIN') {
        data = await fetchAdminData();
      } else if (userType === 'VET') {
        data = await fetchVetData();
      } else if (userType === 'FARMER' && currentFarm) {
        if (role === 'OWNER' || session.user.id === currentFarm.ownerId) {
          data = await fetchOwnerDashboardData(currentFarm.id);
        } else {
          data = await fetchFarmData(currentFarm.id); 
        }
      } else {
        data = { summary: {}, recentActivities: [], production: [], alerts: [], tasks: [], attentionFlocks: [] };
      }
      setDashboardData(data);
    } catch (err) {
      setError('Failed to load dashboard data.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [session, status, currentFarm, router]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (isLoading || status === 'loading') {
    return <LoadingSpinner />;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }
  
  if (status === 'unauthenticated') {
    return <p>Access Denied. Please sign in.</p>;
  }

  const renderDashboard = () => {
    const userType = session.user?.userType;
    const role = currentFarm?.users?.find(u => u.userId === session.user?.id)?.role;

    if (userType === 'ADMIN') {
      return <AdminDashboard {...dashboardData} />;
    }
    if (userType === 'VET') {
      return <VetDashboard accessibleFarms={dashboardData} />;
    }
    if (userType === 'FARMER') {
       if (!currentFarm) {
        return (
          <div className="text-center p-8">
            <h2 className="text-xl font-semibold">Welcome, {session.user.name}</h2>
            <p className="mt-2 text-[color:var(--muted-foreground)]">Please select or create a farm to get started.</p>
          </div>
        );
      }
      if (role === 'OWNER' || session.user.id === currentFarm.ownerId) {
        return <OwnerDashboard farm={currentFarm} farmData={dashboardData} />;
      }
      switch (role) {
        case 'MANAGER':
          return <ManagerDashboard farm={currentFarm} farmData={dashboardData} />;
        case 'WORKER':
          return <WorkerDashboard user={session.user} tasks={dashboardData.tasks} alerts={dashboardData.alerts} />;
        default:
          return <p>Your role is not configured for this farm's dashboard.</p>;
      }
    }
    return <p>Unable to determine your role.</p>;
  };

  return <div>{renderDashboard()}</div>;
}

const fetchFarmData = async (farmId) => {
  console.log(`Fetching basic data for farm ${farmId}`);
  return {
    summary: {
      activeFlocks: 5,
      feedInventory: 4500,
      mortalityRate: 2.3,
    },
    production: [
      { name: 'Mon', eggs: 4000, meat: 2.1 },
      { name: 'Tue', eggs: 3000, meat: 2.2 },
    ],
    alerts: [
        { id: 1, type: 'info', title: 'Vaccination Due', message: 'Flock C-03 is due for Newcastle vaccination tomorrow.' },
    ],
    tasks: [
      { id: 1, description: 'Clean the chicken coop in Barn A', status: 'Pending' },
      { id: 2, description: 'Distribute feed to Layer Flock B', status: 'In Progress' },
    ],
  };
};

