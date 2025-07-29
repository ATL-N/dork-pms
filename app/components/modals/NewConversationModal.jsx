// app/components/modals/NewConversationModal.jsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from '../LoadingSpinner';
import { useNotification } from '../../context/NotificationContext';

import { Users } from 'lucide-react';

const UserTag = ({ userType }) => {
    const roleColors = {
        ADMIN: 'bg-red-500 text-white',
        FARM_OWNER: 'bg-blue-500 text-white',
        FARM_MANAGER: 'bg-green-500 text-white',
        WORKER: 'bg-yellow-500 text-black',
        VET: 'bg-purple-500 text-white',
        default: 'bg-gray-500 text-white',
    };
    const color = roleColors[userType] || roleColors.default;
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${color}`}>
            {userType.replace('_', ' ')}
        </span>
    );
};

const NewConversationModal = ({ onClose, onCreateConversation, conversations }) => {
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addNotification } = useNotification();

    const fetchAllUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/users');
            if (!res.ok) throw new Error('Failed to fetch users');
            const data = await res.json();
            setAllUsers(data);
        } catch (err) {
            addNotification(err.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [addNotification]);

    useEffect(() => {
        fetchAllUsers();
    }, [fetchAllUsers]);

    const handleUserToggle = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleCreateGeneralChat = async () => {
        const generalChat = conversations.find(c => c.name === 'General Chat');
        if (generalChat) {
            addNotification('A general chat already exists.', 'info');
            onClose();
            return;
        }

        setIsSubmitting(true);
        const allUserIds = allUsers.map(user => user.id);
        await onCreateConversation(allUserIds, 'General Chat');
        setIsSubmitting(false);
    };

    const handleSubmit = async () => {
        if (selectedUsers.length === 0) {
            addNotification('Please select at least one user.', 'error');
            return;
        }
        setIsSubmitting(true);
        await onCreateConversation(selectedUsers);
        setIsSubmitting(false);
    };

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold">Start New Conversation</h2>
            
            {isLoading ? <LoadingSpinner /> : (
                <div className="max-h-60 overflow-y-auto border border-[color:var(--border)] rounded-md p-2">
                    {allUsers.map(user => (
                        <div key={user.id} className="flex items-center gap-3 p-2 hover:bg-[color:var(--muted)] rounded-md">
                            <input
                                type="checkbox"
                                id={`user-${user.id}`}
                                checked={selectedUsers.includes(user.id)}
                                onChange={() => handleUserToggle(user.id)}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label htmlFor={`user-${user.id}`} className="flex-1 cursor-pointer">
                                <div className="flex items-center justify-between">
                                    <p className="font-medium">{user.name}</p>
                                    <div className="flex items-center gap-2">
                                        {user.isSameFarm && <Users size={16} className="text-blue-500" title="Same Farm" />}
                                        <UserTag userType={user.userType} />
                                    </div>
                                </div>
                                <p className="text-sm text-[color:var(--muted-foreground)]">{user.email}</p>
                            </label>
                        </div>
                    ))}
                </div>
            )}
            <div className="flex justify-end gap-4">
                <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
                    Cancel
                </button>
                <button onClick={handleSubmit} className="btn-primary" disabled={isSubmitting || isLoading || selectedUsers.length === 0}>
                    {isSubmitting ? 'Starting...' : 'Start Chat'}
                </button>
            </div>
        </div>
    );
};

export default NewConversationModal;
