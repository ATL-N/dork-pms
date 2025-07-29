// app/components/modals/ChangeRoleModal.jsx
"use client";

import React, { useState } from 'react';

const ChangeRoleModal = ({ user, farmId, isSubmitting, onClose, onChangeRole }) => {
    const [role, setRole] = useState(user.role);

    const handleSubmit = (e) => {
        e.preventDefault();
        onChangeRole({ farmId, role });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-lg font-bold">Change Role for {user.user.name}</h2>
            
            <div>
                <label htmlFor="role" className="block text-sm font-medium mb-1">Assign New Role</label>
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
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
};

export default ChangeRoleModal;
