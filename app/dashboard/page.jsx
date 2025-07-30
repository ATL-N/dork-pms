// app/dashboard/page.jsx
"use client";
import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useFarm } from '../context/FarmContext';
import AdminDashboard from '../components/dashboards/AdminDashboard';
import OwnerDashboard from '../components/dashboards/OwnerDashboard';
import ManagerDashboard from '../components/dashboards/ManagerDashboard';
import WorkerDashboard from '../components/dashboards/WorkerDashboard';
import VetDashboard from '../components/dashboards/VetDashboard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const { currentFarm } = useFarm();
  const router = useRouter();

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return <LoadingSpinner />;
  }
  
  const renderDashboard = () => {
    const userType = session.user?.userType;
    
    if (userType === 'ADMIN') {
      return <AdminDashboard />;
    }
    
    if (userType === 'VET') {
      return <VetDashboard />;
    }

    if (userType === 'FARMER') {
      // For FARMER types, we first check if a farm is selected.
      if (!currentFarm) {
        // This could be a user who is part of multiple farms but hasn't selected one.
        // Or a new user who hasn't created/joined a farm yet.
        // The OwnerDashboard will handle the case where there are no farms.
        const isOwnerAnywhere = session.user?.isOwner; // This assumes session token has this info
        if(isOwnerAnywhere || session.user.farms.some(f => f.role === 'OWNER')) {
            return <OwnerDashboard />;
        }
        return (
          <div className="text-center p-8">
            <h2 className="text-xl font-semibold">Welcome, {session.user.name}</h2>
            <p className="mt-2 text-[color:var(--muted-foreground)]">Please select a farm from the dropdown to view its dashboard.</p>
          </div>
        );
      }

      // If a farm is selected, determine role within that farm.
      const role = currentFarm.users?.find(u => u.userId === session.user?.id)?.role;
      const isOwnerOfCurrentFarm = currentFarm.ownerId === session.user?.id;

      if (isOwnerOfCurrentFarm || role === 'OWNER') {
        return <OwnerDashboard />;
      }
      if (role === 'MANAGER') {
        return <ManagerDashboard farm={currentFarm} />;
      }
      if (role === 'WORKER') {
        return <WorkerDashboard user={session.user} farm={currentFarm} />;
      }

      // Default for FARMER in a farm without a specific role (should not happen)
      return <p>Your role is not configured for this farm's dashboard.</p>;
    }

    return <p>Unable to determine your dashboard.</p>;
  };

  return <div>{renderDashboard()}</div>;
}

