// app/components/modals/RecordFeedConsumptionModal.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { Droplet } from 'lucide-react';

export default function RecordFeedConsumptionModal({ flock, onSave, onClose, isSubmitting }) {
    const [quantity, setQuantity] = useState('');
    const [feedItemId, setFeedItemId] = useState('');
    const [notes, setNotes] = useState('');
    const [availableFeeds, setAvailableFeeds] = useState([]);

    useEffect(() => {
        const fetchFeeds = async () => {
            try {
                const res = await fetch(`/api/farms/${flock.farmId}/feed-items`);
                if (!res.ok) throw new Error('Failed to fetch feed items');
                const data = await res.json();
                // Filter for feeds that are not expired
                const validFeeds = data.filter(feed => !feed.expiryDate || new Date(feed.expiryDate) > new Date());
                setAvailableFeeds(validFeeds);
                if (validFeeds.length > 0) {
                    setFeedItemId(validFeeds[0].id);
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchFeeds();
    }, [flock.farmId]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!feedItemId) {
            alert("Please select a feed type.");
            return;
        }
        onSave({
            flockId: flock.id,
            feedItemId,
            quantity: parseFloat(quantity),
            notes,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-bold">Record Feed Consumption for {flock.name}</h2>
            
            <div>
                <label htmlFor="feedItem" className="block text-sm font-medium">Feed Type</label>
                <select
                    id="feedItem"
                    value={feedItemId}
                    onChange={(e) => setFeedItemId(e.target.value)}
                    className="input w-full"
                    required
                >
                    <option value="" disabled>Select feed...</option>
                    {availableFeeds.map(feed => (
                        <option key={feed.id} value={feed.id}>{feed.name} ({feed.quantity.toFixed(2)} {feed.unit} left)</option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="quantity" className="block text-sm font-medium">Quantity Consumed (in the feed's unit)</label>
                <input
                    id="quantity"
                    type="number"
                    step="0.01"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="input w-full"
                    placeholder="e.g., 50.5"
                    required
                />
            </div>

            <div>
                <label htmlFor="notes" className="block text-sm font-medium">Notes (Optional)</label>
                <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="input w-full"
                    rows="3"
                    placeholder="Any observations..."
                ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onClose} className="btn-secondary" disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn-primary flex items-center gap-2" disabled={isSubmitting}>
                    <Droplet size={18} />
                    {isSubmitting ? 'Saving...' : 'Save Consumption'}
                </button>
            </div>
        </form>
    );
}
