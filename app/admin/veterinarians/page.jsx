// app/admin/veterinarians/page.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { useNotification } from '@/app/context/NotificationContext';
import Modal from '@/app/components/modals/Modal';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { Plus, UserCheck } from 'lucide-react';

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

export default function AdminVetsPage() {
    const [vets, setVets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchVets = async () => {
        try {
            setIsLoading(true);
            // Reusing the public API to get the list of vets
            const res = await fetch('/api/veterinarians');
            if (!res.ok) throw new Error('Failed to fetch vets');
            setVets(await res.json());
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchVets();
    }, []);

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Manage Veterinarians</h1>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
                    <Plus size={18} /> Add New Vet
                </button>
            </div>

            <div className="card">
                <ul className="divide-y divide-[color:var(--border)]">
                    {vets.map(vet => (
                        <li key={vet.id} className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <img src={vet.image || '/default-avatar.png'} alt={vet.name} className="w-12 h-12 rounded-full" />
                                <div>
                                    <p className="font-bold">{vet.name}</p>
                                    <p className="text-sm text-[color:var(--muted-foreground)]">{vet.vetProfile.specialization}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-green-500">
                                <UserCheck size={18} />
                                <span>Verified</span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <AddVetForm onVetAdded={fetchVets} onClose={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
}
