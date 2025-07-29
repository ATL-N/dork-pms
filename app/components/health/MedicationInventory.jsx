// app/components/health/MedicationInventory.jsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Pill, AlertTriangle, Package, Plus } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import { useNotification } from '../../context/NotificationContext';
import AddInventoryItemModal from '../modals/AddInventoryItemModal';
import Modal from '../Modal';

export default function MedicationInventory({ farmId }) {
    const [inventory, setInventory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { addNotification } = useNotification();
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);

    const fetchMedicationInventory = useCallback(async () => {
        if (!farmId) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/farms/${farmId}/inventory-items?category=Medication&category=Health%20Supplies`);
            if (!res.ok) throw new Error('Failed to fetch medication inventory');
            const data = await res.json();
            setInventory(data);
        } catch (error) {
            addNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [farmId, addNotification]);

    useEffect(() => {
        fetchMedicationInventory();
    }, [fetchMedicationInventory]);

    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddItem = () => {
        setShowModal(true);
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="card p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <div className="flex items-center gap-2">
                    <Pill className="text-primary" />
                    <h3 className="text-lg font-semibold">Medication & Health Supplies</h3>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                     <input
                        type="text"
                        placeholder="Search supplies..."
                        className="input w-full sm:w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="btn-primary flex items-center gap-2" onClick={handleAddItem}>
                        <Plus size={18} />
                        Add Item
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="p-3">Item Name</th>
                            <th className="p-3">Category</th>
                            <th className="p-3 text-right">Quantity on Hand</th>
                            <th className="p-3">Unit</th>
                            <th className="p-3 text-right">Min. Threshold</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInventory.length > 0 ? filteredInventory.map(item => (
                            <tr key={item.id} className="border-b border-border">
                                <td className="p-3 font-medium">{item.name}</td>
                                <td className="p-3 text-muted-foreground">{item.category}</td>
                                <td className={`p-3 text-right font-semibold ${item.currentStock <= item.minThreshold ? 'text-destructive' : ''}`}>
                                    {item.currentStock <= item.minThreshold && <AlertTriangle size={14} className="inline mr-2 text-destructive" />}
                                    {item.currentStock.toLocaleString()}
                                </td>
                                <td className="p-3 text-muted-foreground">{item.unit}</td>
                                <td className="p-3 text-right text-muted-foreground">{item.minThreshold?.toLocaleString() || 'N/A'}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="text-center p-8 text-muted-foreground">
                                    <Package size={40} className="mx-auto mb-2" />
                                    No medication or health supplies found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {showModal && (
                <Modal onClose={() => setShowModal(false)} hideDefaultButtons={true}>
                    <AddInventoryItemModal 
                        farmId={farmId}
                        onSave={() => {
                            setShowModal(false);
                            fetchMedicationInventory();
                        }}
                        onClose={() => setShowModal(false)}
                    />
                </Modal>
            )}
        </div>
    );
}
