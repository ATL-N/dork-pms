// app/components/dashboards/ProductionChart.jsx
"use client";
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ProductionChart({ data }) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="name" stroke="var(--muted-foreground)" />
          <YAxis yAxisId="left" stroke="var(--primary)" />
          <YAxis yAxisId="right" orientation="right" stroke="var(--accent-foreground)" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }}
          />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="eggs" name="Egg Production" stroke="var(--primary)" strokeWidth={2} />
          <Line yAxisId="right" type="monotone" dataKey="weight" name="Avg. Weight (kg)" stroke="var(--accent-foreground)" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
