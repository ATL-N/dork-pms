// app/components/reportsAnalytics/ForecastingReport.js
import { useState } from "react";
import { TrendingUp, Database, BarChart2, PieChart } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function ForecastingReport() {
  const [forecastType, setForecastType] = useState("production");

  const forecastData = {
    production: [
      { month: "Apr", current: 55000, forecast: 58000 },
      { month: "May", current: 57000, forecast: 62000 },
      { month: "Jun", current: 60000, forecast: 67000 },
    ],
    mortality: [
      { month: "Apr", current: 4.2, forecast: 3.8 },
      { month: "May", current: 4.0, forecast: 3.5 },
      { month: "Jun", current: 3.8, forecast: 3.2 },
    ],
    revenue: [
      { month: "Apr", current: 250000, forecast: 275000 },
      { month: "May", current: 260000, forecast: 290000 },
      { month: "Jun", current: 270000, forecast: 310000 },
    ],
  };

  const forecastTypes = [
    {
      id: "production",
      label: "Production Forecast",
      icon: <BarChart2 size={18} />,
    },
    {
      id: "mortality",
      label: "Mortality Forecast",
      icon: <PieChart size={18} />,
    },
    {
      id: "revenue",
      label: "Revenue Forecast",
      icon: <TrendingUp size={18} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {forecastTypes.map((type) => (
            <button
              key={type.id}
              className={`px-4 py-2 flex items-center gap-2 rounded-full ${
                forecastType === type.id
                  ? "bg-[color:var(--primary)] text-white"
                  : "bg-[color:var(--card)] text-[color:var(--muted-foreground)]"
              }`}
              onClick={() => setForecastType(type.id)}
            >
              {type.icon}
              {type.label}
            </button>
          ))}
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Database size={18} />
          <span>Export Forecast</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Forecast Chart */}
        <div className="card">
          <h3 className="font-medium mb-4">
            {forecastTypes.find((t) => t.id === forecastType).label}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={forecastData[forecastType]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis
                label={{
                  value:
                    forecastType === "production"
                      ? "Units"
                      : forecastType === "mortality"
                      ? "Mortality Rate (%)"
                      : "Revenue ($)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip />
              <Bar dataKey="current" fill="#10b981" name="Current" />
              <Bar dataKey="forecast" fill="#3b82f6" name="Forecast" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Forecast Summary */}
        <div className="card">
          <h3 className="font-medium mb-4">Forecast Summary</h3>
          <div className="space-y-4">
            {[
              {
                label: "Next 3 Months Projection",
                value:
                  forecastType === "production"
                    ? "+12%"
                    : forecastType === "mortality"
                    ? "-15%"
                    : "+22%",
                color:
                  forecastType === "mortality"
                    ? "text-[color:var(--success)]"
                    : "text-[color:var(--primary)]",
              },
              {
                label: "Predicted Growth Rate",
                value:
                  forecastType === "production"
                    ? "4.5%"
                    : forecastType === "mortality"
                    ? "3.2%"
                    : "18.5%",
                color: "text-[color:var(--accent)]",
              },
              {
                label: "Confidence Interval",
                value: "85-90%",
                color: "text-[color:var(--muted-foreground)]",
              },
            ].map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-[color:var(--muted-foreground)]">
                  {item.label}
                </span>
                <span className={`font-medium ${item.color}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
