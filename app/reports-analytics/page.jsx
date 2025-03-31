// app/reports-analytics/page.js
"use client";

import { useState } from "react";
import {
  BarChart2,
  FileText,
  TrendingUp,
  Database,
  PieChart,
  Filter,
} from "lucide-react";
import DataAnalysisSummary from "../components/reportsAnalytics/DataAnalysisSummary";
import PerformanceBenchmarkReport from "../components/reportsAnalytics/PerformanceBenchmarkReport";
import HistoricalDataAnalysis from "../components/reportsAnalytics/HistoricalDataAnalysis";
import ForecastingReport from "../components/reportsAnalytics/ForecastingReport";

export default function ReportsAnalytics() {
  const [activeTab, setActiveTab] = useState("summary");

  const reportTabs = [
    {
      id: "summary",
      label: "Data Analysis Summary",
      icon: <BarChart2 size={18} />,
    },
    {
      id: "historical",
      label: "Historical Data",
      icon: <FileText size={18} />,
    },
    {
      id: "benchmark",
      label: "Performance Benchmark",
      icon: <TrendingUp size={18} />,
    },
    {
      id: "forecasting",
      label: "Forecasting",
      icon: <PieChart size={18} />,
    },
  ];

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case "summary":
        return <DataAnalysisSummary />;
      case "historical":
        return <HistoricalDataAnalysis />;
      case "benchmark":
        return <PerformanceBenchmarkReport />;
      case "forecasting":
        return <ForecastingReport />;
      default:
        return <DataAnalysisSummary />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <button className="btn-primary flex items-center gap-2">
          <Database size={18} />
          <span>Export All Reports</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[color:var(--border)]">
        {reportTabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2 font-medium flex items-center gap-2 ${
              activeTab === tab.id
                ? "text-[color:var(--primary)] border-b-2 border-[color:var(--primary)]"
                : "text-[color:var(--muted-foreground)]"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report Content */}
      <div className="space-y-4">{renderActiveTabContent()}</div>
    </div>
  );
}


// this is the text from kde connect on my phone. this is a great text