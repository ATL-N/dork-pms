// app/components/modals/ExportProductionModal.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { Loader2, Download } from 'lucide-react';

export default function ExportProductionModal({ farmId, farmName, onClose, isSubmitting }) {
    const [flocks, setFlocks] = useState([]);
    const [selectedFlock, setSelectedFlock] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [exportFormat, setExportFormat] = useState('csv');
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFlocks = async () => {
            if (!farmId) return;
            try {
                const res = await fetch(`/api/farms/${farmId}/flocks`);
                if (res.ok) {
                    const data = await res.json();
                    setFlocks(data.filter(f => f.status === 'active'));
                }
            } catch (error) {
                console.error("Failed to fetch flocks", error);
                setError("Could not load flock list.");
            }
        };
        fetchFlocks();
    }, [farmId]);

    const handleExport = async () => {
        setError(null);
        const queryParams = new URLSearchParams({
            farmId,
            format: exportFormat,
        });
        if (selectedFlock) queryParams.append('flockId', selectedFlock);
        if (startDate) queryParams.append('startDate', startDate);
        if (endDate) queryParams.append('endDate', endDate);

        try {
            const res = await fetch(`/api/farms/${farmId}/production-records/export?${queryParams.toString()}`);
            
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Export failed');
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `production-records-${farmName || farmId}.${exportFormat}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            onClose();

        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

    return (
        <div>
            <div className="mb-4">
                <h2 className="text-xl font-bold">Export Production Data</h2>
                <p className="text-sm text-[color:var(--muted-foreground)]">
                    Exporting records for farm: <span className="font-semibold text-[color:var(--foreground)]">{farmName || '...'}</span>
                </p>
            </div>
            
            <div className="space-y-5">
                <fieldset className="border p-4 rounded-md">
                    <legend className="text-sm font-medium px-2">Filters (Optional)</legend>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="flock" className="block text-sm font-medium mb-1">Flock</label>
                            <select id="flock" className="input" value={selectedFlock} onChange={e => setSelectedFlock(e.target.value)}>
                                <option value="">All Active Flocks</option>
                                {flocks.map(flock => (
                                    <option key={flock.id} value={flock.id}>{flock.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="startDate" className="block text-sm font-medium mb-1">Start Date</label>
                                <input type="date" id="startDate" className="input" value={startDate} onChange={e => setStartDate(e.target.value)} />
                            </div>
                            <div>
                                <label htmlFor="endDate" className="block text-sm font-medium mb-1">End Date</label>
                                <input type="date" id="endDate" className="input" value={endDate} onChange={e => setEndDate(e.target.value)} />
                            </div>
                        </div>
                    </div>
                </fieldset>

                <div>
                    <label htmlFor="format" className="block text-sm font-medium mb-1">Export Format</label>
                    <select id="format" className="input" value={exportFormat} onChange={e => setExportFormat(e.target.value)}>
                        <option value="csv">CSV (Comma-Separated Values)</option>
                        <option value="pdf">PDF (Portable Document Format)</option>
                    </select>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            <div className="mt-6 flex justify-end gap-3">
                <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
                    Cancel
                </button>
                <button type="button" className="btn-primary flex items-center gap-2" onClick={handleExport} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                    <span>{isSubmitting ? 'Exporting...' : 'Export'}</span>
                </button>
            </div>
        </div>
    );
}
