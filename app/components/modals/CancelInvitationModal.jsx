// app/components/modals/CancelInvitationModal.jsx
"use client";

import React from 'react';

const CancelInvitationModal = ({ invitation, isSubmitting, onClose, onConfirm }) => {
    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold">Cancel Invitation</h2>
            <p>
                Are you sure you want to cancel the invitation for <span className="font-bold">{invitation.email}</span>?
            </p>
            <div className="flex justify-end gap-4">
                <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
                    Back
                </button>
                <button onClick={onConfirm} className="btn-danger" disabled={isSubmitting}>
                    {isSubmitting ? 'Cancelling...' : 'Yes, Cancel'}
                </button>
            </div>
        </div>
    );
};

export default CancelInvitationModal;
