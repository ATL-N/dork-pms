// app/staff/page.jsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Home, Users, Mail, Plus, MoreVertical } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNotification } from '../context/NotificationContext';
import Modal from '../components/Modal';
// Modals to be created
import InviteUserModal from '../components/modals/InviteUserModal';
import ChangeRoleModal from '../components/modals/ChangeRoleModal';
import RemoveUserModal from '../components/modals/RemoveUserModal';
import CancelInvitationModal from '../components/modals/CancelInvitationModal';

function StaffPageContent() {
    const [farms, setFarms] = useState([]);
    const [activeFarmId, setActiveFarmId] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('staff'); // 'staff' or 'invitations'
    
    const [staff, setStaff] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [isDataLoading, setIsDataLoading] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({ type: null, data: null });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: session } = useSession();
    const { addNotification } = useNotification();

    const fetchUserFarms = useCallback(async () => {
        if (!session) return;
        setIsLoading(true);
        try {
            const res = await fetch('/api/user/farms');
            if (!res.ok) throw new Error('Failed to fetch farms');
            const farmsData = await res.json();
            setFarms(farmsData);
            if (farmsData.length > 0) {
                const initialFarm = farmsData[0];
                setActiveFarmId(initialFarm.id);
                setUserRole(initialFarm.role);
            }
        } catch (err) {
            addNotification(err.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [session, addNotification]);

    useEffect(() => {
        fetchUserFarms();
    }, [fetchUserFarms]);

    const fetchDataForFarm = useCallback(async () => {
        if (!activeFarmId) return;
        setIsDataLoading(true);
        try {
            const [staffRes, invitationsRes] = await Promise.all([
                fetch(`/api/staff?farmId=${activeFarmId}`),
                fetch(`/api/staff/invitations?farmId=${activeFarmId}`)
            ]);

            if (!staffRes.ok) throw new Error('Failed to fetch staff');
            const staffData = await staffRes.json();
            setStaff(staffData);

            if (!invitationsRes.ok) throw new Error('Failed to fetch invitations');
            const invitationsData = await invitationsRes.json();
            setInvitations(invitationsData);

        } catch (err) {
            addNotification(err.message, 'error');
        } finally {
            setIsDataLoading(false);
        }
    }, [activeFarmId, addNotification]);

    useEffect(() => {
        fetchDataForFarm();
    }, [fetchDataForFarm]);

    const handleModalSubmit = async (url, body, method = 'POST', successMessage) => {
        setIsSubmitting(true);
        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to process request');
            }

            addNotification(successMessage, 'success');
            closeModal();
            fetchDataForFarm();
        } catch (err) {
            addNotification(err.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openModal = (type, data = null) => {
        setModalConfig({ type, data });
        setShowModal(true);
    };

    const closeModal = () => {
        if (isSubmitting) return;
        setShowModal(false);
        setTimeout(() => setModalConfig({ type: null, data: null }), 300);
    };

    const canManageStaff = userRole === 'OWNER' || userRole === 'MANAGER';

    const renderModalContent = () => {
        const { type, data } = modalConfig;
        if (!type) return null;

        switch(type) {
            case 'invite':
                return <InviteUserModal
                    farmId={activeFarmId}
                    isSubmitting={isSubmitting}
                    onClose={closeModal}
                    onInvite={(inviteData) => handleModalSubmit('/api/staff/invitations', inviteData, 'POST', 'Invitation sent successfully!')}
                />;
            case 'changeRole':
                return <ChangeRoleModal
                    user={data}
                    farmId={activeFarmId}
                    isSubmitting={isSubmitting}
                    onClose={closeModal}
                    onChangeRole={(roleData) => handleModalSubmit(`/api/staff/${data.user.id}`, roleData, 'PUT', 'User role updated.')}
                />;
            case 'removeUser':
                return <RemoveUserModal
                    user={data}
                    farmId={activeFarmId}
                    isSubmitting={isSubmitting}
                    onClose={closeModal}
                    onConfirm={() => handleModalSubmit(`/api/staff/${data.user.id}?farmId=${activeFarmId}`, {}, 'DELETE', 'User removed from farm.')}
                />;
            case 'cancelInvitation':
                return <CancelInvitationModal
                    invitation={data}
                    isSubmitting={isSubmitting}
                    onClose={closeModal}
                    onConfirm={() => handleModalSubmit(`/api/staff/invitations/${data.id}`, {}, 'DELETE', 'Invitation cancelled.')}
                />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-bold">Staff Management</h1>
                {canManageStaff && (
                    <button
                        className="btn-primary flex items-center gap-2 w-full md:w-auto"
                        onClick={() => openModal('invite')}
                        disabled={!activeFarmId || isSubmitting}
                    >
                        <Plus size={18} />
                        <span>Invite User</span>
                    </button>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-2 border-b border-[color:var(--border)] pb-2">
                <span className="font-medium mr-2 shrink-0">Farm:</span>
                {isLoading ? <LoadingSpinner /> : farms.length > 0 ? farms.map(farm => (
                    <button
                        key={farm.id}
                        className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-2 shrink-0 ${
                        activeFarmId === farm.id
                            ? "bg-[color:var(--primary)] text-white"
                            : "bg-[color:var(--card)] hover:bg-[color:var(--accent)]"
                        }`}
                        onClick={() => {
                            setActiveFarmId(farm.id);
                            setUserRole(farm.role);
                        }}
                    >
                        <Home size={16} />
                        {farm.name}
                    </button>
                )) : <p className="text-sm text-[color:var(--muted-foreground)]">No farms found.</p>}
            </div>

            {activeFarmId ? (
                <>
                    <div className="flex border-b border-[color:var(--border)]">
                        <button
                            className={`px-4 py-2 font-medium flex items-center gap-2 ${
                            activeTab === 'staff'
                                ? "text-[color:var(--primary)] border-b-2 border-[color:var(--primary)]"
                                : "text-[color:var(--muted-foreground)]"
                            }`}
                            onClick={() => setActiveTab('staff')}
                        >
                            <Users size={16} /> Current Staff
                        </button>
                        <button
                            className={`px-4 py-2 font-medium flex items-center gap-2 ${
                            activeTab === 'invitations'
                                ? "text-[color:var(--primary)] border-b-2 border-[color:var(--primary)]"
                                : "text-[color:var(--muted-foreground)]"
                            }`}
                            onClick={() => setActiveTab('invitations')}
                        >
                            <Mail size={16} /> Pending Invitations
                        </button>
                    </div>

                    {isDataLoading ? <LoadingSpinner /> : (
                        <div className="overflow-x-auto">
                            {activeTab === 'staff' ? (
                                <StaffTable staff={staff} canManage={canManageStaff} onEditRole={(user) => openModal('changeRole', user)} onRemoveUser={(user) => openModal('removeUser', user)} />
                            ) : (
                                <InvitationsTable invitations={invitations} canManage={canManageStaff} onCancel={(invitation) => openModal('cancelInvitation', invitation)} onResend={(id) => handleModalSubmit(`/api/staff/invitations/${id}/resend`, {}, 'POST', 'Invitation resent.')} />
                            )}
                        </div>
                    )}
                </>
            ) : (
                !isLoading && <div className="text-center p-8">
                    <h2 className="text-xl font-semibold">No Farm Selected</h2>
                    <p className="mt-2 text-[color:var(--muted-foreground)]">Please select a farm to manage staff.</p>
                </div>
            )}

            {showModal && (
                <Modal onClose={closeModal} hideDefaultButtons={true}>
                    {renderModalContent()}
                </Modal>
            )}
        </div>
    );
}

const StaffTable = ({ staff, canManage, onEditRole, onRemoveUser }) => (
    <table className="w-full text-sm text-left">
        <thead className="bg-[color:var(--muted)]">
            <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Date Joined</th>
                {canManage && <th className="p-3 text-right">Actions</th>}
            </tr>
        </thead>
        <tbody>
            {staff.map(member => (
                <tr key={member.user.id} className="border-b border-[color:var(--border)]">
                    <td className="p-3 font-medium">{member.user.name}</td>
                    <td className="p-3">{member.user.email}</td>
                    <td className="p-3"><span className="badge-info">{member.role}</span></td>
                    <td className="p-3">{new Date(member.assignedAt).toLocaleDateString()}</td>
                    {canManage && (
                        <td className="p-3 text-right">
                            <div className="relative inline-block">
                                <button onClick={() => onEditRole(member)} className="btn-secondary mr-2">Edit Role</button>
                                <button onClick={() => onRemoveUser(member)} className="btn-danger">Remove</button>
                            </div>
                        </td>
                    )}
                </tr>
            ))}
        </tbody>
    </table>
);

const InvitationsTable = ({ invitations, canManage, onCancel, onResend }) => (
    <table className="w-full text-sm text-left">
        <thead className="bg-[color:var(--muted)]">
            <tr>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Date Sent</th>
                <th className="p-3">Status</th>
                {canManage && <th className="p-3 text-right">Actions</th>}
            </tr>
        </thead>
        <tbody>
            {invitations.map(invite => (
                <tr key={invite.id} className="border-b border-[color:var(--border)]">
                    <td className="p-3 font-medium">{invite.email}</td>
                    <td className="p-3">{invite.role}</td>
                    <td className="p-3">{new Date(invite.createdAt).toLocaleDateString()}</td>
                    <td className="p-3"><span className="badge-warning">{invite.status}</span></td>
                    {canManage && (
                        <td className="p-3 text-right">
                             <button onClick={() => onResend(invite.id)} className="btn-secondary mr-2">Resend</button>
                             <button onClick={() => onCancel(invite)} className="btn-danger">Cancel</button>
                        </td>
                    )}
                </tr>
            ))}
        </tbody>
    </table>
);


export default function StaffPage() {
    return (
        <React.Suspense fallback={<LoadingSpinner />}>
            <StaffPageContent />
        </React.Suspense>
    );
}