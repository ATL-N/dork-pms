// app/components/modals/RemoveUserModal.jsx
"use client";

import React from 'react';

const RemoveUserModal = ({ user, isSubmitting, onClose, onConfirm }) => {
    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold">Remove User</h2>
            <p>
                Are you sure you want to remove <span className="font-bold">{user.user.name}</span> from this farm? 
                Their access will be revoked immediately.
            </p>
            <div className="flex justify-end gap-4">
                <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
                    Cancel
                </button>
                <button onClick={onConfirm} className="btn-danger" disabled={isSubmitting}>
                    {isSubmitting ? 'Removing...' : 'Confirm Remove'}
                </button>
            </div>
        </div>
    );
};

export default RemoveUserModal;
