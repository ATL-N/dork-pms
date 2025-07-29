// app/components/reports/ProductionReport.jsx
"use client";

import React, { useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useReactToPrint } from 'react-to-print';
import { Printer } from 'lucide-react';

const ProductionReport = ({ data, params, onParamsChange, onRegenerate }) => {
  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Production-Report"
  });

  const { summary, chartData } = data || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold">Production Report</h2>
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
            <h3 className="text-lg font-semibold">Total Eggs Produced</h3>
            <p className="text-2xl font-bold">{summary?.totalEggs?.toLocaleString() || 'N/A'}</p>
            </div>
            <div className="card p-4">
            <h3 className="text-lg font-semibold">Peak Production Day</h3>
            <p className="text-2xl font-bold">{summary?.peakProduction?.date ? new Date(summary.peakProduction.date).toLocaleDateString() : 'N/A'}</p>
            <p className="text-sm text-[color:var(--muted-foreground)]">{summary?.peakProduction?.eggs?.toLocaleString() || 0} eggs</p>
            </div>
            <div className="card p-4">
            <h3 className="text-lg font-semibold">Average Daily Production</h3>
            <p className="text-2xl font-bold">{summary?.averageDailyProduction?.toFixed(1) || 'N/A'}</p>
            </div>
        </div>

        <div className="card p-4" style={{ width: '100%', height: 300 }}>
            <h3 className="text-lg font-semibold mb-4 text-center">Production Trends Over Time</h3>
            <ResponsiveContainer>
            <LineChart data={chartData?.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="eggs" stroke="var(--primary)" strokeWidth={2} />
            </LineChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ProductionReport;
