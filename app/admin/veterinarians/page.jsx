// app/admin/veterinarians/page.jsx
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useNotification } from '@/app/context/NotificationContext';
import Modal from "@/app/components/Modal";
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { Plus, UserCheck, Clock, XCircle, Download, MoreVertical, Trash2 } from 'lucide-react';

const AddVetForm = ({ onVetAdded, onClose }) => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', specialization: '', licenseNumber: '', country: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addNotification } = useNotification();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/admin/veterinarians', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to add vet');
            addNotification('Veterinarian added successfully!', 'success');
            onVetAdded();
            onClose();
        } catch (error) {
            addNotification(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold">Add New Veterinarian</h2>
            <input name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" className="input" required />
            <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email Address" className="input" required />
            <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Temporary Password" className="input" required />
            <input name="specialization" value={formData.specialization} onChange={handleChange} placeholder="Specialization (e.g., Poultry)" className="input" required />
            <input name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} placeholder="License Number (Optional)" className="input" />
            <input name="country" value={formData.country} onChange={handleChange} placeholder="Country (Optional)" className="input" />
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Adding...' : 'Add Vet'}</button>
            </div>
        </form>
    );
};

const StatusBadge = ({ status }) => {
    const statusMap = {
        PENDING: { text: 'Pending', color: 'bg-yellow-500', icon: Clock },
        APPROVED: { text: 'Approved', color: 'bg-green-500', icon: UserCheck },
        REJECTED: { text: 'Rejected', color: 'bg-red-500', icon: XCircle },
    };
    const statusDetails = statusMap[status];

    if (!statusDetails) {
        return null;
    }

    const { text, color, icon: Icon } = statusDetails;
    return (
        <span className={`px-2 py-1 text-xs font-medium text-white rounded-full flex items-center gap-1 ${color}`}>
            <Icon size={14} /> {text}
        </span>
    );
};

const ActionMenu = ({ vet, onUpdate, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-[color:var(--accent)]">
                <MoreVertical size={18} />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[color:var(--card)] border border-[color:var(--border)] rounded-md shadow-lg z-10">
                    <ul>
                        {vet.vetProfile?.approvalStatus !== 'APPROVED' && (
                            <li><button onClick={() => { onUpdate(vet.id, 'APPROVED'); setIsOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-[color:var(--accent)] flex items-center gap-2"><UserCheck size={14} /> Approve</button></li>
                        )}
                        {vet.vetProfile?.approvalStatus !== 'REJECTED' && (
                            <li><button onClick={() => { onUpdate(vet.id, 'REJECTED'); setIsOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-[color:var(--accent)] flex items-center gap-2"><XCircle size={14} /> Reject</button></li>
                        )}
                        <li><button onClick={() => { onDelete(vet.id); setIsOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-[color:var(--accent)] text-red-500 flex items-center gap-2"><Trash2 size={14} /> Delete</button></li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default function AdminVetsPage() {
    const [vets, setVets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedVet, setSelectedVet] = useState(null);
    const { addNotification } = useNotification();

    const fetchVets = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/admin/vets');
            if (!res.ok) throw new Error('Failed to fetch vets');
            setVets((await res.json()).filter(vet => !vet.deletedAt)); // Filter out soft-deleted vets
        } catch (error) {
            addNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [addNotification]);

    useEffect(() => {
        fetchVets();
    }, [fetchVets]);

    const handleUpdateStatus = async (vetId, status) => {
        try {
            const res = await fetch('/api/admin/vets', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vetId, status }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to update status');
            addNotification('Status updated successfully!', 'success');
            fetchVets();
        } catch (error) {
            addNotification(error.message, 'error');
        }
    };

    const openDeleteConfirm = (vetId) => {
        setSelectedVet(vetId);
        setShowConfirmModal(true);
    };

    const handleDeleteVet = async () => {
        if (!selectedVet) return;
        try {
            const res = await fetch(`/api/admin/vets/${selectedVet}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to delete vet');
            addNotification('Veterinarian deleted successfully.', 'success');
            fetchVets();
        } catch (error) {
            addNotification(error.message, 'error');
        } finally {
            setShowConfirmModal(false);
            setSelectedVet(null);
        }
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Manage Veterinarians</h1>
                <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
                    <Plus size={18} /> Add New Vet
                </button>
            </div>

            <div className="card">
                <ul className="divide-y divide-[color:var(--border)]">
                    {vets.map(vet => (
                        <li key={vet.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <img src={vet.image || '/default-avatar.png'} alt={vet.name} className="w-12 h-12 rounded-full" />
                                <div>
                                    <p className="font-bold">{vet.name}</p>
                                    <p className="text-sm text-[color:var(--muted-foreground)]">{vet.vetProfile?.specialization || 'No specialization'}</p>
                                    <p className="text-xs text-[color:var(--muted-foreground)]">{vet.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {vet.vetProfile?.qualificationUrl && (
                                    <a href={vet.vetProfile.qualificationUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs flex items-center gap-1">
                                        <Download size={14} /> Doc
                                    </a>
                                )}
                                <StatusBadge status={vet.vetProfile?.approvalStatus} />
                                <ActionMenu vet={vet} onUpdate={handleUpdateStatus} onDelete={openDeleteConfirm} />
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {showAddModal && (
                <Modal onClose={() => setShowAddModal(false)} hideDefaultButtons={true}>
                    <AddVetForm onVetAdded={fetchVets} onClose={() => setShowAddModal(false)} />
                </Modal>
            )}

            {showConfirmModal && (
                <Modal onClose={() => setShowConfirmModal(false)} onConfirm={handleDeleteVet} confirmText="This will soft-delete the user, but they can be recovered later.">
                    <h3 className="text-lg font-semibold">Are you sure?</h3>
                    <p className="text-[color:var(--muted-foreground)]">Do you really want to delete this veterinarian?</p>
                </Modal>
            )}
        </div>
    );
}
