// app/components/reports/FlockPerformanceReport.jsx
"use client";

import React, { useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useReactToPrint } from 'react-to-print';
import { Printer } from 'lucide-react';

const FlockPerformanceReport = ({ data }) => {
  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Flock-Performance-Report"
  });

  const { flocks, chartData, currency } = data || {};

  const formatCurrency = (value) => {
    if (typeof value !== 'number') return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(value);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold">Flock Performance Report</h2>
        <button onClick={handlePrint} className="btn-primary flex items-center gap-2" disabled={!data}><Printer size={16} /> Export</button>
      </div>
      
      <div ref={componentRef} className="p-4">
        <div className="card p-4 mb-6" style={{ width: '100%', height: 300 }}>
            <h3 className="text-lg font-semibold mb-4 text-center">Flock Profitability Comparison</h3>
            <ResponsiveContainer>
            <BarChart data={chartData?.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="profit" fill="var(--primary)" />
            </BarChart>
            </ResponsiveContainer>
        </div>

        <div>
            <h3 className="text-lg font-semibold mb-2">Detailed Breakdown</h3>
            <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-[color:var(--muted)]">
                <tr>
                    <th className="p-2">Flock</th>
                    <th className="p-2">FCR</th>
                    <th className="p-2">Mortality Rate</th>
                    <th className="p-2">Cost per Bird</th>
                    <th className="p-2">Total Profit</th>
                </tr>
                </thead>
                <tbody>
                {flocks?.map(flock => (
                    <tr key={flock.id} className="border-b border-[color:var(--border)]">
                    <td className="p-2 font-medium">{flock.name}</td>
                    <td className="p-2">{flock.fcr.toFixed(2)}</td>
                    <td className="p-2">{flock.mortalityRate.toFixed(2)}%</td>
                    <td className="p-2">{formatCurrency(flock.costPerBird)}</td>
                    <td className={`p-2 font-bold ${flock.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatCurrency(flock.totalProfit)}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FlockPerformanceReport;
