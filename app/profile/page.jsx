'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useNotification } from '@/app/context/NotificationContext';

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const { addNotification } = useNotification();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState(''); // For FARMER
  const [specialization, setSpecialization] = useState(''); // For VET
  const [licenseNumber, setLicenseNumber] = useState(''); // For VET
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setName(session.user.name || '');
      setEmail(session.user.email || '');
      // Fetch additional profile data if available
      const fetchProfileData = async () => {
        try {
          const res = await fetch(`/api/user/${session.user.id}/profile`); // You'll need to create this GET API
          if (res.ok) {
            const data = await res.json();
            if (session.user.userType === 'FARMER') {
              setContact(data.contact || '');
            } else if (session.user.userType === 'VET') {
              setSpecialization(data.specialization || '');
              setLicenseNumber(data.licenseNumber || '');
            }
          }
        } catch (err) {
          console.error("Failed to fetch profile data:", err);
        }
      };
      fetchProfileData();
    }
  }, [session, status]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      name,
      email,
    };

    if (session.user.userType === 'FARMER') {
      payload.contact = contact;
    } else if (session.user.userType === 'VET') {
      payload.specialization = specialization;
      payload.licenseNumber = licenseNumber;
    }

    try {
      const response = await fetch(`/api/user/${session.user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      // Update session data if necessary
      await update({ name, email }); // Update name and email in session

      addNotification('Profile updated successfully!', 'success');
    } catch (err) {
      addNotification(`Error: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return <div className="p-6">Loading profile...</div>;
  }

  if (!session) {
    return <div className="p-6 text-red-500">You must be logged in to view this page.</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {session.user.userType === 'FARMER' && (
          <div>
            <label htmlFor="contact" className="block text-sm font-medium text-gray-700">Contact Information</label>
            <input
              type="text"
              id="contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        )}

        {session.user.userType === 'VET' && (
          <>
            <div>
              <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">Specialization</label>
              <input
                type="text"
                id="specialization"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">License Number</label>
              <input
                type="text"
                id="licenseNumber"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </>
        )}


        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isLoading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
