// app/components/flocks/FlockCard.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Edit, Trash2, MapPin, Activity } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import LoadingSpinner from '../LoadingSpinner';
import FlockDetails from './FlockDetails';

const getLifecycleStage = (flock) => {
    if (!flock || !flock.startDate) return { stage: 'Unknown', color: 'bg-gray-400' };

    const ageInDays = differenceInDays(new Date(), new Date(flock.startDate));
    const ageInWeeks = ageInDays / 7;

    if (flock.type === 'LAYER' || flock.type === 'BREEDER') {
        if (ageInWeeks <= 6) return { stage: 'Brooding', color: 'bg-yellow-500' };
        if (ageInWeeks <= 17) return { stage: 'Pullet (Grower)', color: 'bg-blue-500' };
        if (ageInWeeks <= 21) return { stage: 'Point of Lay', color: 'bg-purple-500' };
        if (flock.firstEggDate || (flock.eggProductionRecords && flock.eggProductionRecords.length > 0)) {
             if (ageInWeeks <= 40) return { stage: 'Started Laying', color: 'bg-green-600' };
             return { stage: 'Peak Production', color: 'bg-green-700' };
        }
        return { stage: 'Mature (Pre-Lay)', color: 'bg-indigo-500' };
    }

    if (flock.type === 'BROILER') {
        if (ageInDays <= 10) return { stage: 'Starter', color: 'bg-yellow-500' };
        if (ageInDays <= 22) return { stage: 'Grower', color: 'bg-blue-500' };
        if (ageInDays <= 42) return { stage: 'Finisher', color: 'bg-purple-500' };
        return { stage: 'Ready for Market', color: 'bg-green-600' };
    }

    return { stage: 'Active', color: 'bg-gray-500' };
};


export default function FlockCard({ 
    flock, 
    isExpanded,
    ageDisplayUnit = 'days',
    onToggleExpand,
    onEdit, 
    onArchive, 
    onRecordWeight, 
    onRecordMortality, 
    onRecordHealthEvent,
    onRecordFeed,
    onRecordEggs,
    onRecordBirdSale
}) {
    const [details, setDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const getFlockAge = (startDate) => {
        const ageInDays = differenceInDays(new Date(), new Date(startDate));
        if (ageDisplayUnit === 'weeks') {
            const weeks = Math.floor(ageInDays / 7);
            const days = ageInDays % 7;
            return `${weeks}w ${days}d`;
        }
        return `${ageInDays} days`;
    };

    const lifecycle = getLifecycleStage(flock);

    useEffect(() => {
        const fetchDetails = async () => {
            if (isExpanded && !details) {
                setIsLoading(true);
                try {
                    // This endpoint needs to be created to fetch detailed flock data including relations
                    const res = await fetch(`/api/farms/${flock.farmId}/flocks/${flock.id}/details`);
                    if (!res.ok) throw new Error('Failed to fetch details');
                    const detailedData = await res.json();
                    setDetails({ ...flock, ...detailedData });
                } catch (error) {
                    console.error(error);
                    // Fallback to basic flock data if details fetch fails
                    setDetails(flock); 
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchDetails();
    }, [isExpanded, details, flock]);

    return (
        <div className="card overflow-hidden transition-shadow hover:shadow-lg">
            <div className="p-4 flex items-center cursor-pointer" onClick={onToggleExpand}>
                <div className="mr-4">
                    {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
                <div className="flex-1">
                    <div className="flex flex-col sm:flex-row justify-between">
                        <div className="flex items-center flex-wrap">
                            <span className="text-lg font-medium">{flock.name}</span>
                            <span className={`ml-3 px-2 py-1 text-xs rounded-full capitalize ${
                                flock.type === 'LAYER' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                            }`}>
                                {flock.type.toLowerCase()}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 sm:gap-6 mt-2 sm:mt-0 text-sm">
                            {flock.location && (
                                <div className="flex items-center gap-1 text-[color:var(--muted-foreground)]">
                                    <MapPin size={14} />
                                    <span>{flock.location}</span>
                                </div>
                            )}
                            <div>
                                <span className="text-xs text-[color:var(--muted-foreground)]">Qty: </span>
                                <span className="font-medium" title={`Initial quantity: ${flock.initialQuantity?.toLocaleString()}`}>
                                    {flock.quantity.toLocaleString()} / {flock.initialQuantity?.toLocaleString()}
                                </span>
                            </div>
                            {flock.status === "active" && (
                                <>
                                    <div>
                                        <span className="text-xs text-[color:var(--muted-foreground)]">Age: </span>
                                        <span className="font-medium">{getFlockAge(flock.startDate)}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5" title={`Lifecycle Stage: ${lifecycle.stage}`}>
                                        <span className={`w-3 h-3 rounded-full ${lifecycle.color}`}></span>
                                        <span className="font-medium">{lifecycle.stage}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                {flock.status === "active" && (
                    <div className="flex items-center gap-1 pl-2">
                        <button
                            title="Edit Flock"
                            className="p-2 text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
                            onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        >
                            <Edit size={18} />
                        </button>
                        <button
                            title="Archive Flock"
                            className="p-2 text-[color:var(--muted-foreground)] hover:text-[color:var(--destructive)]"
                            onClick={(e) => { e.stopPropagation(); onArchive(); }}
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                )}
            </div>

            {isExpanded && (
                <div className="border-t border-[color:var(--border)] p-4 bg-[color:var(--muted)]/50">
                    {isLoading ? <LoadingSpinner /> : details ? (
                        <FlockDetails 
                            flock={details}
                            onRecordFeed={() => onRecordFeed(details)}
                            onRecordWeight={() => onRecordWeight(details)}
                            onRecordMortality={() => onRecordMortality(details)}
                            onRecordHealthEvent={() => onRecordHealthEvent(details)}
                            onRecordEggs={() => onRecordEggs(details)}
                            onRecordBirdSale={() => onRecordBirdSale(details)}
                        />
                    ) : <p>Could not load flock details.</p>}
                </div>
            )}
        </div>
    );
}
