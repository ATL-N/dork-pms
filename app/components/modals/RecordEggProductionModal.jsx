// app/components/modals/RecordEggProductionModal.jsx
"use client";
import React, { useState } from 'react';
import { Egg } from 'lucide-react';

export default function RecordEggProductionModal({ flock, onSave, onClose, isSubmitting }) {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [totalEggs, setTotalEggs] = useState('');
    const [brokenEggs, setBrokenEggs] = useState('');
    const [averageWeight, setAverageWeight] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            flockId: flock.id,
            // date,
            totalEggs: parseInt(totalEggs, 10),
            brokenEggs: parseInt(brokenEggs, 10) || 0,
            averageWeight: parseFloat(averageWeight) || null,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-bold">Record Egg Production for {flock.name}</h2>
            
            <div>
                <label htmlFor="date" className="block text-sm font-medium">Date</label>
                <input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="input w-full"
                    required
                />
            </div>

            <div>
                <label htmlFor="totalEggs" className="block text-sm font-medium">Total Eggs Collected</label>
                <input
                    id="totalEggs"
                    type="number"
                    value={totalEggs}
                    onChange={(e) => setTotalEggs(e.target.value)}
                    className="input w-full"
                    placeholder="e.g., 1200"
                    required
                />
            </div>

            <div>
                <label htmlFor="brokenEggs" className="block text-sm font-medium">Broken or Damaged Eggs</label>
                <input
                    id="brokenEggs"
                    type="number"
                    value={brokenEggs}
                    onChange={(e) => setBrokenEggs(e.target.value)}
                    className="input w-full"
                    placeholder="e.g., 15"
                />
            </div>
            
            <div>
                <label htmlFor="averageWeight" className="block text-sm font-medium">Average Egg Weight (grams)</label>
                <input
                    id="averageWeight"
                    type="number"
                    step="0.1"
                    value={averageWeight}
                    onChange={(e) => setAverageWeight(e.target.value)}
                    className="input w-full"
                    placeholder="e.g., 62.5"
                />
            </div>

            <div className="flex justify-end gap-3">
                <button type="button" onClick={onClose} className="btn-secondary" disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn-primary flex items-center gap-2" disabled={isSubmitting}>
                    <Egg size={18} />
                    {isSubmitting ? 'Saving...' : 'Save Production'}
                </button>
            </div>
        </form>
    );
}
