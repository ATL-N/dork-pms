// app/components/production/ProductionRecordCard.jsx
"use client";
import React from 'react';
import { ChevronDown, ChevronRight, Archive, Calendar, Layers, Hash, Droplet, Weight } from 'lucide-react';
import { format } from 'date-fns';

export default function ProductionRecordCard({ 
    record, 
    isExpanded,
    onToggleExpand,
    onArchive, 
}) {
    const isEggRecord = record.recordType === 'EGG_PRODUCTION';

    const renderIcon = () => {
        if (isEggRecord) return <Layers size={16} className="text-blue-500" />;
        return <Weight size={16} className="text-green-500" />;
    };

    const renderQuantity = () => {
        if (isEggRecord) return `${record.totalEggs} eggs`;
        return `${record.weight} g`;
    };

    const renderDetails = () => {
        if (!isExpanded) return null;

        return (
            <div className="border-t border-[color:var(--border)] p-4 bg-[color:var(--muted)]/50 text-sm">
                <h4 className="font-semibold mb-2">Details</h4>
                <div className="grid grid-cols-2 gap-4">
                    {isEggRecord && (
                        <>
                            <div className="flex items-center gap-2">
                                <Droplet size={16} className="text-[color:var(--muted-foreground)]" />
                                <div>
                                    <p className="text-[color:var(--muted-foreground)]">Broken Eggs</p>
                                    <p className="font-medium">{record.brokenEggs}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Weight size={16} className="text-[color:var(--muted-foreground)]" />
                                <div>
                                    <p className="text-[color:var(--muted-foreground)]">Avg. Weight</p>
                                    <p className="font-medium">{record.averageWeight ? `${record.averageWeight} g` : 'N/A'}</p>
                                </div>
                            </div>
                        </>
                    )}
                    {record.comments && (
                         <div className="flex items-start gap-2 col-span-2">
                            <MessageSquare size={16} className="text-[color:var(--muted-foreground)] mt-1" />
                            <div>
                                <p className="text-[color:var(--muted-foreground)]">Comments</p>
                                <p className="font-medium whitespace-pre-wrap">{record.comments}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="card overflow-hidden transition-shadow hover:shadow-lg">
            <div className="p-4 flex items-center cursor-pointer" onClick={onToggleExpand}>
                <div className="mr-4">
                    {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
                <div className="flex-1">
                    <div className="flex flex-col sm:flex-row justify-between">
                        <div className="flex items-center flex-wrap">
                            <span className="text-lg font-medium">{record.flock.name}</span>
                            <span className={`ml-3 px-2 py-1 text-xs rounded-full capitalize ${
                                isEggRecord ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                            }`}>
                                {record.recordType.replace('_', ' ').toLowerCase()}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 sm:gap-6 mt-2 sm:mt-0 text-sm">
                            <div className="flex items-center gap-1 text-[color:var(--muted-foreground)]">
                                <Calendar size={14} />
                                <span>{format(new Date(record.date), 'PPP')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                {renderIcon()}
                                <span className="font-medium">{renderQuantity()}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1 pl-2">
                    <button
                        title="Archive Record"
                        className="p-2 text-[color:var(--muted-foreground)] hover:text-[color:var(--destructive)]"
                        onClick={(e) => { e.stopPropagation(); onArchive(); }}
                    >
                        <Archive size={18} />
                    </button>
                </div>
            </div>
            {renderDetails()}
        </div>
    );
}
