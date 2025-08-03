// app/components/dashboards/OwnerDashboard.jsx
"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DollarSign, Feather, Users, AlertTriangle, ChevronRight, Home, Plus, UserPlus, Briefcase } from 'lucide-react';
import SummaryCard from './SummaryCard';
import Alerts from './Alerts';
import LoadingSpinner from '../LoadingSpinner';
import AddFarmModal from '../modals/AddFarmModal';
import AddStaffModal from '../modals/AddStaffModal'; // Changed from InviteUserModal
import InviteVetModal from '../modals/InviteVetModal';
import Modal from '../Modal';
import { useFarm } from '@/app/context/FarmContext';

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const { currentFarm, refreshFarms } = useFarm();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/dashboard/owner');
      if (!res.ok) throw new Error('Failed to fetch owner data');
      const jsonData = await res.json();
      setData(jsonData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleActionCompletion = () => {
    fetchData(); // Refetch dashboard data
    refreshFarms(); // Refresh farm list in context if applicable
  };

  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType(null);
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  const { summary, alerts = [], attentionFlocks = [] } = data || {};

  if (!data || !summary || summary.totalFarms === 0) {
    return (
      <>
        <div className="text-center">
            <h2 className="text-2xl font-bold">Welcome!</h2>
            <p className="text-[color:var(--muted-foreground)] mt-2">You don't have any farms yet. Get started by creating one.</p>
            <button onClick={() => openModal('addFarm')} className="btn-primary mt-4">
                <Plus className="mr-2" /> Create Your First Farm
            </button>
        </div>
        {showModal && modalType === 'addFarm' && (
            <Modal onClose={closeModal} hideDefaultButtons={true}>
                <AddFarmModal isOpen={true} onClose={closeModal} onFarmAdded={handleActionCompletion} />
            </Modal>
        )}
      </>
    );
  }

  const renderModalContent = () => {
    if (!showModal) return null;

    switch(modalType) {
        case 'addFarm':
            return <AddFarmModal isOpen={true} onClose={closeModal} onFarmAdded={handleActionCompletion} />;
        case 'addStaff':
            return <AddStaffModal isOpen={true} onClose={closeModal} onStaffAdded={handleActionCompletion} />;
        case 'inviteVet':
            if (!currentFarm) return <p>Please select a farm first to invite a vet.</p>;
            return <InviteVetModal isOpen={true} onClose={closeModal} farmId={currentFarm.id} />;
        default:
            return null;
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Owner's Dashboard</h1>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => openModal('addFarm')} className="btn-secondary flex items-center"><Plus size={16} className="mr-1" /> New Farm</button>
            <button onClick={() => openModal('addStaff')} className="btn-secondary flex items-center"><UserPlus size={16} className="mr-1" /> Add Staff</button>
            <button onClick={() => openModal('inviteVet')} className="btn-secondary flex items-center" disabled={!currentFarm}><Briefcase size={16} className="mr-1" /> Invite Vet</button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <SummaryCard title="Total Farms" value={summary.totalFarms ?? 'N/A'} icon={<Home />} />
          <SummaryCard title="Total Flocks" value={summary.totalFlocks ?? 'N/A'} icon={<Feather />} />
          <SummaryCard title="Total Birds" value={summary.activeBirds ?? 'N/A'} icon={<Users />} />
          <SummaryCard title="Alerts" value={summary.alertsCount ?? 'N/A'} icon={<AlertTriangle />} className={summary.alertsCount > 0 ? 'text-yellow-500' : ''} />
          <SummaryCard title="Revenue (This Month)" value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(summary.revenueThisMonth || 0)} icon={<DollarSign />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card p-6">
            <h2 className="font-medium mb-4">Alerts Overview</h2>
            <Alerts alerts={alerts} />
          </div>
          <div className="card p-6">
            <h2 className="font-medium mb-4">Flocks Requiring Action</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {attentionFlocks.length > 0 ? attentionFlocks.map(flock => (
                <Link href={`/flocks?flockId=${flock.id}`} key={flock.id}>
                  <div className="p-3 border rounded-lg hover:bg-[color:var(--muted)] cursor-pointer flex justify-between items-center">
                    <div>
                      <p className="font-bold">{flock.name} <span className="text-sm font-normal text-[color:var(--muted-foreground)]">({flock.farm})</span></p>
                      <p className="text-sm text-red-500">{flock.reason}</p>
                    </div>
                    <ChevronRight size={20} />
                  </div>
                </Link>
              )) : <p className="text-[color:var(--muted-foreground)]">All flocks are up to date.</p>}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <Modal onClose={closeModal} hideDefaultButtons={true}>
            {renderModalContent()}
        </Modal>
      )}
    </>
  );
}
