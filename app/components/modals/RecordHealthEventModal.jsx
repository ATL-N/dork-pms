// app/components/modals/RecordHealthEventModal.jsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../../context/NotificationContext';
import LoadingSpinner from '../LoadingSpinner';

export default function RecordHealthEventModal({ flock, farmId, taskToEdit, isEditMode, onSave, onClose }) {
    const [formData, setFormData] = useState({
        taskType: 'Vaccination', // 'Vaccination' or 'Medication'
        taskName: '',
        method: '',
        notes: '',
        inventoryItemId: '',
        quantityUsed: '',
    });
    const [flocks, setFlocks] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [existingTaskNames, setExistingTaskNames] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addNotification } = useNotification();

    const activeFarmId = flock?.farmId || farmId;

    const fetchFlocks = useCallback(async () => {
        if (!activeFarmId) return;
        try {
            const res = await fetch(`/api/farms/${activeFarmId}/flocks?status=active`);
            if (!res.ok) throw new Error('Failed to fetch flocks');
            const data = await res.json();
            setFlocks(data);
        } catch (error) {
            addNotification(error.message, 'error');
        }
    }, [activeFarmId, addNotification]);

    const fetchExistingTaskNames = useCallback(async () => {
        if (!activeFarmId) return;
        try {
            const res = await fetch(`/api/farms/${activeFarmId}/health-tasks/names`);
            if (!res.ok) throw new Error('Failed to fetch existing task names');
            const data = await res.json();
            setExistingTaskNames(data);
        } catch (error) {
            addNotification(error.message, 'error');
        }
    }, [activeFarmId, addNotification]);

    const fetchMedicationInventory = useCallback(async () => {
        if (!activeFarmId) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/farms/${activeFarmId}/inventory-items?category=Medication&category=Health%20Supplies`);
            if (!res.ok) throw new Error('Failed to fetch medication inventory');
            const data = await res.json();
            setInventory(data);
        } catch (error) {
            addNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [activeFarmId, addNotification]);

    useEffect(() => {
        fetchFlocks();
        fetchMedicationInventory();
        fetchExistingTaskNames();
    }, [fetchFlocks, fetchMedicationInventory, fetchExistingTaskNames]);

    useEffect(() => {
        if (taskToEdit) {
            setFormData({
                flockId: taskToEdit.flockId,
                taskType: taskToEdit.taskType,
                taskName: taskToEdit.taskName,
                method: taskToEdit.method || '',
                notes: taskToEdit.notes || '',
                inventoryItemId: taskToEdit.inventoryItemId || '',
                quantityUsed: taskToEdit.quantityUsed || '',
                scheduledDate: taskToEdit.scheduledDate ? new Date(taskToEdit.scheduledDate).toISOString().split('T')[0] : '',
            });
        } else if (flock) {
            setFormData(prev => ({ ...prev, flockId: flock.id }));
        }
    }, [taskToEdit, flock]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const dataToSave = {
            ...formData,
            flockId: formData.flockId,
            taskName: formData.taskName === '__new__' ? formData.newTaskName : formData.taskName,
            scheduledDate: new Date(formData.scheduledDate), 
        };

        if (isEditMode) {
            dataToSave.status = taskToEdit.status;
        } else {
            dataToSave.status = 'SCHEDULED';
        }

        try {
            await onSave(dataToSave);
        } catch (error) {
            // The onSave function is expected to handle notifications
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 bg-card rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Record Health Event</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="hidden" name="flockId" value={formData.flockId} />
                {isEditMode || flock ? null : (
                    <div>
                        <label htmlFor="flockId" className="block text-sm font-medium text-muted-foreground">Flock</label>
                        <select name="flockId" id="flockId" value={formData.flockId} onChange={handleChange} className="input mt-1 block w-full" required>
                            <option value="">Select a flock</option>
                            {flocks.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                        </select>
                    </div>
                )}
                <div>
                    <label htmlFor="taskType" className="block text-sm font-medium text-muted-foreground">Event Type</label>
                    <select name="taskType" id="taskType" value={formData.taskType} onChange={handleChange} className="input mt-1 block w-full">
                        <option value="Vaccination">Vaccination</option>
                        <option value="Medication">Medication/Treatment</option>
                        <option value="Checkup">Health Checkup</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="taskName" className="block text-sm font-medium text-muted-foreground">
                        {formData.taskType === 'Vaccination' ? 'Vaccine Name' : 'Medication/Treatment Name'}
                    </label>
                    <select name="taskName" id="taskName" value={formData.taskName} onChange={handleChange} className="input mt-1 block w-full" required>
                        <option value="">Select a name</option>
                        {existingTaskNames.map(name => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                        <option value="__new__">Other (Type New)</option>
                    </select>
                    {formData.taskName === '__new__' && (
                        <input type="text" name="newTaskName" value={formData.newTaskName || ''} onChange={(e) => setFormData(prev => ({ ...prev, newTaskName: e.target.value }))} className="input mt-1 block w-full mt-2" placeholder="Enter new name" required />
                    )}
                </div>
                <div>
                    <label htmlFor="method" className="block text-sm font-medium text-muted-foreground">Method of Administration</label>
                    <select name="method" id="method" value={formData.method} onChange={handleChange} className="input mt-1 block w-full" required>
                        <option value="">Select method</option>
                        <option value="Drinking Water">Drinking Water</option>
                        <option value="Injection">Injection</option>
                        <option value="Spray">Spray</option>
                        <option value="Eye Drop">Eye Drop</option>
                        <option value="Oral">Oral</option>
                        <option value="Feed">Feed</option>
                    </select>
                </div>
                
                {isLoading ? <LoadingSpinner /> : (
                    <div>
                        <label htmlFor="inventoryItemId" className="block text-sm font-medium text-muted-foreground">Supply Used (Optional)</label>
                        <select name="inventoryItemId" id="inventoryItemId" value={formData.inventoryItemId} onChange={handleChange} className="input mt-1 block w-full">
                            <option value="">None</option>
                            {inventory.map(item => (
                                <option key={item.id} value={item.id}>
                                    {item.name} ({item.currentStock.toLocaleString()} {item.unit} left)
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {formData.inventoryItemId && (
                    <div>
                        <label htmlFor="quantityUsed" className="block text-sm font-medium text-muted-foreground">Quantity Used</label>
                        <input type="number" name="quantityUsed" id="quantityUsed" value={formData.quantityUsed} onChange={handleChange} className="input mt-1 block w-full" required min="0" />
                    </div>
                )}

                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-muted-foreground">Notes</label>
                    <textarea name="notes" id="notes" value={formData.notes} onChange={handleChange} className="input mt-1 block w-full" rows="3"></textarea>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className="btn-secondary">
                        Cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={isSubmitting || isLoading}>
                        {isSubmitting ? <LoadingSpinner size="small" /> : 'Record Event'}
                    </button>
                </div>
            </form>
        </div>
    );
}