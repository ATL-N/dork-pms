// app/admin/ads/page.jsx
"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusCircle, Edit, Trash2, Eye, BarChart2 } from 'lucide-react';
import LoadingSpinner from '@/app/components/LoadingSpinner';

const fetchAds = async () => {
  try {
    const res = await fetch('/api/admin/ads');
    if (!res.ok) {
      throw new Error('Failed to fetch ads');
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching ads:", error);
    return [];
  }
};

export default function AdsManagementPage() {
  const [ads, setAds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAds = async () => {
      setIsLoading(true);
      const adsData = await fetchAds();
      setAds(adsData);
      setIsLoading(false);
    };
    loadAds();
  }, []);

  const handleDelete = async (adId) => {
    if (!confirm('Are you sure you want to delete this ad?')) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/ads/${adId}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('Failed to delete ad');
      }
      setAds(ads.filter(ad => ad.id !== adId));
      alert('Ad deleted successfully');
    } catch (error) {
      console.error('Error deleting ad:', error);
      alert('Error deleting ad.');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Advertisements</h1>
        <Link href="/admin/ads/form" className="btn-primary flex items-center gap-2">
          <PlusCircle size={16} /> Create New Ad
        </Link>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b">
              <tr>
                <th className="p-4">Title</th>
                <th className="p-4">Status</th>
                <th className="p-4">Views</th>
                <th className="p-4">Clicks</th>
                <th className="p-4">CTR</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ads.map(ad => (
                <tr key={ad.id} className="border-b">
                  <td className="p-4 font-medium">{ad.title}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ad.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {ad.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 flex items-center gap-1"><Eye size={14} /> {ad.viewCount.toLocaleString()}</td>
                  <td className="p-4 flex items-center gap-1"><BarChart2 size={14} /> {ad.clickCount.toLocaleString()}</td>
                  <td className="p-4">{ad.viewCount > 0 ? ((ad.clickCount / ad.viewCount) * 100).toFixed(2) : '0.00'}%</td>
                  <td className="p-4 flex gap-2">
                    <Link href={`/admin/ads/form?id=${ad.id}`} className="btn-secondary p-2">
                      <Edit size={16} />
                    </Link>
                    <button onClick={() => handleDelete(ad.id)} className="btn-danger p-2">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
