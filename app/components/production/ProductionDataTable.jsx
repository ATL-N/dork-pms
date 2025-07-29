// app/components/production/ProductionDataTable.jsx
"use client";
import React from 'react';
import { format } from 'date-fns';

export default function ProductionDataTable({ data }) {
    if (!data || data.length === 0) {
        return <p className="text-center text-[color:var(--muted-foreground)] py-8">No production data available for the selected filters.</p>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[color:var(--border)]">
                <thead className="bg-[color:var(--muted)]/50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[color:var(--muted-foreground)] uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[color:var(--muted-foreground)] uppercase tracking-wider">Flock</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[color:var(--muted-foreground)] uppercase tracking-wider">Record Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[color:var(--muted-foreground)] uppercase tracking-wider">Quantity</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[color:var(--muted-foreground)] uppercase tracking-wider">Details</th>
                    </tr>
                </thead>
                <tbody className="bg-[color:var(--background)] divide-y divide-[color:var(--border)]">
                    {data.map(record => (
                        <tr key={record.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{format(new Date(record.date), 'PPP')}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{record.flock.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    record.recordType === 'EGG_PRODUCTION' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                    {record.recordType.replace('_', ' ').toLowerCase()}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {record.recordType === 'EGG_PRODUCTION' ? record.totalEggs : record.weight}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[color:var(--muted-foreground)]">
                                {record.recordType === 'EGG_PRODUCTION' ? `${record.brokenEggs} broken` : ''}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
