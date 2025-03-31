// app/components/reportsAnalytics/HistoricalDataAnalysis.js
import { useState } from "react";
import { Calendar, Filter } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function HistoricalDataAnalysis() {
  const [selectedMetric, setSelectedMetric] = useState("production");

  const historicalData = {
    production: [
      { year: "2022", Q1: 250000, Q2: 275000, Q3: 290000, Q4: 310000 },
      { year: "2023", Q1: 270000, Q2: 295000, Q3: 320000, Q4: 340000 },
    ],
    mortality: [
      { year: "2022", Q1: 4.5, Q2: 4.2, Q3: 3.8, Q4: 3.5 },
      { year: "2023", Q1: 4.0, Q2: 3.7, Q3: 3.3, Q4: 3.0 },
    ],
    feedConversion: [
      { year: "2022", Q1: 2.0, Q2: 1.9, Q3: 1.85, Q4: 1.8 },
      { year: "2023", Q1: 1.75, Q2: 1.7, Q3: 1.65, Q4: 1.6 },
    ],
  };

  const metrics = [
    { id: "production", label: "Total Production" },
    { id: "mortality", label: "Mortality Rate" },
    { id: "feedConversion", label: "Feed Conversion" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button className="btn-primary flex items-center gap-2">
            <Calendar size={18} />
            <span>Select Period</span>
          </button>
          <div className="flex gap-2">
            {metrics.map((metric) => (
              <button
                key={metric.id}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedMetric === metric.id
                    ? "bg-[color:var(--primary)] text-white"
                    : "bg-[color:var(--card)] text-[color:var(--muted-foreground)]"
                }`}
                onClick={() => setSelectedMetric(metric.id)}
              >
                {metric.label}
              </button>
            ))}
          </div>
        </div>
        <button className="input flex items-center gap-2 bg-[color:var(--card)]">
          <Filter size={18} />
          <span>Advanced Filters</span>
        </button>
      </div>

      <div className="card">
        <h3 className="font-medium mb-4">
          {metrics.find((m) => m.id === selectedMetric).label} Analysis
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={historicalData[selectedMetric]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis
              label={{
                value:
                  selectedMetric === "production"
                    ? "Units"
                    : selectedMetric === "mortality"
                    ? "Mortality Rate (%)"
                    : "Feed Conversion Ratio",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Q1" stroke="#10b981" name="Q1" />
            <Line type="monotone" dataKey="Q2" stroke="#f59e0b" name="Q2" />
            <Line type="monotone" dataKey="Q3" stroke="#3b82f6" name="Q3" />
            <Line type="monotone" dataKey="Q4" stroke="#8b5cf6" name="Q4" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
