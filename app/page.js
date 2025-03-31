// app/page.js
"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
} from "recharts";

export default function Dashboard() {
  // Dummy data for charts
  const monthlyProduction = [
    { month: "Jan", eggs: 24500, meat: 1200 },
    { month: "Feb", eggs: 22000, meat: 1350 },
    { month: "Mar", eggs: 25800, meat: 1100 },
    { month: "Apr", eggs: 27000, meat: 1400 },
    { month: "May", eggs: 28500, meat: 1250 },
    { month: "Jun", eggs: 29700, meat: 1500 },
  ];

  const feedConsumption = [
    { month: "Jan", consumption: 4500 },
    { month: "Feb", consumption: 4300 },
    { month: "Mar", consumption: 4800 },
    { month: "Apr", consumption: 5000 },
    { month: "May", consumption: 5200 },
    { month: "Jun", consumption: 5500 },
  ];

  const revenueData = [
    { month: "Jan", revenue: 45000, expenses: 28000 },
    { month: "Feb", revenue: 42000, expenses: 27000 },
    { month: "Mar", revenue: 48500, expenses: 30000 },
    { month: "Apr", revenue: 51000, expenses: 32000 },
    { month: "May", revenue: 54500, expenses: 33500 },
    { month: "Jun", revenue: 58000, expenses: 35000 },
  ];

  const flockDistribution = [
    { name: "Layers", value: 12500 },
    { name: "Broilers", value: 8500 },
    { name: "Breeders", value: 3200 },
    { name: "Chicks", value: 6800 },
  ];

  const COLORS = ["#10b981", "#f59e0b", "#3b82f6", "#ef4444"];

  const alerts = [
    {
      id: 1,
      type: "warning",
      message: "Feed inventory running low in Barn 2",
      time: "1 hour ago",
    },
    {
      id: 2,
      type: "danger",
      message: "Increased mortality rate detected in Flock B-124",
      time: "3 hours ago",
    },
    {
      id: 3,
      type: "info",
      message: "Scheduled vaccination for Flock A-87 tomorrow",
      time: "5 hours ago",
    },
    {
      id: 4,
      type: "success",
      message: "Production target achieved for this month",
      time: "1 day ago",
    },
  ];

  const kpis = [
    { title: "Total Birds", value: "31,000", change: "+5%", icon: "feather" },
    {
      title: "Egg Production",
      value: "24,850/day",
      change: "+3%",
      icon: "circle",
    },
    {
      title: "Feed Conversion",
      value: "1.85",
      change: "-0.05",
      icon: "package",
    },
    {
      title: "Mortality Rate",
      value: "1.2%",
      change: "-0.3%",
      icon: "activity",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <div key={index} className="card p-4">
            <div className="flex items-start">
              <div className="mr-4 bg-[color:var(--primary)] bg-opacity-10 p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[color:var(--primary)]"
                >
                  {kpi.icon === "feather" && (
                    <>
                      <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
                      <line x1="16" y1="8" x2="2" y2="22" />
                      <line x1="17.5" y1="15" x2="9" y2="15" />
                    </>
                  )}
                  {kpi.icon === "circle" && <circle cx="12" cy="12" r="10" />}
                  {kpi.icon === "package" && (
                    <>
                      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                      <line x1="12" y1="22.08" x2="12" y2="12" />
                    </>
                  )}
                  {kpi.icon === "activity" && (
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  )}
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-[color:var(--muted-foreground)]">
                  {kpi.title}
                </h3>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p
                  className={`text-xs ${
                    kpi.change.startsWith("+")
                      ? "text-[color:var(--success)]"
                      : "text-[color:var(--destructive)]"
                  }`}
                >
                  {kpi.change} from last month
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production Chart */}
        <div className="card p-4">
          <h2 className="text-lg font-medium mb-4">Monthly Production</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyProduction}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="eggs" name="Eggs (units)" fill="#10b981" />
                <Bar dataKey="meat" name="Meat (kg)" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue & Expenses */}
        <div className="card p-4">
          <h2 className="text-lg font-medium mb-4">Revenue & Expenses</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue ($)"
                  fill="#10b981"
                  stroke="#10b981"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses ($)"
                  fill="#ef4444"
                  stroke="#ef4444"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Second Row Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feed Consumption */}
        <div className="card p-4">
          <h2 className="text-lg font-medium mb-4">Feed Consumption</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={feedConsumption}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="consumption"
                  name="Feed (kg)"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Flock Distribution */}
        <div className="card p-4">
          <h2 className="text-lg font-medium mb-4">Flock Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={flockDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {flockDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="card p-4">
        <h2 className="text-lg font-medium mb-4">Recent Alerts</h2>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start p-3 border rounded-md border-[color:var(--border)]"
            >
              <div
                className={`mr-3 rounded-full p-1 ${
                  alert.type === "warning"
                    ? "bg-[color:var(--warning)] bg-opacity-10"
                    : alert.type === "danger"
                    ? "bg-[color:var(--destructive)] bg-opacity-10"
                    : alert.type === "info"
                    ? "bg-[color:var(--info)] bg-opacity-10"
                    : "bg-[color:var(--success)] bg-opacity-10"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`${
                    alert.type === "warning"
                      ? "text-[color:var(--warning)]"
                      : alert.type === "danger"
                      ? "text-[color:var(--destructive)]"
                      : alert.type === "info"
                      ? "text-[color:var(--info)]"
                      : "text-[color:var(--success)]"
                  }`}
                >
                  {alert.type === "warning" && (
                    <>
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </>
                  )}
                  {alert.type === "danger" && (
                    <>
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </>
                  )}
                  {alert.type === "info" && (
                    <>
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </>
                  )}
                  {alert.type === "success" && (
                    <>
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </>
                  )}
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{alert.message}</p>
                <p className="text-xs text-[color:var(--muted-foreground)]">
                  {alert.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
