// app/components/production/ProductionTrendChart.jsx
"use client";
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ProductionTrendChart({ data }) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.3)" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: 'var(--card)', 
                        borderColor: 'var(--border)' 
                    }}
                />
                <Legend />
                <Line type="monotone" dataKey="eggs" stroke="#3b82f6" name="Eggs" />
                <Line type="monotone" dataKey="weight" stroke="#10b981" name="Avg. Weight (g)" />
            </LineChart>
        </ResponsiveContainer>
    );
}
