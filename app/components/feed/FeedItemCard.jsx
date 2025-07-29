// app/components/feed/FeedItemCard.jsx
"use client";

import React from 'react';
import { format } from 'date-fns';
import { Package, DollarSign, Hash, Calendar, AlertTriangle, Tag, Building, FileText, Edit, Trash2 } from 'lucide-react';

export default function FeedItemCard({ item, onEdit, onDelete, canManage }) {
  const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();
  const cardBg = isExpired ? 'bg-destructive/10 border-destructive/40' : 'bg-[color:var(--card)]';

  const Detail = ({ icon, label, value }) => (
    <div className="flex items-start gap-2 text-sm">
      <div className="text-[color:var(--muted-foreground)]">{icon}</div>
      <div className="flex-1">
        <span className="font-medium">{label}:</span>
        <span className="ml-2">{value || 'N/A'}</span>
      </div>
    </div>
  );

  return (
    <div className={`p-4 rounded-lg border ${cardBg} shadow-sm`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-[color:var(--foreground)]">{item.name}</h3>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.type === 'COMPLETE' ? 'bg-blue-500/10 text-blue-600' : 'bg-green-500/10 text-green-600'}`}>
            {item.type}
          </span>
        </div>
        {canManage && (
            <div className="flex items-center gap-2">
                <button onClick={() => onEdit(item)} className="p-1.5 text-[color:var(--muted-foreground)] hover:text-[color:var(--primary)]">
                    <Edit size={16} />
                </button>
                <button onClick={() => onDelete(item)} className="p-1.5 text-[color:var(--muted-foreground)] hover:text-[color:var(--destructive)]">
                    <Trash2 size={16} />
                </button>
            </div>
        )}
      </div>

      {isExpired && (
        <div className="mt-2 text-[color:var(--destructive)] font-bold flex items-center gap-2">
          <AlertTriangle size={16} />
          <span>Expired on {format(new Date(item.expiryDate), 'PPP')}</span>
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2">
        <Detail icon={<Hash size={14} />} label="Quantity" value={`${item.quantity} ${item.unit}`} />
        <Detail icon={<DollarSign size={14} />} label="Unit Price" value={`${item.unitPrice.toFixed(2)}`} />
        <Detail icon={<Tag size={14} />} label="Category" value={item.category} />
        <Detail icon={<Calendar size={14} />} label="Purchase Date" value={format(new Date(item.purchaseDate), 'PPP')} />
        {item.expiryDate && !isExpired && <Detail icon={<AlertTriangle size={14} />} label="Expires On" value={format(new Date(item.expiryDate), 'PPP')} />}
        <Detail icon={<Building size={14} />} label="Supplier" value={item.supplier} />
        <Detail icon={<FileText size={14} />} label="Location" value={item.location} />
        <Detail icon={<Package size={14} />} label="Batch #" value={item.batchNumber} />
      </div>
    </div>
  );
}
