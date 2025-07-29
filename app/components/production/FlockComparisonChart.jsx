// app/components/production/FlockComparisonChart.jsx
"use client";
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function FlockComparisonChart({ data }) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.3)" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                     contentStyle={{ 
                        backgroundColor: 'var(--card)', 
                        borderColor: 'var(--border)' 
                    }}
                />
                <Legend />
                <Bar dataKey="totalEggs" fill="#3b82f6" name="Total Eggs" />
                <Bar dataKey="avgWeight" fill="#10b981" name="Avg. Weight (g)" />
            </BarChart>
        </ResponsiveContainer>
    );
}
