// app/feed/page.jsx
"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSession } from "next-auth/react";
import { Search, Plus, Home, Archive, Package, BookText } from "lucide-react";

import Modal from "../components/Modal";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNotification } from "../context/NotificationContext";
import AddFeedItemModal from "../components/modals/AddFeedItemModal";
import AddFeedFormulationModal from "../components/modals/AddFeedFormulationModal";
import FeedItemCard from "../components/feed/FeedItemCard";
import FeedFormulationCard from "../components/feed/FeedFormulationCard";

function FeedPageContent() {
  const [farms, setFarms] = useState([]);
  const [activeFarmId, setActiveFarmId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [activeTab, setActiveTab] = useState("inventory");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({ type: null, data: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNotification } = useNotification();

  const { data: session } = useSession();
  const [feedItems, setFeedItems] = useState([]);
  const [formulations, setFormulations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(false);

  const fetchUserFarms = useCallback(async () => {
    if (!session) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/user/farms');
      if (!res.ok) throw new Error('Failed to fetch farms');
      const farmsData = await res.json();
      setFarms(farmsData);
      if (farmsData.length > 0) {
        const initialFarm = farmsData[0];
        setActiveFarmId(initialFarm.id);
        setUserRole(initialFarm.role);
      }
    } catch (err) {
      addNotification(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [session, addNotification]);

  useEffect(() => {
    fetchUserFarms();
  }, [fetchUserFarms]);

  const fetchDataForFarm = useCallback(async () => {
    if (!activeFarmId) {
      setFeedItems([]);
      setFormulations([]);
      return;
    }
    setIsDataLoading(true);
    try {
      const [itemsRes, formulationsRes] = await Promise.all([
        fetch(`/api/farms/${activeFarmId}/feed-items`),
        fetch(`/api/farms/${activeFarmId}/feed-formulations`),
      ]);
      if (!itemsRes.ok) throw new Error('Failed to fetch feed inventory');
      if (!formulationsRes.ok) throw new Error('Failed to fetch feed formulations');
      
      const itemsData = await itemsRes.json();
      const formulationsData = await formulationsRes.json();
      
      setFeedItems(itemsData);
      setFormulations(formulationsData);
    } catch (err) {
      addNotification(err.message, 'error');
    } finally {
      setIsDataLoading(false);
    }
  }, [activeFarmId, addNotification]);

  useEffect(() => {
    fetchDataForFarm();
  }, [fetchDataForFarm]);

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
        throw new Error(errorData.error || 'Failed to process request');
      }

      addNotification(successMessage, 'success');
      setShowModal(false);
      fetchDataForFarm(); // Refetch data after successful submission
    } catch (err) {
      console.error("Error:", err);
      addNotification(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (itemType, item) => {
      const confirmDelete = window.confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`);
      if (!confirmDelete) return;

      const url = itemType === 'item' 
          ? `/api/farms/${activeFarmId}/feed-items/${item.id}`
          : `/api/farms/${activeFarmId}/feed-formulations/${item.id}`;
      
      await handleModalSubmit(url, null, 'DELETE', `${itemType === 'item' ? 'Feed item' : 'Formulation'} deleted successfully.`);
  };

  const openModal = (type, data = null) => {
    setModalConfig({ type, data });
    setShowModal(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setShowModal(false);
    // Delay clearing config to allow for closing animation
    setTimeout(() => setModalConfig({ type: null, data: null }), 300);
  };

  const filteredItems = feedItems.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredFormulations = formulations.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const canManage = session?.user?.userType === 'ADMIN' || userRole === 'OWNER' || userRole === 'MANAGER';

  const renderContent = () => {
    if (isDataLoading) return <LoadingSpinner />;

    if (activeTab === 'inventory') {
      return filteredItems.length > 0 
        ? <div className="space-y-4">{filteredItems.map(item => <FeedItemCard key={item.id} item={item} onEdit={() => openModal('edit_item', item)} onDelete={() => handleDelete('item', item)} canManage={canManage} />)}</div>
        : <p className="text-center text-[color:var(--muted-foreground)] py-8">No feed items found in this farm's inventory.</p>;
    }

    if (activeTab === 'formulations') {
      return filteredFormulations.length > 0
        ? <div className="space-y-4">{filteredFormulations.map(f => <FeedFormulationCard key={f.id} formulation={f} onEdit={() => openModal('edit_formulation', f)} onDelete={() => handleDelete('formulation', f)} canManage={canManage} />)}</div>
        : <p className="text-center text-[color:var(--muted-foreground)] py-8">No feed formulations found for this farm.</p>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">Feed Management</h1>
        {canManage && (
          <button
            className="btn-primary flex items-center gap-2 w-full md:w-auto"
            onClick={() => openModal(activeTab === 'inventory' ? 'add_item' : 'add_formulation')}
            disabled={!activeFarmId || isSubmitting}
          >
            <Plus size={18} />
            <span>{activeTab === 'inventory' ? 'Add Feed Item' : 'New Formulation'}</span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-[color:var(--border)] pb-2">
        <span className="font-medium mr-2">Farms:</span>
        {farms.length > 0 ? farms.map(farm => (
          <button
            key={farm.id}
            className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-2 ${activeFarmId === farm.id ? "bg-[color:var(--primary)] text-white" : "bg-[color:var(--card)] hover:bg-[color:var(--accent)]"}`}
            onClick={() => { setActiveFarmId(farm.id); setUserRole(farm.role); }}
          >
            <Home size={16} />
            {farm.name}
          </button>
        )) : !isLoading && <p className="text-sm text-[color:var(--muted-foreground)]">No farms found.</p>}
      </div>

      {activeFarmId ? (
        <>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex border-b border-[color:var(--border)] md:border-b-0">
              <button
                className={`px-4 py-2 font-medium flex items-center gap-2 ${activeTab === "inventory" ? "text-[color:var(--primary)] border-b-2 border-[color:var(--primary)]" : "text-[color:var(--muted-foreground)]"}`}
                onClick={() => setActiveTab("inventory")}
              >
                <Package size={16} /> Inventory
              </button>
              <button
                className={`px-4 py-2 font-medium flex items-center gap-2 ${activeTab === "formulations" ? "text-[color:var(--primary)] border-b-2 border-[color:var(--primary)]" : "text-[color:var(--muted-foreground)]"}`}
                onClick={() => setActiveTab("formulations")}
              >
                <BookText size={16} /> Formulations
              </button>
            </div>
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                className="input w-full pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-[color:var(--muted-foreground)]" size={18} />
            </div>
          </div>
          {renderContent()}
        </>
      ) : (
        !isLoading && <div className="text-center p-8">
          <h2 className="text-xl font-semibold">No Farm Selected</h2>
          <p className="mt-2 text-[color:var(--muted-foreground)]">Please select a farm to manage its feed.</p>
        </div>
      )}

      {showModal && (
        <Modal onClose={closeModal} hideDefaultButtons={true}>
          <>
            {modalConfig.type === 'add_item' && (
              <AddFeedItemModal
                isSubmitting={isSubmitting}
                onClose={closeModal}
                onSave={(formData) => handleModalSubmit(`/api/farms/${activeFarmId}/feed-items`, formData, 'POST', 'Feed item added successfully!')}
              />
            )}
            {modalConfig.type === 'edit_item' && (
              <AddFeedItemModal
                isSubmitting={isSubmitting}
                onClose={closeModal}
                onSave={(formData) => handleModalSubmit(`/api/farms/${activeFarmId}/feed-items/${modalConfig.data.id}`, formData, 'PUT', 'Feed item updated successfully!')}
                itemToEdit={modalConfig.data}
              />
            )}
            {modalConfig.type === 'add_formulation' && (
              <AddFeedFormulationModal
                isSubmitting={isSubmitting}
                farmId={activeFarmId}
                onClose={closeModal}
                onSave={(formData) => handleModalSubmit(`/api/farms/${activeFarmId}/feed-formulations`, formData, 'POST', 'Formulation created successfully!')}
              />
            )}
            {modalConfig.type === 'edit_formulation' && (
              <AddFeedFormulationModal
                isSubmitting={isSubmitting}
                farmId={activeFarmId}
                onClose={closeModal}
                onSave={(formData) => handleModalSubmit(`/api/farms/${activeFarmId}/feed-formulations/${modalConfig.data.id}`, formData, 'PUT', 'Formulation updated successfully!')}
                formulationToEdit={modalConfig.data}
              />
            )}
          </>
        </Modal>
      )}
    </div>
  );
}

export default function FeedPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <FeedPageContent />
        </Suspense>
    );
}