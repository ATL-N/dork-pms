// app/admin/logs/page.jsx
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useNotification } from '@/app/context/NotificationContext';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

const LogLevelBadge = ({ level }) => {
    const levelMap = {
        INFO: 'bg-blue-500',
        WARN: 'bg-yellow-500',
        ERROR: 'bg-red-500',
    };
    return <span className={`px-2 py-1 text-xs font-medium text-white rounded-full ${levelMap[level] || 'bg-gray-500'}`}>{level}</span>;
};

export default function AdminLogsPage() {
    const [logData, setLogData] = useState({ logs: [], currentPage: 1, totalPages: 1 });
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({
        searchTerm: '',
        level: '',
        startDate: '',
        endDate: '',
    });
    const { addNotification } = useNotification();

    const fetchLogs = useCallback(async (page, filters) => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams({ page });
            if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);
            if (filters.level) params.append('level', filters.level);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            
            const res = await fetch(`/api/admin/logs?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch logs');
            setLogData(await res.json());
        } catch (error) {
            addNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [addNotification]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLogs(currentPage, filters);
        }, 500); // Debounce search term
        return () => clearTimeout(timer);
    }, [currentPage, filters, fetchLogs]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(1);
    };
    
    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(1);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= logData.totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">System Event Logs</h1>

            <div className="card p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                    <div className="relative flex-grow lg:col-span-2">
                        <input
                            type="text"
                            name="searchTerm"
                            placeholder="Search by user or message..."
                            className="input w-full pl-10"
                            value={filters.searchTerm}
                            onChange={handleFilterChange}
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--muted-foreground)]" size={18} />
                    </div>
                    <select name="level" value={filters.level} onChange={handleFilterChange} className="input">
                        <option value="">All Levels</option>
                        <option value="INFO">INFO</option>
                        <option value="WARN">WARN</option>
                        <option value="ERROR">ERROR</option>
                    </select>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startDate" className="text-xs text-[color:var(--muted-foreground)]">Start Date</label>
                            <input
                                type="date"
                                id="startDate"
                                name="startDate"
                                className="input w-full"
                                value={filters.startDate}
                                onChange={handleDateChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="text-xs text-[color:var(--muted-foreground)]">End Date</label>
                            <input
                                type="date"
                                id="endDate"
                                name="endDate"
                                className="input w-full"
                                value={filters.endDate}
                                onChange={handleDateChange}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="card overflow-x-auto">
                <table className="min-w-full divide-y divide-[color:var(--border)]">
                    <thead className="bg-[color:var(--muted)]">
                        <tr>
                            <th className="p-3 text-left text-xs font-medium uppercase">Timestamp</th>
                            <th className="p-3 text-left text-xs font-medium uppercase">Level</th>
                            <th className="p-3 text-left text-xs font-medium uppercase">User</th>
                            <th className="p-3 text-left text-xs font-medium uppercase">Message</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[color:var(--border)]">
                        {isLoading ? (
                            <tr><td colSpan="4" className="text-center py-8"><LoadingSpinner /></td></tr>
                        ) : logData.logs.length === 0 ? (
                            <tr><td colSpan="4" className="text-center py-8">No logs found.</td></tr>
                        ) : (
                            logData.logs.map(log => (
                                <tr key={log.id}>
                                    <td className="p-3 text-sm whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                                    <td className="p-3 text-sm"><LogLevelBadge level={log.level} /></td>
                                    <td className="p-3 text-sm">{log.user ? `${log.user.name} (${log.user.email})` : 'System'}</td>
                                    <td className="p-3 text-sm">{log.message}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-between items-center">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1 || isLoading} className="btn-secondary flex items-center gap-1"><ChevronLeft size={16} /> Prev</button>
                <span className="text-sm">Page {logData.currentPage} of {logData.totalPages}</span>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === logData.totalPages || isLoading} className="btn-secondary flex items-center gap-1">Next <ChevronRight size={16} /></button>
            </div>
        </div>
    );
}
