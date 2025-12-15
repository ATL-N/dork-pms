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

// const DownloadAppBanner = () => {
//   const apkUrl = "https://f003.backblazeb2.com/file/dorkpms/nkokoapp-v2.apk";
//   return (
//     <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg p-4 my-4 shadow-md flex items-center justify-between">
//       <div>
//         <h3 className="font-bold text-lg">Get the Mobile App!</h3>
//         <p className="text-sm">Download the NkokoApp for a better mobile experience.</p>
//       </div>
//       <a
//         href={apkUrl}
//         download
//         className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
//       >
//         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//           <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
//         </svg>
//         Download APK
//       </a>
//     </div>
//   );
// };


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

  return (
    <div>
      {/* <DownloadAppBanner /> */}
      {renderDashboard()}
    </div>
  );
}

