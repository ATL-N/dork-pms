// app/components/LoadingSpinner.jsx
"use client";
import React from 'react';

export default function LoadingSpinner({ size = 'h-8 w-8' }) {
  return (
    <div className="flex justify-center items-center p-4">
      <div
        className={`animate-spin rounded-full ${size} border-b-2 border-[color:var(--primary)]`}
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}
