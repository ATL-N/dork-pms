// app/components/modals/AddStaffModal.jsx
"use client";
import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import { useNotification } from '@/app/context/NotificationContext';
import { Check, ChevronsUpDown } from 'lucide-react';

const MultiSelectDropdown = ({ options, selected, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (optionId) => {
        const newSelected = selected.includes(optionId)
            ? selected.filter(id => id !== optionId)
            : [...selected, optionId];
        onChange(newSelected);
    };

    const selectedNames = options
        .filter(opt => selected.includes(opt.id))
        .map(opt => opt.name)
        .join(', ');

    return (
        <div className="relative">
            <button type="button" onClick={() => setIsOpen(!isOpen)} className="input w-full text-left flex justify-between items-center">
                <span className="truncate">{selectedNames || placeholder}</span>
                <ChevronsUpDown size={16} className="text-[color:var(--muted-foreground)]" />
            </button>
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-[color:var(--card)] border border-[color:var(--border)] rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {options.map(option => (
                        <div key={option.id} onClick={() => handleSelect(option.id)} className="p-2 hover:bg-[color:var(--accent)] cursor-pointer flex items-center gap-2">
                            <div className={`w-4 h-4 border rounded-sm flex items-center justify-center ${selected.includes(option.id) ? 'bg-[color:var(--primary)]' : ''}`}>
                                {selected.includes(option.id) && <Check size={12} className="text-white" />}
                            </div>
                            {option.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


export default function AddStaffModal({ isOpen, onClose, onStaffAdded }) {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', contact: '', role: 'WORKER', farmIds: [] });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [ownedFarms, setOwnedFarms] = useState([]);
    const { addNotification } = useNotification();

    useEffect(() => {
        const fetchOwnedFarms = async () => {
            try {
                // This reuses the dashboard API to get farm info, which is efficient
                const res = await fetch('/api/dashboard/owner');
                const data = await res.json();
                if (data && data.summary.totalFarms > 0) {
                    // The API doesn't return a simple list of farms, so we need to fetch them separately.
                    // A dedicated endpoint would be better, but this works for now.
                    const farmsRes = await fetch('/api/user/farms');
                    const farmsData = await farmsRes.json();
                    setOwnedFarms(farmsData);
                }
            } catch (error) {
                addNotification('Could not load your farms for assignment.', 'error');
            }
        };
        if (isOpen) {
            fetchOwnedFarms();
        }
    }, [isOpen, addNotification]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFarmsChange = (farmIds) => {
        setFormData({ ...formData, farmIds });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/staff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to add staff');
            addNotification('Staff member added successfully!', 'success');
            if(onStaffAdded) onStaffAdded();
            onClose();
        } catch (error) {
            addNotification(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} hideDefaultButtons={true}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-2xl font-bold mb-4">Add New Staff Member</h2>
                <input name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" className="input" required />
                <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email Address" className="input" required />
                <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Set Temporary Password" className="input" required />
                <input name="contact" value={formData.contact} onChange={handleChange} placeholder="Phone Number (Optional)" className="input" />
                <select name="role" value={formData.role} onChange={handleChange} className="input">
                    <option value="WORKER">Worker</option>
                    <option value="MANAGER">Manager</option>
                </select>
                <MultiSelectDropdown
                    options={ownedFarms}
                    selected={formData.farmIds}
                    onChange={handleFarmsChange}
                    placeholder="Select farms to assign"
                />
                <div className="flex justify-end gap-2 pt-4">
                    <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                    <button type="submit" className="btn-primary" disabled={isSubmitting || formData.farmIds.length === 0}>
                        {isSubmitting ? 'Adding...' : 'Add Staff'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
