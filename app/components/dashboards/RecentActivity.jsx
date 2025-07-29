// app/components/dashboards/RecentActivity.jsx
"use client";
import React from 'react';

export default function RecentActivity({ activities = [] }) {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-3">
          <div className="mt-1 h-2 w-2 rounded-full bg-[color:var(--primary)]" />
          <div>
            <p className="text-sm">{activity.action}</p>
            <p className="text-xs text-[color:var(--muted-foreground)]">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
