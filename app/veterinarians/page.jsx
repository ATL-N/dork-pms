// app/veterinarians/page.jsx
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Stethoscope, Star, MapPin } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const VetCard = ({ vet }) => (
  <div className="card p-4 flex flex-col sm:flex-row items-start gap-4">
    <img src={vet.image || '/default-avatar.png'} alt={vet.name} className="w-24 h-24 rounded-full object-cover border-2 border-[color:var(--primary)]" />
    <div className="flex-grow">
      <h3 className="text-xl font-bold">{vet.name}</h3>
      <p className="text-[color:var(--accent)] font-semibold">{vet.vetProfile.specialization}</p>
      <div className="flex items-center gap-2 text-yellow-500 my-1">
        <Star size={18} />
        <span>{vet.vetProfile.averageRating.toFixed(1)} ({vet.vetProfile.ratingCount} reviews)</span>
      </div>
      <div className="flex items-center gap-2 text-[color:var(--muted-foreground)]">
        <MapPin size={16} />
        <span>{vet.profile?.country || 'Global'}</span>
      </div>
      <a href={`mailto:${vet.email}`} className="btn-primary mt-3 inline-block">Contact</a>
    </div>
  </div>
);

export default function VeterinariansPage() {
  const [vets, setVets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');

  useEffect(() => {
    const fetchVets = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/veterinarians');
        if (!res.ok) throw new Error('Failed to fetch veterinarians');
        const data = await res.json();
        setVets(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVets();
  }, []);

  const specializations = useMemo(() => {
    const allSpecs = vets.map(v => v.vetProfile.specialization).filter(Boolean);
    return [...new Set(allSpecs)];
  }, [vets]);

  const filteredVets = useMemo(() => {
    return vets.filter(vet => {
      const matchesSearch = vet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (vet.profile?.country || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpec = !specializationFilter || vet.vetProfile.specialization === specializationFilter;
      return matchesSearch && matchesSpec;
    });
  }, [vets, searchTerm, specializationFilter]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <p className="text-red-500 text-center p-8">{error}</p>;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="text-center mb-8">
        <Stethoscope className="mx-auto h-12 w-12 text-[color:var(--primary)]" />
        <h1 className="text-4xl font-bold mt-2">Find a Veterinarian</h1>
        <p className="text-lg text-[color:var(--muted-foreground)] mt-2">Browse our network of verified poultry health experts.</p>
      </div>

      <div className="card p-4 mb-6 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by name or country..."
          className="input flex-grow"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select
          className="input"
          value={specializationFilter}
          onChange={e => setSpecializationFilter(e.target.value)}
        >
          <option value="">All Specializations</option>
          {specializations.map(spec => <option key={spec} value={spec}>{spec}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredVets.length > 0 ? (
          filteredVets.map(vet => <VetCard key={vet.id} vet={vet} />)
        ) : (
          <p className="lg:col-span-2 text-center text-[color:var(--muted-foreground)]">No veterinarians found matching your criteria.</p>
        )}
      </div>
    </div>
  );
}
