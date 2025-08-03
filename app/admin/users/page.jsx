// app/admin/users/page.jsx
"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNotification } from '@/app/context/NotificationContext';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import Modal from '@/app/components/Modal';
import { MoreVertical, Edit, Trash2, Search } from 'lucide-react';

const UserTypeBadge = ({ userType }) => {
    const typeMap = {
        ADMIN: 'bg-red-500',
        VET: 'bg-blue-500',
        FARMER: 'bg-green-500',
    };
    return <span className={`px-2 py-1 text-xs font-medium text-white rounded-full ${typeMap[userType]}`}>{userType}</span>;
};

const ActionMenu = ({ user, onEdit, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-[color:var(--accent)]"><MoreVertical size={18} /></button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[color:var(--card)] border border-[color:var(--border)] rounded-md shadow-lg z-10">
                    <ul>
                        <li><button onClick={() => { onEdit(user); setIsOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-[color:var(--accent)] flex items-center gap-2"><Edit size={14} /> Change Role</button></li>
                        <li><button onClick={() => { onDelete(user); setIsOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-[color:var(--accent)] text-red-500 flex items-center gap-2"><Trash2 size={14} /> Delete User</button></li>
                    </ul>
                </div>
            )}
        </div>
    );
};

const EditUserModal = ({ user, onClose, onUserUpdated }) => {
    const [userType, setUserType] = useState(user.userType);
    const { addNotification } = useNotification();

    const handleUpdate = async () => {
        try {
            const res = await fetch(`/api/admin/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userType }),
            });
            if (!res.ok) throw new Error('Failed to update role');
            addNotification('User role updated!', 'success');
            onUserUpdated();
            onClose();
        } catch (error) {
            addNotification(error.message, 'error');
        }
    };

    return (
        <Modal onClose={onClose} onConfirm={handleUpdate} confirmText="Are you sure you want to change this user's role?">
            <h3 className="text-lg font-semibold">Edit User: {user.name}</h3>
            <div className="mt-4">
                <label className="form-label">User Role</label>
                <select value={userType} onChange={(e) => setUserType(e.target.value)} className="input">
                    <option value="FARMER">FARMER</option>
                    <option value="VET">VET</option>
                    <option value="ADMIN">ADMIN</option>
                </select>
            </div>
        </Modal>
    );
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [deletingUser, setDeletingUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const { addNotification } = useNotification();

    const fetchUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/admin/users');
            if (!res.ok) throw new Error('Failed to fetch users');
            setUsers(await res.json());
        } catch (error) {
            addNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [addNotification]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleDelete = async () => {
        if (!deletingUser) return;
        try {
            const res = await fetch(`/api/admin/users/${deletingUser.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete user');
            addNotification('User deleted successfully.', 'success');
            fetchUsers();
        } catch (error) {
            addNotification(error.message, 'error');
        } finally {
            setDeletingUser(null);
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = !roleFilter || user.userType === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [users, searchTerm, roleFilter]);

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Manage Users</h1>
            
            <div className="card p-4 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="input w-full pl-10"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 text-[color:var(--muted-foreground)]" size={18} />
                </div>
                <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input">
                    <option value="">All Roles</option>
                    <option value="FARMER">FARMER</option>
                    <option value="VET">VET</option>
                    <option value="ADMIN">ADMIN</option>
                </select>
            </div>

            <div className="card">
                <ul className="divide-y divide-[color:var(--border)]">
                    {filteredUsers.map(user => (
                        <li key={user.id} className="p-4 flex items-center justify-between">
                            <div>
                                <p className="font-bold">{user.name}</p>
                                <p className="text-sm text-[color:var(--muted-foreground)]">{user.email}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <UserTypeBadge userType={user.userType} />
                                <ActionMenu user={user} onEdit={setEditingUser} onDelete={setDeletingUser} />
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onUserUpdated={fetchUsers} />}
            {deletingUser && (
                <Modal onClose={() => setDeletingUser(null)} onConfirm={handleDelete} confirmText="This will soft-delete the user.">
                    <h3 className="text-lg font-semibold">Confirm Deletion</h3>
                    <p>Are you sure you want to delete {deletingUser.name}?</p>
                </Modal>
            )}
        </div>
    );
}
