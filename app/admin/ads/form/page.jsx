// app/admin/ads/form/page.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoadingSpinner from '@/app/components/LoadingSpinner';

export default function AdFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const adId = searchParams.get('id');

  const [formData, setFormData] = useState({
    title: '',
    body: '',
    imageUrl: '',
    callToActionText: '',
    callToActionUrl: '',
    priority: 10,
    isActive: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!adId);

  useEffect(() => {
    if (adId) {
      const fetchAd = async () => {
        try {
          const res = await fetch(`/api/admin/ads/${adId}`);
          if (!res.ok) throw new Error('Failed to fetch ad data');
          const adData = await res.json();
          setFormData(adData);
        } catch (error) {
          console.error('Error fetching ad:', error);
          alert('Could not load ad data for editing.');
        } finally {
          setIsFetching(false);
        }
      };
      fetchAd();
    }
  }, [adId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value, 10) : value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const url = adId ? `/api/admin/ads/${adId}` : '/api/admin/ads';
    const method = adId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save ad');
      }

      alert(`Ad successfully ${adId ? 'updated' : 'created'}!`);
      router.push('/admin/ads');
    } catch (error) {
      console.error('Error saving ad:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{adId ? 'Edit Advertisement' : 'Create New Advertisement'}</h1>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
          <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} className="input w-full" required />
        </div>
        <div>
          <label htmlFor="body" className="block text-sm font-medium mb-1">Body/Description</label>
          <textarea name="body" id="body" value={formData.body} onChange={handleChange} className="input w-full" rows="3"></textarea>
        </div>
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium mb-1">Image URL</label>
          <input type="url" name="imageUrl" id="imageUrl" value={formData.imageUrl} onChange={handleChange} className="input w-full" required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="callToActionText" className="block text-sm font-medium mb-1">Call to Action Text</label>
            <input type="text" name="callToActionText" id="callToActionText" value={formData.callToActionText} onChange={handleChange} className="input w-full" required />
          </div>
          <div>
            <label htmlFor="callToActionUrl" className="block text-sm font-medium mb-1">Call to Action URL</label>
            <input type="url" name="callToActionUrl" id="callToActionUrl" value={formData.callToActionUrl} onChange={handleChange} className="input w-full" required />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="priority" className="block text-sm font-medium mb-1">Priority</label>
                <input type="number" name="priority" id="priority" value={formData.priority} onChange={handleChange} className="input w-full" min="1" required />
                <p className="text-xs text-gray-500 mt-1">Higher number means higher priority.</p>
            </div>
            <div className="flex items-center pt-6">
                <input type="checkbox" name="isActive" id="isActive" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                <label htmlFor="isActive" className="ml-2 block text-sm">Active</label>
            </div>
        </div>
        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => router.back()} className="btn-secondary" disabled={isLoading}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Ad'}
          </button>
        </div>
      </form>
    </div>
  );
}
