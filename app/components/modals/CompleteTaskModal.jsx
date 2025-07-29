// app/components/modals/CompleteTaskModal.jsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../../context/NotificationContext';
import LoadingSpinner from '../LoadingSpinner';

export default function CompleteTaskModal({ task, farmId, onTaskCompleted, onClose }) {
    const [inventory, setInventory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedInventoryId, setSelectedInventoryId] = useState('');
    const [quantityUsed, setQuantityUsed] = useState('');
    const [notes, setNotes] = useState(task.notes || '');
    const { addNotification } = useNotification();

    const fetchMedicationInventory = useCallback(async () => {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!selectedInventoryId || !quantityUsed) {
            addNotification('Please select a medication and enter the quantity used.', 'error');
            setIsSubmitting(false);
            return;
        }

        try {
            const res = await fetch(`/api/farms/${farmId}/health-tasks/${task.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'COMPLETED',
                    inventoryItemId: selectedInventoryId,
                    quantityUsed: parseFloat(quantityUsed),
                    notes,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to update task');
            }

            addNotification('Health task marked as complete!', 'success');
            onTaskCompleted();
            onClose();

        } catch (error) {
            addNotification(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 bg-card rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-2">Complete Health Task</h2>
            <p className="text-muted-foreground mb-4">For flock: <span className="font-semibold text-primary">{task.flock.name}</span></p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-muted-foreground">Task</label>
                    <p className="font-semibold mt-1">{task.taskName} ({task.method})</p>
                </div>

                {isLoading ? <LoadingSpinner /> : (
                    <div>
                        <label htmlFor="inventoryItemId" className="block text-sm font-medium text-muted-foreground">Medication/Supply Used</label>
                        <select
                            id="inventoryItemId"
                            value={selectedInventoryId}
                            onChange={(e) => setSelectedInventoryId(e.target.value)}
                            className="input mt-1 block w-full"
                            required
                        >
                            <option value="" disabled>Select an item...</option>
                            {inventory.map(item => (
                                <option key={item.id} value={item.id}>
                                    {item.name} ({item.currentStock.toLocaleString()} {item.unit} left)
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div>
                    <label htmlFor="quantityUsed" className="block text-sm font-medium text-muted-foreground">Quantity Used</label>
                    <input
                        type="number"
                        id="quantityUsed"
                        value={quantityUsed}
                        onChange={(e) => setQuantityUsed(e.target.value)}
                        className="input mt-1 block w-full"
                        required
                        min="0"
                    />
                </div>

                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-muted-foreground">Notes</label>
                    <textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="input mt-1 block w-full"
                        rows="3"
                    ></textarea>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className="btn-secondary">
                        Cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={isSubmitting || isLoading}>
                        {isSubmitting ? <LoadingSpinner size="small" /> : 'Mark as Complete'}
                    </button>
                </div>
            </form>
        </div>
    );
}
