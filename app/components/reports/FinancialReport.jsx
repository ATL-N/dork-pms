"use client";

import React, { useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useReactToPrint } from 'react-to-print';
import { Printer } from 'lucide-react';

const FinancialReport = ({ data, params, onParamsChange, onRegenerate }) => {
  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Financial-Report"
  });

  const { summary, chartData, transactions, currency } = data || {};

  const formatCurrency = (value) => {
    if (typeof value !== 'number') return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(value);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold">Financial Report</h2>
        <div className="flex items-center gap-2 flex-wrap">
            <DatePicker
                selected={params.dateRange.from}
                onChange={(date) => onParamsChange({ ...params, dateRange: { ...params.dateRange, from: date } })}
                selectsStart
                startDate={params.dateRange.from}
                endDate={params.dateRange.to}
                className="input w-full sm:w-auto"
            />
            <DatePicker
                selected={params.dateRange.to}
                onChange={(date) => onParamsChange({ ...params, dateRange: { ...params.dateRange, to: date } })}
                selectsEnd
                startDate={params.dateRange.from}
                endDate={params.dateRange.to}
                minDate={params.dateRange.from}
                className="input w-full sm:w-auto"
            />
            <button onClick={onRegenerate} className="btn-secondary">Generate</button>
            <button onClick={handlePrint} className="btn-primary flex items-center gap-2" disabled={!data}><Printer size={16} /> Export</button>
        </div>
      </div>

      <div ref={componentRef} className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-6">
            <div className="card p-4">
            <h3 className="text-lg font-semibold text-green-500">Total Revenue</h3>
            <p className="text-2xl font-bold">{formatCurrency(summary?.totalRevenue)}</p>
            </div>
            <div className="card p-4">
            <h3 className="text-lg font-semibold text-red-500">Total Expenses</h3>
            <p className="text-2xl font-bold">{formatCurrency(summary?.totalExpenses)}</p>
            </div>
            <div className="card p-4">
            <h3 className="text-lg font-semibold">Net Profit/Loss</h3>
            <p className={`text-2xl font-bold ${summary?.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(summary?.netProfit)}
            </p>
            </div>
        </div>

        <div className="card p-4" style={{ width: '100%', height: 300 }}>
            <h3 className="text-lg font-semibold mb-4 text-center">Revenue vs. Expenses</h3>
            <ResponsiveContainer>
            <BarChart data={chartData?.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="revenue" fill="var(--primary)" />
                <Bar dataKey="expenses" fill="var(--destructive)" />
            </BarChart>
            </ResponsiveContainer>
        </div>

        <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Transactions</h3>
            <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-[color:var(--muted)]">
                <tr>
                    <th className="p-2">Date</th>
                    <th className="p-2">Type</th>
                    <th className="p-2">Category</th>
                    <th className="p-2">Amount</th>
                    <th className="p-2">Description</th>
                </tr>
                </thead>
                <tbody>
                {transactions?.map(tx => (
                    <tr key={tx.id} className="border-b border-[color:var(--border)]">
                    <td className="p-2">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className={`p-2 font-medium ${tx.type === 'REVENUE' ? 'text-green-500' : 'text-red-500'}`}>{tx.type}</td>
                    <td className="p-2">{tx.category}</td>
                    <td className="p-2">{formatCurrency(tx.amount)}</td>
                    <td className="p-2">{tx.description}</td>
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

export default FinancialReport;
