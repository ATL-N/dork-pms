
// app/farm/[farmId]/page.jsx
"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from 'next/navigation';
import { Search, Plus, Home, Archive } from "lucide-react";

// Import components and modals
import Modal from "../../components/Modal";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useNotification } from "../../context/NotificationContext";
import FlockCard from "../../components/flocks/FlockCard";
import AddFlockModal from "../../components/modals/AddFlockModal";
import ArchiveFlockModal from "../../components/modals/ArchiveFlockModal";
import RecordWeightModal from "../../components/modals/RecordWeightModal";
import RecordMortalityModal from "../../components/modals/RecordMortalityModal";
import RecordHealthEventModal from "../../components/modals/RecordHealthEventModal";
import RecordFeedConsumptionModal from "../../components/modals/RecordFeedConsumptionModal";
import RecordEggProductionModal from "../../components/modals/RecordEggProductionModal";
import RecordBirdSaleModal from "../../components/modals/RecordBirdSaleModal";

function FarmPageContent({ paramsPromise }) {
  const params = use(paramsPromise);
  const { farmId } = params;
  const [farm, setFarm] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [activeStatusTab, setActiveStatusTab] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({ type: null, data: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNotification } = useNotification();

  const { data: session } = useSession();
  const [flocks, setFlocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const searchParams = useSearchParams();
  const preselectedFlockId = searchParams.get('flockId');
  
  const [expandedFlockId, setExpandedFlockId] = useState(preselectedFlockId || null);

  const fetchFarmData = useCallback(async () => {
    if (!session || !farmId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/farms/${farmId}`);
      if (!res.ok) throw new Error('Failed to fetch farm data');
      const farmData = await res.json();
      setFarm(farmData);
      // Assuming the API returns the user's role for this farm
      // This might need adjustment based on your API response
      // For now, I'll simulate it based on session for demonstration
      const resUser = await fetch('/api/user/farms');
      const userFarms = await resUser.json();
      const currentFarm = userFarms.find(f => f.id === farmId);
      if (currentFarm) {
        setUserRole(currentFarm.role);
      }
    } catch (err) {
      addNotification(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [session, farmId, addNotification]);

  useEffect(() => {
    fetchFarmData();
  }, [fetchFarmData]);

  const fetchFlocksForFarm = useCallback(async () => {
    if (!farmId) {
      setFlocks([]);
      return;
    };
    setIsLoading(true);
    try {
      const res = await fetch(`/api/farms/${farmId}/flocks`);
      if (!res.ok) throw new Error('Failed to fetch flocks for the selected farm');
      const data = await res.json();
      setFlocks(data);
    } catch (err) {
      addNotification(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [farmId, addNotification]);

  useEffect(() => {
    fetchFlocksForFarm();
  }, [fetchFlocksForFarm]);
  
  const handleModalSubmit = async (url, body, method = 'POST', successMessage) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Failed to process request';
        throw new Error(errorMessage);
      }

      addNotification(successMessage, 'success');
      closeModal();
      fetchFlocksForFarm();
    } catch (err) {
      console.error("Error:", err);
      addNotification(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = (type, data = null) => {
    setModalConfig({ type, data });
    setShowModal(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setShowModal(false);
    setTimeout(() => setModalConfig({ type: null, data: null }), 300);
  };

  const handleToggleExpand = (flockId) => {
    setExpandedFlockId(currentId => currentId === flockId ? null : flockId);
  };

  const filteredFlocks = flocks
    .filter(flock => flock.status === activeStatusTab)
    .filter(flock => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        flock.name.toLowerCase().includes(term) ||
        (flock.breed && flock.breed.toLowerCase().includes(term))
      );
    });
    
  const canAddFlock = session?.user?.userType === 'ADMIN' || userRole === 'OWNER' || userRole === 'MANAGER';

  const renderModalContent = () => {
    const { type, data: flock } = modalConfig;
    if (!type) return null;

    const farmIdForModal = flock ? flock.farmId : farmId;

    switch(type) {
        case 'add':
            return <AddFlockModal
                isSubmitting={isSubmitting}
                onClose={closeModal}
                onSave={(data) => handleModalSubmit(`/api/farms/${farmIdForModal}/flocks`, data, 'POST', 'Flock added successfully!')}
                farms={farm ? [farm] : []}
                defaultFarmId={farmIdForModal}
            />;
        case 'edit':
            return <AddFlockModal
                isSubmitting={isSubmitting}
                onClose={closeModal}
                onSave={(data) => handleModalSubmit(`/api/farms/${farmIdForModal}/flocks/${flock.id}`, data, 'PUT', 'Flock updated successfully!')}
                flockToEdit={flock}
                farms={farm ? [farm] : []}
                defaultFarmId={farmIdForModal}
                isEditMode={true}
            />;
        case 'archive':
            return <ArchiveFlockModal
                flock={flock}
                isSubmitting={isSubmitting}
                onClose={closeModal}
                onConfirm={() => handleModalSubmit(`/api/farms/${farmIdForModal}/flocks/${flock.id}`, { status: 'archived' }, 'PUT', 'Flock archived successfully!')}
            />;
        case 'recordWeight':
            return <RecordWeightModal
                flock={flock}
                isSubmitting={isSubmitting}
                onClose={closeModal}
                onSave={(data) => handleModalSubmit(`/api/farms/${farmIdForModal}/flocks/${flock.id}/growth-records`, data, 'POST', 'Weight recorded!')}
            />;
        case 'recordMortality':
            return <RecordMortalityModal
                flock={flock}
                isSubmitting={isSubmitting}
                onClose={closeModal}
                onSave={(data) => handleModalSubmit(`/api/farms/${farmIdForModal}/flocks/${flock.id}/mortality-records`, data, 'POST', 'Mortality recorded!')}
            />;
        case 'recordHealthEvent':
            return <RecordHealthEventModal
                flock={flock}
                isSubmitting={isSubmitting}
                onClose={closeModal}
                onSave={(data) => handleModalSubmit(`/api/farms/${farmIdForModal}/health-tasks`, data, 'POST', 'Health event recorded!')}
            />;
        case 'recordFeed':
            return <RecordFeedConsumptionModal
                flock={flock}
                isSubmitting={isSubmitting}
                onClose={closeModal}
                onSave={(data) => handleModalSubmit(`/api/farms/${farmIdForModal}/feed-consumption`, data, 'POST', 'Feed consumption recorded!')}
            />;
        case 'recordEggs':
            return <RecordEggProductionModal
                flock={flock}
                isSubmitting={isSubmitting}
                onClose={closeModal}
                onSave={(data) => handleModalSubmit(`/api/farms/${farmIdForModal}/production-records`, data, 'POST', 'Egg production recorded!')}
            />;
        case 'recordBirdSale':
            return <RecordBirdSaleModal
                flock={flock}
                isSubmitting={isSubmitting}
                onClose={closeModal}
                onSave={(data) => handleModalSubmit(`/api/farms/${farmIdForModal}/flocks/${flock.id}/bird-resales`, data, 'POST', 'Bird sale recorded successfully!')}
            />;
        default:
            return null;
    }
  }

  if (isLoading) return <LoadingSpinner />;
  if (!farm) return <div className="text-center p-8"><h2 className="text-xl font-semibold">Farm not found</h2><p className="mt-2 text-[color:var(--muted-foreground)]">The requested farm could not be loaded.</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">Flocks in {farm.name}</h1>
        {canAddFlock && (
            <button
              className="btn-primary flex items-center gap-2 w-full md:w-auto"
              onClick={() => openModal('add')}
              disabled={isSubmitting}
            >
              <Plus size={18} />
              <span>Add New Flock</span>
            </button>
        )}
      </div>

      <>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex border-b border-[color:var(--border)] md:border-b-0">
              <button
                className={`px-4 py-2 font-medium flex items-center gap-2 ${
                  activeStatusTab === "active"
                    ? "text-[color:var(--primary)] border-b-2 border-[color:var(--primary)]"
                    : "text-[color:var(--muted-foreground)]"
                }`}
                onClick={() => setActiveStatusTab("active")}
              >
                <Home size={16} /> Active
              </button>
              <button
                className={`px-4 py-2 font-medium flex items-center gap-2 ${
                  activeStatusTab === "archived"
                    ? "text-[color:var(--primary)] border-b-2 border-[color:var(--primary)]"
                    : "text-[color:var(--muted-foreground)]"
                }`}
                onClick={() => setActiveStatusTab("archived")}
              >
                <Archive size={16} /> Archived
              </button>
            </div>
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search flocks..."
                className="input w-full pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search
                className="absolute left-3 top-2.5 text-[color:var(--muted-foreground)]"
                size={18}
              />
            </div>
          </div>

          <div className="space-y-4">
            {isLoading ? <LoadingSpinner /> : filteredFlocks.length > 0 ? filteredFlocks.map((flock) => (
                <FlockCard 
                    key={flock.id} 
                    flock={flock}
                    isExpanded={flock.id === expandedFlockId}
                    onToggleExpand={() => handleToggleExpand(flock.id)}
                    onEdit={() => canAddFlock && openModal('edit', flock)}
                    onArchive={() => canAddFlock && openModal('archive', flock)}
                    onRecordFeed={() => openModal('recordFeed', flock)}
                    onRecordWeight={() => openModal('recordWeight', flock)}
                    onRecordMortality={() => openModal('recordMortality', flock)}
                    onRecordHealthEvent={() => openModal('recordHealthEvent', flock)}
                    onRecordEggs={() => openModal('recordEggs', flock)}
                    onRecordBirdSale={() => openModal('recordBirdSale', flock)}
                />
              )) : <p className="text-center text-[color:var(--muted-foreground)] py-8">No {activeStatusTab} flocks found in this farm.</p>}
          </div>
        </>

      {showModal && (
        <Modal onClose={closeModal} hideDefaultButtons={true}>
          {renderModalContent()}
        </Modal>
      )}
    </div>
  );
}

export default function FarmPage({ params }) {
    return (
        <React.Suspense fallback={<LoadingSpinner />}>
            <FarmPageContent paramsPromise={Promise.resolve(params)} />
        </React.Suspense>
    );
}
