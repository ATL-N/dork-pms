// app/components/reports/InventoryUsageReport.jsx
"use client";

import React, { useRef } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useReactToPrint } from 'react-to-print';
import { Printer } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const InventoryUsageReport = ({ data, params, onParamsChange, onRegenerate }) => {
  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Inventory-Usage-Report"
  });

  const { usageData, chartData } = data || {};

  const renderContent = () => {
    if (!data || !usageData || usageData.length === 0) {
        return <div className="text-center p-4 col-span-full">No inventory usage data available for this period.</div>;
    }

    return (
        <div ref={componentRef} className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="card p-4" style={{ width: '100%', height: 300 }}>
                    <h3 className="text-lg font-semibold mb-4 text-center">Usage by Category</h3>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={chartData.data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {chartData.data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value, name) => [value.toLocaleString(), name]} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div>
                <h3 className="text-lg font-semibold mb-2">Usage Details</h3>
                <div className="overflow-y-auto max-h-80">
                    <table className="w-full text-sm text-left">
                    <thead className="bg-[color:var(--muted)] sticky top-0">
                        <tr>
                        <th className="p-2">Item Name</th>
                        <th className="p-2">Category</th>
                        <th className="p-2">Quantity Used</th>
                        <th className="p-2">Unit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usageData.map(item => (
                        <tr key={item.id} className="border-b border-[color:var(--border)]">
                            <td className="p-2 font-medium">{item.name}</td>
                            <td className="p-2">{item.category}</td>
                            <td className="p-2">{item.quantityUsed.toLocaleString()}</td>
                            <td className="p-2">{item.unit}</td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold">Inventory Usage Report</h2>
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
      {renderContent()}
    </div>
  );
};

export default InventoryUsageReport;
