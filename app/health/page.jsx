// app/health/page.jsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Home, Syringe, Users, ShieldCheck, Plus } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNotification } from '../context/NotificationContext';
import HealthCalendar from '../components/health/HealthCalendar';
import MedicationInventory from '../components/health/MedicationInventory';
import VeterinarianManager from '../components/health/VeterinarianManager';
import HealthScheduleTable from '../components/health/HealthScheduleTable';
import Modal from '../components/Modal';
import RecordHealthEventModal from '../components/modals/RecordHealthEventModal';

export default function HealthPage() {
    const [farms, setFarms] = useState([]);
    const [activeFarmId, setActiveFarmId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('calendar');
    const { addNotification } = useNotification();
    const { data: session } = useSession();
    const [tasks, setTasks] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({ type: null, data: null });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchUserFarms = useCallback(async () => {
        if (!session) return;
        setIsLoading(true);
        try {
            const res = await fetch('/api/user/farms');
            if (!res.ok) throw new Error('Failed to fetch farms');
            const farmsData = await res.json();
            setFarms(farmsData);
            if (farmsData.length > 0) {
                setActiveFarmId(farmsData[0].id);
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

    const fetchHealthTasks = useCallback(async () => {
        if (!activeFarmId) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/farms/${activeFarmId}/health-tasks`);
            if (!res.ok) throw new Error('Failed to fetch health tasks');
            const data = await res.json();
            setTasks(data);
        } catch (error) {
            addNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [activeFarmId, addNotification]);

    useEffect(() => {
        fetchHealthTasks();
    }, [fetchHealthTasks]);

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
                const errorMessage = errorData.error || 'Failed to process request';
                throw new Error(errorMessage);
            }

            addNotification(successMessage, 'success');
            closeModal();
            fetchHealthTasks();
        } catch (err) {
            console.error("Error:", err);
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

    const renderModalContent = () => {
        const { type, data: task } = modalConfig;
        if (!type) return null;

        switch(type) {
            case 'add':
                return <RecordHealthEventModal
                    isSubmitting={isSubmitting}
                    onClose={closeModal}
                    onSave={(data) => handleModalSubmit(`/api/farms/${activeFarmId}/health-tasks`, data, 'POST', 'Schedule added successfully!')}
                    farmId={activeFarmId}
                />;
            case 'edit':
                return <RecordHealthEventModal
                    isSubmitting={isSubmitting}
                    onClose={closeModal}
                    onSave={(data) => handleModalSubmit(`/api/farms/${activeFarmId}/health-tasks/${task.id}`, data, 'PUT', 'Schedule updated successfully!')}
                    taskToEdit={task}
                    farmId={activeFarmId}
                    isEditMode={true}
                />;
            default:
                return null;
        }
    }

    const handleDelete = async (task) => {
        if (window.confirm("Are you sure you want to delete this schedule?")) {
            await handleModalSubmit(`/api/farms/${activeFarmId}/health-tasks/${task.id}`, {}, 'DELETE', 'Schedule deleted successfully!');
        }
    };

    const renderActiveTabContent = () => {
        if (!activeFarmId) {
            return (
                <div className="text-center p-8 bg-card rounded-lg">
                    <h2 className="text-xl font-semibold">No Farm Selected</h2>
                    <p className="mt-2 text-muted-foreground">Please select a farm above to view its health dashboard.</p>
                </div>
            );
        }

        switch (activeTab) {
            case 'calendar':
                return <HealthCalendar farmId={activeFarmId} />;
            case 'schedule':
                return <HealthScheduleTable 
                            tasks={tasks} 
                            onEdit={(task) => openModal('edit', task)}
                            onDelete={handleDelete}
                            onAdd={() => openModal('add')}
                        />;
            case 'inventory':
                return <MedicationInventory farmId={activeFarmId} />;
            case 'vets':
                return <VeterinarianManager farmId={activeFarmId} />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Health Command Center</h1>

            <div className="flex flex-wrap items-center gap-2 border-b border-border pb-2">
                <span className="font-medium mr-2">Farm:</span>
                {farms.length > 0 ? farms.map(farm => (
                    <button
                        key={farm.id}
                        className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-2 ${
                            activeFarmId === farm.id
                                ? "bg-[color:var(--primary)] text-white"
                                : "bg-card hover:bg-accent"
                        }`}
                        onClick={() => setActiveFarmId(farm.id)}
                    >
                        <Home size={16} />
                        {farm.name}
                    </button>
                )) : !isLoading && <p className="text-sm text-muted-foreground">No farms found.</p>}
                 {isLoading && <LoadingSpinner size="small" />}
            </div>

            <nav className="flex" aria-label="Tabs">
                <button
                    onClick={() => setActiveTab('calendar')}
                    className={`px-4 py-2 font-medium flex items-center gap-2 ${
                        activeTab === 'calendar' 
                        ? "text-[color:var(--primary)] border-b-2 border-[color:var(--primary)]" 
                        : "text-muted-foreground"
                    }`}
                >
                    <Syringe size={16} />
                    Health Calendar
                </button>
                <button
                    onClick={() => setActiveTab('schedule')}
                    className={`px-4 py-2 font-medium flex items-center gap-2 ${
                        activeTab === 'schedule' 
                        ? "text-[color:var(--primary)] border-b-2 border-[color:var(--primary)]" 
                        : "text-muted-foreground"
                    }`}
                >
                    <ShieldCheck size={16} />
                    Schedule
                </button>
                <button
                    onClick={() => setActiveTab('inventory')}
                    className={`px-4 py-2 font-medium flex items-center gap-2 ${
                        activeTab === 'inventory' 
                        ? "text-[color:var(--primary)] border-b-2 border-[color:var(--primary)]" 
                        : "text-muted-foreground"
                    }`}
                >
                    <ShieldCheck size={16} />
                    Medication Inventory
                </button>
                <button
                    onClick={() => setActiveTab('vets')}
                    className={`px-4 py-2 font-medium flex items-center gap-2 ${
                        activeTab === 'vets' 
                        ? "text-[color:var(--primary)] border-b-2 border-[color:var(--primary)]" 
                        : "text-muted-foreground"
                    }`}
                >
                    <Users size={16} />
                    Veterinarian Manager
                </button>
            </nav>

            <div>
                {isLoading ? <LoadingSpinner /> : renderActiveTabContent()}
            </div>

            {showModal && (
                <Modal onClose={closeModal} hideDefaultButtons={true}>
                    {renderModalContent()}
                </Modal>
            )}
        </div>
    );
}