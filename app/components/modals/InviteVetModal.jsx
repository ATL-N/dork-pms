// app/components/modals/InviteVetModal.jsx
"use client";

import React, { useState } from 'react';
import { useNotification } from '../../context/NotificationContext';
import LoadingSpinner from '../LoadingSpinner';

export default function InviteVetModal({ farmId, onInviteSent, onClose }) {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addNotification } = useNotification();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!email) {
            addNotification('Please enter a veterinarian\'s email address.', 'error');
            setIsSubmitting(false);
            return;
        }

        try {
            const res = await fetch(`/api/farms/${farmId}/vet-access/invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to send invitation');
            }

            addNotification('Invitation sent successfully!', 'success');
            if(onInviteSent) onInviteSent();
            onClose();

        } catch (error) {
            addNotification(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 bg-card rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Invite a Veterinarian</h2>
            <p className="text-muted-foreground mb-6">
                Enter the email of the veterinarian you wish to grant access to this farm. They will receive a notification to join.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">Veterinarian's Email</label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input mt-1 block w-full"
                        placeholder="vet@example.com"
                        required
                    />
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className="btn-secondary">
                        Cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? <LoadingSpinner size="small" /> : 'Send Invitation'}
                    </button>
                </div>
            </form>
        </div>
    );
}