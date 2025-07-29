// app/components/modals/RecordBirdSaleModal.jsx
"use client";
import React, { useState } from 'react';
import { DollarSign, Hash, FileText } from 'lucide-react';

export default function RecordBirdSaleModal({ flock, onSave, onClose, isSubmitting }) {
    const [quantity, setQuantity] = useState('');
    const [revenue, setRevenue] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const qty = parseInt(quantity, 10);
        if (qty > flock.quantity) {
            setError(`Cannot sell more birds than are in the flock. Current quantity: ${flock.quantity}`);
            return;
        }
        setError('');
        onSave({
            quantity: qty,
            revenue: parseFloat(revenue),
            notes,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-bold text-center">Record Bird Sale for {flock.name}</h2>
            
            {error && <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-md">{error}</p>}

            <div className="form-group">
                <label htmlFor="quantity" className="form-label flex items-center gap-2"><Hash size={16} />Quantity Sold</label>
                <input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="input w-full"
                    placeholder={`Max: ${flock.quantity}`}
                    max={flock.quantity}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="revenue" className="form-label flex items-center gap-2"><DollarSign size={16} />Total Revenue</label>
                <input
                    id="revenue"
                    type="number"
                    step="0.01"
                    value={revenue}
                    onChange={(e) => setRevenue(e.target.value)}
                    className="input w-full"
                    placeholder="e.g., 500.00"
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="notes" className="form-label flex items-center gap-2"><FileText size={16} />Notes (Optional)</label>
                <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="input w-full"
                    rows="3"
                    placeholder="e.g., Sold to John Doe"
                ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onClose} className="btn-secondary" disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Sale'}
                </button>
            </div>
        </form>
    );
}
