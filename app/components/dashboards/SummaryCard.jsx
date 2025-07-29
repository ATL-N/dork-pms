// app/components/dashboards/SummaryCard.jsx
"use client";
import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function SummaryCard({ title = "N/A", value = 0, icon = <HelpCircle /> }) {
  return (
    <div className="card p-6 flex items-center gap-6">
      <div className="p-3 rounded-full bg-[color:var(--primary-soft)] text-[color:var(--primary)]">
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <div>
        <p className="text-sm text-[color:var(--muted-foreground)]">{title}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
      </div>
    </div>
  );
}
