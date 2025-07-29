// app/components/production/ProductionDetails.jsx
"use client";
import React from 'react';
import { format } from 'date-fns';
import { User, MessageSquare } from 'lucide-react';

export default function ProductionDetails({ record }) {
  return (
    <div className="space-y-4 text-sm">
        <div>
            <h4 className="font-semibold text-base mb-2">Record Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                    <User size={16} className="text-[color:var(--muted-foreground)]" />
                    <div>
                        <p className="text-[color:var(--muted-foreground)]">Recorded By</p>
                        <p className="font-medium">{record.recordedBy?.name || 'N/A'}</p>
                    </div>
                </div>
                {record.comments && (
                    <div className="flex items-start gap-2 md:col-span-2">
                        <MessageSquare size={16} className="text-[color:var(--muted-foreground)] mt-1" />
                        <div>
                            <p className="text-[color:var(--muted-foreground)]">Comments</p>
                            <p className="font-medium whitespace-pre-wrap">{record.comments}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}
