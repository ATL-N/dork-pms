// app/components/reportsAnalytics/DataAnalysisSummary.js
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function DataAnalysisSummary() {
  const productionData = [
    { month: "Jan", layers: 85000, broilers: 45000 },
    { month: "Feb", layers: 88000, broilers: 48000 },
    { month: "Mar", layers: 92000, broilers: 52000 },
  ];

  const mortalityData = [
    { name: "Layers", value: 3.5 },
    { name: "Broilers", value: 4.2 },
  ];

  const COLORS = ["#10b981", "#f59e0b"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Performance Overview */}
      <div className="card">
        <h3 className="font-medium mb-4">Monthly Production Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={productionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis
              label={{
                value: "Units Produced",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip />
            <Bar dataKey="layers" fill="#10b981" name="Layer Production" />
            <Bar dataKey="broilers" fill="#f59e0b" name="Broiler Production" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Mortality Rate Analysis */}
      <div className="card">
        <h3 className="font-medium mb-4">Mortality Rate Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={mortalityData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(1)}%`
              }
            >
              {mortalityData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Key Performance Indicators */}
      <div className="card col-span-full">
        <h3 className="font-medium mb-4">Farm Performance KPIs</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              title: "Egg Production",
              value: "92.5%",
              trend: "up",
              color: "text-[color:var(--success)]",
            },
            {
              title: "Feed Conversion",
              value: "1.82",
              trend: "up",
              color: "text-[color:var(--primary)]",
            },
            {
              title: "Mortality Rate",
              value: "3.2%",
              trend: "down",
              color: "text-[color:var(--destructive)]",
            },
            {
              title: "Weight Gain",
              value: "48g/day",
              trend: "up",
              color: "text-[color:var(--info)]",
            },
          ].map((kpi, index) => (
            <div
              key={index}
              className="text-center p-4 bg-[color:var(--card)] rounded-md"
            >
              <p className="text-xs text-[color:var(--muted-foreground)] mb-2">
                {kpi.title}
              </p>
              <div className="flex justify-center items-center gap-2">
                <span className={`text-lg font-bold ${kpi.color}`}>
                  {kpi.value}
                </span>
                {kpi.trend === "up" ? (
                  <TrendingUp
                    size={16}
                    className="text-[color:var(--success)]"
                  />
                ) : (
                  <TrendingDown
                    size={16}
                    className="text-[color:var(--destructive)]"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
