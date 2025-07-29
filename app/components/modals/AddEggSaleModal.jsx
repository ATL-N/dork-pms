// app/components/modals/AddEggSaleModal.jsx
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, Info } from 'lucide-react';
import { useNotification } from '@/app/context/NotificationContext';

export default function AddEggSaleModal({ farmId, isSubmitting, onClose, onSave }) {
    const { addNotification } = useNotification();
    const [availableEggs, setAvailableEggs] = useState(0);
    const [isLoadingInventory, setIsLoadingInventory] = useState(true);

    const [saleUnit, setSaleUnit] = useState('units'); // 'units', 'half_crate', 'full_crate'
    const [unitCount, setUnitCount] = useState('');
    
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [customer, setCustomer] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        const fetchInventory = async () => {
            if (!farmId) return;
            setIsLoadingInventory(true);
            try {
                const res = await fetch(`/api/farms/${farmId}/egg-inventory`);
                if (!res.ok) throw new Error('Could not fetch egg inventory.');
                const data = await res.json();
                setAvailableEggs(data.availableEggs);
            } catch (error) {
                addNotification(error.message, 'error');
            } finally {
                setIsLoadingInventory(false);
            }
        };
        fetchInventory();
    }, [farmId, addNotification]);

    const totalSaleQuantity = useMemo(() => {
        const count = parseInt(unitCount, 10);
        if (isNaN(count) || count <= 0) return 0;

        switch (saleUnit) {
            case 'full_crate':
                return count * 30;
            case 'half_crate':
                return count * 15;
            case 'units':
            default:
                return count;
        }
    }, [saleUnit, unitCount]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!totalSaleQuantity || !amount || !date) {
            addNotification('Please fill all required fields.', 'warning');
            return;
        }
        if (totalSaleQuantity > availableEggs) {
            addNotification('Sale quantity cannot exceed available eggs.', 'error');
            return;
        }
        onSave({
            quantity: totalSaleQuantity,
            amount: parseFloat(amount),
            date,
            customer,
            notes,
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-4">
                <h2 className="text-xl font-bold">Record Egg Sale</h2>
                <p className="text-sm text-[color:var(--muted-foreground)]">This will create a new revenue entry and update your egg inventory.</p>
            </div>

            <div className="p-3 mb-4 bg-blue-50 border border-blue-200 rounded-md flex items-center gap-3">
                <Info size={20} className="text-blue-600" />
                {isLoadingInventory ? <Loader2 size={16} className="animate-spin" /> :
                    <p className="text-sm text-blue-700">
                        <span className="font-semibold">{availableEggs.toLocaleString()}</span> eggs available for sale.
                    </p>
                }
            </div>

            <div className="space-y-4">
                <fieldset className="border p-4 rounded-md">
                    <legend className="text-sm font-medium px-2">Sale Quantity</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <div>
                            <label htmlFor="unitCount" className="block text-sm font-medium mb-1">Number of</label>
                            <input 
                                type="number" 
                                id="unitCount" 
                                className="input" 
                                value={unitCount} 
                                onChange={e => setUnitCount(e.target.value)}
                                required 
                                min="1"
                            />
                        </div>
                        <div>
                            <select 
                                id="saleUnit" 
                                className="input" 
                                value={saleUnit} 
                                onChange={e => setSaleUnit(e.target.value)}
                            >
                                <option value="units">Individual Eggs</option>
                                <option value="half_crate">Half Crates (15 eggs)</option>
                                <option value="full_crate">Full Crates (30 eggs)</option>
                            </select>
                        </div>
                    </div>
                    {totalSaleQuantity > 0 && (
                        <p className="text-sm text-right mt-2 text-[color:var(--muted-foreground)]">
                            Total: <span className="font-semibold text-[color:var(--foreground)]">{totalSaleQuantity}</span> eggs
                        </p>
                    )}
                </fieldset>
                
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium mb-1">Total Amount Received</label>
                    <input 
                        type="number" 
                        id="amount" 
                        className="input" 
                        value={amount} 
                        onChange={e => setAmount(e.target.value)}
                        required
                        step="0.01"
                    />
                </div>
                
                <div>
                    <label htmlFor="date" className="block text-sm font-medium mb-1">Date of Sale</label>
                    <input 
                        type="date" 
                        id="date" 
                        className="input" 
                        value={date} 
                        onChange={e => setDate(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="customer" className="block text-sm font-medium mb-1">Customer (Optional)</label>
                    <input 
                        type="text" 
                        id="customer" 
                        className="input" 
                        value={customer} 
                        onChange={e => setCustomer(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="notes" className="block text-sm font-medium mb-1">Notes (Optional)</label>
                    <textarea 
                        id="notes" 
                        className="input" 
                        rows="3"
                        value={notes} 
                        onChange={e => setNotes(e.target.value)}
                    ></textarea>
                </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
                <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
                    Cancel
                </button>
                <button type="submit" className="btn-primary flex items-center gap-2" disabled={isSubmitting || isLoadingInventory || totalSaleQuantity > availableEggs}>
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Save Sale'}
                </button>
            </div>
        </form>
    );
}
