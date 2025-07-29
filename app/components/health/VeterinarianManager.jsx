// app/components/health/VeterinarianManager.jsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { UserCheck, UserPlus, Mail, ShieldX, Clock } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import { useNotification } from '../../context/NotificationContext';
import Modal from '../Modal';
import InviteVetModal from '../modals/InviteVetModal';

export default function VeterinarianManager({ farmId }) {
    const [vets, setVets] = useState([]);
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { addNotification } = useNotification();
    const [showInviteModal, setShowInviteModal] = useState(false);

    const fetchData = useCallback(async () => {
        if (!farmId) return;
        setIsLoading(true);
        try {
            // API routes need to be created for these
            const [vetsRes, requestsRes] = await Promise.all([
                fetch(`/api/farms/${farmId}/vet-access`),
                fetch(`/api/farms/${farmId}/vet-access-requests`)
            ]);

            if (!vetsRes.ok || !requestsRes.ok) {
                throw new Error('Failed to fetch veterinarian data');
            }

            const vetsData = await vetsRes.json();
            const requestsData = await requestsRes.json();

            setVets(vetsData);
            setRequests(requestsData);

        } catch (error) {
            addNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [farmId, addNotification]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleRequest = async (requestId, action) => {
        try {
            const res = await fetch(`/api/farms/${farmId}/vet-access-requests`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId, action }), // 'approve' or 'reject'
            });
            if (!res.ok) throw new Error(`Failed to ${action} request`);
            addNotification(`Request ${action}d successfully.`, 'success');
            fetchData(); // Refresh data
        } catch (error) {
            addNotification(error.message, 'error');
        }
    };

    const handleRevoke = async (accessId) => {
        if (!confirm('Are you sure you want to revoke access for this veterinarian?')) return;
        try {
            const res = await fetch(`/api/farms/${farmId}/vet-access/${accessId}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to revoke access');
            addNotification('Access revoked successfully.', 'success');
            fetchData(); // Refresh data
        } catch (error) {
            addNotification(error.message, 'error');
        }
    };
    
    const handleInvite = () => {
        setShowInviteModal(true);
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Veterinarians */}
            <div className="card p-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <UserCheck className="text-primary" />
                        Active Veterinarians
                    </h3>
                    <button className="btn-primary flex items-center gap-2" onClick={handleInvite}>
                        <UserPlus size={18} />
                        Invite Vet
                    </button>
                </div>
                <div className="space-y-3">
                    {vets.length > 0 ? vets.map(vet => (
                        <div key={vet.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                            <div>
                                <p className="font-medium">{vet.user.name}</p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                    <Mail size={14} /> {vet.user.email}
                                </p>
                            </div>
                            <button 
                                className="btn-destructive-outline text-xs"
                                onClick={() => handleRevoke(vet.id)}
                            >
                                <ShieldX size={14} className="inline mr-1" />
                                Revoke
                            </button>
                        </div>
                    )) : <p className="text-center text-muted-foreground py-4">No active veterinarians.</p>}
                </div>
            </div>

            {/* Pending Requests */}
            <div className="card p-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <Clock className="text-primary" />
                    Pending Access Requests
                </h3>
                <div className="space-y-3">
                    {requests.length > 0 ? requests.map(req => (
                        <div key={req.id} className="p-3 bg-muted/50 rounded-md">
                            <div>
                                <p className="font-medium">{req.veterinarian.name}</p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                    <Mail size={14} /> {req.veterinarian.email}
                                </p>
                                {req.message && <p className="text-sm mt-2 p-2 bg-background rounded">{req.message}</p>}
                            </div>
                            <div className="flex justify-end gap-2 mt-3">
                                <button className="btn-secondary" onClick={() => handleRequest(req.id, 'reject')}>Reject</button>
                                <button className="btn-primary" onClick={() => handleRequest(req.id, 'approve')}>Approve</button>
                            </div>
                        </div>
                    )) : <p className="text-center text-muted-foreground py-4">No pending requests.</p>}
                </div>
            </div>

            {showInviteModal && (
                <Modal onClose={() => setShowInviteModal(false)} hideDefaultButtons={true}>
                    <InviteVetModal 
                        farmId={farmId} 
                        onInviteSent={() => {
                            setShowInviteModal(false);
                            fetchData();
                        }}
                        onClose={() => setShowInviteModal(false)}
                    />
                </Modal>
            )}
        </div>
    );
}
