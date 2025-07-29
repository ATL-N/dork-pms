// app/components/feed/FeedFormulationCard.jsx
"use client";

import React from 'react';
import { BookText, Edit, Trash2, User, Calendar, Percent, Hash } from 'lucide-react';
import { format } from 'date-fns';

export default function FeedFormulationCard({ formulation, onEdit, onDelete, canManage }) {

  const Detail = ({ icon, label, value }) => (
    <div className="flex items-center gap-2 text-sm">
      <div className="text-[color:var(--muted-foreground)]">{icon}</div>
      <div>
        <span className="font-medium">{label}:</span>
        <span className="ml-2 text-[color:var(--foreground)]">{value || 'N/A'}</span>
      </div>
    </div>
  );

  return (
    <div className="p-4 rounded-lg border bg-[color:var(--card)] shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-[color:var(--foreground)] flex items-center gap-2">
            <BookText size={20} className="text-[color:var(--primary)]" />
            {formulation.name}
          </h3>
          <p className="text-sm text-[color:var(--muted-foreground)] mt-1">{formulation.description}</p>
        </div>
        {canManage && (
            <div className="flex items-center gap-2">
                <button onClick={() => onEdit(formulation)} className="p-1.5 text-[color:var(--muted-foreground)] hover:text-[color:var(--primary)]">
                    <Edit size={16} />
                </button>
                <button onClick={() => onDelete(formulation)} className="p-1.5 text-[color:var(--muted-foreground)] hover:text-[color:var(--destructive)]">
                    <Trash2 size={16} />
                </button>
            </div>
        )}
      </div>

      <div className="mt-4 border-t border-[color:var(--border)] pt-4">
        <h4 className="font-semibold mb-2 text-[color:var(--foreground)]">Ingredients ({formulation.ingredients.length})</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
            {formulation.ingredients.map(ing => (
                <div key={ing.id} className="grid grid-cols-3 gap-4 p-2 rounded-md bg-[color:var(--background)] border border-[color:var(--border)]">
                    <div className="col-span-2 font-medium text-sm text-[color:var(--foreground)]">{ing.feedItem.name}</div>
                    <div className="text-sm flex items-center gap-1 text-[color:var(--muted-foreground)]"><Hash size={12}/> {ing.quantity} {ing.feedItem.unit}</div>
                    <div className="text-sm flex items-center gap-1 text-[color:var(--muted-foreground)]"><Percent size={12}/> {ing.percentage}%</div>
                </div>
            ))}
        </div>
      </div>

      <div className="mt-4 border-t border-[color:var(--border)] pt-3 flex flex-wrap gap-x-6 gap-y-2">
        <Detail icon={<User size={14} />} label="Created by" value={formulation?.createdBy?.name || 'N/A'} />
        <Detail 
          icon={<Calendar size={14} />} 
          label="Created on" 
          value={formulation.createdAt ? format(new Date(formulation.createdAt), 'PPP') : 'N/A'} 
        />
      </div>
    </div>
  );
}
