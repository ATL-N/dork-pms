// app/components/dashboards/Alerts.jsx
"use client";
import React from 'react';
import { AlertTriangle, Info, ShieldCheck } from 'lucide-react';

const alertIcons = {
  warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
  success: <ShieldCheck className="w-5 h-5 text-green-500" />,
};

const alertStyles = {
  warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
  info: 'bg-blue-50 border-blue-400 text-blue-800',
  success: 'bg-green-50 border-green-400 text-green-800',
};

export default function Alerts({ alerts }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="card p-4 text-center">
        <p className="text-[color:var(--muted-foreground)]">No alerts at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
       <h2 className="font-medium mb-4">Alerts</h2>
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`flex items-start p-4 rounded-lg border ${alertStyles[alert.type] || 'bg-gray-50 border-gray-400 text-gray-800'}`}
        >
          <div className="flex-shrink-0 mr-3">
            {alertIcons[alert.type] || <Info className="w-5 h-5" />}
          </div>
          <div className="flex-1">
            <p className="font-semibold">{alert.title}</p>
            <p className="text-sm">{alert.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
