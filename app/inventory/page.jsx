'use client';

import React, { useState, useEffect, useCallback, Suspense, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Home, Plus, Edit, PackagePlus, AlertTriangle, Trash2, BellRing } from 'lucide-react';

import LoadingSpinner from '@/app/components/LoadingSpinner';
import Modal from '@/app/components/Modal';
import AddInventoryItemModal from '@/app/components/modals/AddInventoryItemModal';
import UpdateStockModal from '@/app/components/modals/UpdateStockModal';
import SetMinThresholdModal from '@/app/components/modals/SetMinThresholdModal';
import DeleteInventoryItemModal from '@/app/components/modals/DeleteInventoryItemModal';
import { useNotification } from '../context/NotificationContext';

function InventoryPageContent() {
  const { data: session } = useSession();
  const { addNotification } = useNotification();

  const [farms, setFarms] = useState([]);
  const [activeFarmId, setActiveFarmId] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [modal, setModal] = useState({ type: null, data: null });
  const [activeCategory, setActiveCategory] = useState('All');

  const fetchUserFarms = useCallback(async () => {
    if (!session) return;
    setLoading(true);
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
      setLoading(false);
    }
  }, [session, addNotification]);

  useEffect(() => {
    fetchUserFarms();
  }, [fetchUserFarms]);

  const fetchInventory = useCallback(async () => {
    if (!activeFarmId) {
      setInventory([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/inventory?farmId=${activeFarmId}`);
      if (!res.ok) throw new Error('Failed to fetch inventory');
      const data = await res.json();
      setInventory(data);
    } catch (error) {
      addNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [activeFarmId, addNotification]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleSaveItem = async (itemData) => {
    const isEdit = modal.type === 'edit';
    const url = isEdit ? `/api/inventory/${modal.data.id}` : '/api/inventory';
    const method = isEdit ? 'PATCH' : 'POST';
    setIsSubmitting(true);

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...itemData, farmId: activeFarmId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isEdit ? 'update' : 'add'} item`);
      }
      addNotification(`Item ${isEdit ? 'updated' : 'added'} successfully`, 'success');
      fetchInventory();
      closeModal();
      return true;
    } catch (error) {
      addNotification(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleUpdateStock = async (stockData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/inventory/${modal.data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stockData),
      });
      if (!response.ok) throw new Error('Failed to update stock');
      addNotification('Stock updated successfully', 'success');
      fetchInventory();
      closeModal();
    } catch (error) {
      addNotification(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!modal.data) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/inventory/${modal.data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete item');
      }
      addNotification('Item deleted successfully', 'success');
      fetchInventory();
      closeModal();
    } catch (error) {
      addNotification(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetMinThreshold = async (thresholdData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/inventory/${modal.data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(thresholdData),
      });
      if (!response.ok) throw new Error('Failed to set minimum threshold');
      addNotification('Minimum threshold set successfully', 'success');
      fetchInventory();
      closeModal();
    } catch (error) {
      addNotification(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = (type, data = null) => setModal({ type, data });
  const closeModal = () => setModal({ type: null, data: null });

  const categories = useMemo(() => ['All', ...new Set(inventory.map(item => item.category))], [inventory]);
  
  const filteredInventory = inventory.filter(item => 
    activeCategory === 'All' || item.category === activeCategory
  );

  const canManageInventory = session?.user?.userType === 'ADMIN' || userRole === 'OWNER' || userRole === 'MANAGER';

  const renderModalContent = () => {
    if (!modal.type) return null;

    switch (modal.type) {
      case 'add':
      case 'edit':
        return (
          <AddInventoryItemModal
            isOpen={true}
            onClose={closeModal}
            onSave={handleSaveItem}
            itemToEdit={modal.type === 'edit' ? modal.data : null}
            isSubmitting={isSubmitting}
          />
        );
      case 'stock':
        return (
          <UpdateStockModal
            isOpen={true}
            onClose={closeModal}
            onSave={handleUpdateStock}
            item={modal.data}
            isSubmitting={isSubmitting}
          />
        );
      case 'threshold':
        return (
          <SetMinThresholdModal
            isOpen={true}
            onClose={closeModal}
            onSave={handleSetMinThreshold}
            item={modal.data}
            isSubmitting={isSubmitting}
          />
        );
      case 'delete':
        return (
          <DeleteInventoryItemModal
            item={modal.data}
            onClose={closeModal}
            onConfirm={handleConfirmDelete}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Inventory</h1>
        {canManageInventory && (
          <button onClick={() => openModal('add')} className="btn-primary flex items-center gap-2" disabled={isSubmitting}>
            <Plus size={18} /> Add New Item
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-[color:var(--border)] pb-4">
        <span className="font-medium mr-2">Farms:</span>
        {farms.map(farm => (
          <button
            key={farm.id}
            className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-2 transition-colors ${
              activeFarmId === farm.id ? "bg-[color:var(--primary)] text-white" : "bg-[color:var(--card)] hover:bg-[color:var(--accent)]"
            }`}
            onClick={() => { setActiveFarmId(farm.id); setUserRole(farm.role); }}
          >
            <Home size={16} />
            {farm.name}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : activeFarmId ? (
        <div className="card p-6">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="font-medium mr-2">Categories:</span>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  activeCategory === cat ? 'bg-[color:var(--primary)] text-white' : 'bg-[color:var(--muted)] hover:bg-[color:var(--accent)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[color:var(--border)]">
                  <th className="p-3 font-semibold text-[color:var(--muted-foreground)]">Item Name</th>
                  <th className="p-3 font-semibold text-[color:var(--muted-foreground)]">Category</th>
                  <th className="p-3 font-semibold text-[color:var(--muted-foreground)]">Quantity</th>
                  <th className="p-3 font-semibold text-[color:var(--muted-foreground)]">Supplier</th>
                  {canManageInventory && <th className="p-3 font-semibold text-[color:var(--muted-foreground)]">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => {
                  const isLowStock = item.minThreshold && item.currentStock <= item.minThreshold;
                  return (
                    <tr key={item.id} className="border-b border-[color:var(--border)]">
                      <td className="p-3 font-medium">{item.name}</td>
                      <td className="p-3">{item.category}</td>
                      <td className={`p-3 font-medium ${isLowStock ? 'text-[color:var(--warning)]' : ''}`}>
                        <div className="flex items-center gap-2">
                          {item.currentStock} {item.unit}
                          {isLowStock && <AlertTriangle size={16} title="Low stock warning" />}
                        </div>
                      </td>
                      <td className="p-3">{item.supplier || 'N/A'}</td>
                      {canManageInventory && (
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button onClick={() => openModal('stock', item)} className="btn-primary text-xs py-1 px-2 flex items-center gap-1">
                              <PackagePlus size={14} /> Stock
                            </button>
                            <button onClick={() => openModal('edit', item)} className="btn-secondary text-xs py-1 px-2 flex items-center gap-1">
                              <Edit size={14} /> Edit
                            </button>
                            <button onClick={() => openModal('threshold', item)} className="btn-secondary text-xs py-1 px-2 flex items-center gap-1">
                              <BellRing size={14} /> Threshold
                            </button>
                            <button onClick={() => openModal('delete', item)} className="btn-danger text-xs py-1 px-2 flex items-center gap-1">
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        !loading && <div className="text-center p-8 card">
          <h2 className="text-xl font-semibold">No Farm Selected</h2>
          <p className="mt-2 text-[color:var(--muted-foreground)]">Please select a farm to view its inventory.</p>
        </div>
      )}

      {modal.type && (
        <Modal onClose={closeModal} hideDefaultButtons={true}>
          {renderModalContent()}
        </Modal>
      )}
    </div>
  );
}

export default function InventoryPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <InventoryPageContent />
        </Suspense>
    );
}