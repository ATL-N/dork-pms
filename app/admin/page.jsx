"use client";
import React, { useState, useEffect } from 'react';
import AdminDashboard from '@/app/components/dashboards/AdminDashboard';
import LoadingSpinner from '@/app/components/LoadingSpinner';

const fetchAdminData = async () => {
  try {
    const usersRes = await fetch('/api/admin/users');
    const farmsRes = await fetch('/api/admin/farms');
    const ownerRequestsRes = await fetch('/api/admin/owner-requests');

    if (!usersRes.ok || !farmsRes.ok || !ownerRequestsRes.ok) {
      // It's better to check for ok status and not just assume 200
      throw new Error('Failed to fetch admin data');
    }

    const users = await usersRes.json();
    const farms = await farmsRes.json();
    const ownerRequests = await ownerRequestsRes.json();
    
    return { users, farms, ownerRequests };
  } catch (error) {
    console.error("Error fetching admin data:", error);
    // Return a default state or handle the error as appropriate
    return { users: [], farms: [], ownerRequests: [] };
  }
};

export default function AdminPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const adminData = await fetchAdminData();
      setData(adminData);
      setIsLoading(false);
    };
    loadData();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!data) {
    return <p>Error loading data.</p>;
  }

  return <AdminDashboard {...data} />;
}