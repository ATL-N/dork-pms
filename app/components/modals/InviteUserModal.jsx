// app/components/modals/InviteUserModal.jsx
"use client";

import React, { useState } from 'react';

const InviteUserModal = ({ farmId, isSubmitting, onClose, onInvite }) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('WORKER');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email) return;
        onInvite({ farmId, email, role });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-lg font-bold">Invite New User</h2>
            <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input w-full"
                    placeholder="user@example.com"
                    required
                />
            </div>
            <div>
                <label htmlFor="role" className="block text-sm font-medium mb-1">Assign Role</label>
                <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="input w-full"
                >
                    <option value="WORKER">Worker</option>
                    <option value="MANAGER">Manager</option>
                </select>
            </div>
            <div className="flex justify-end gap-4">
                <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
                    Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Send Invitation'}
                </button>
            </div>
        </form>
    );
};

export default InviteUserModal;
