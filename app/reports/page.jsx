"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Home, BarChart2, FileText, HardDrive } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNotification } from "../context/NotificationContext";
import FinancialReport from "../components/reports/FinancialReport";
import FlockPerformanceReport from "../components/reports/FlockPerformanceReport";
import ProductionReport from "../components/reports/ProductionReport";
import InventoryUsageReport from "../components/reports/InventoryUsageReport";

const reportTypes = [
  { id: 'financial', name: 'Financial', icon: BarChart2, component: FinancialReport },
  { id: 'flock-performance', name: 'Flock Performance', icon: BarChart2, component: FlockPerformanceReport },
  { id: 'production', name: 'Production', icon: FileText, component: ProductionReport },
  { id: 'inventory-usage', name: 'Inventory Usage', icon: HardDrive, component: InventoryUsageReport },
];

function ReportsPageContent() {
  const [farms, setFarms] = useState([]);
  const [activeFarmId, setActiveFarmId] = useState(null);
  const [activeReport, setActiveReport] = useState(reportTypes[0].id);
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const [reportParams, setReportParams] = useState({
    dateRange: { from: thirtyDaysAgo, to: new Date() },
  });

  const { data: session } = useSession();
  const { addNotification } = useNotification();

  const fetchUserFarms = useCallback(async () => {
    if (!session) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/user/farms');
      if (!res.ok) throw new Error('Failed to fetch farms');
      const farmsData = await res.json();
      setFarms(farmsData);
      if (farmsData.length > 0) {
        setActiveFarmId(farmsData[0].id);
      }
    } catch (err) {
      addNotification(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [session, addNotification]);

  useEffect(() => {
    fetchUserFarms();
  }, [fetchUserFarms]);

  const generateReport = useCallback(async () => {
    if (!activeFarmId || !activeReport) return;
    setIsGenerating(true);
    setReportData(null);
    try {
      const queryParams = new URLSearchParams({
        farmId: activeFarmId,
        reportType: activeReport,
        'dateRange[from]': reportParams.dateRange.from.toISOString(),
        'dateRange[to]': reportParams.dateRange.to.toISOString(),
      }).toString();
      
      const res = await fetch(`/api/reports?${queryParams}`);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to generate report');
      }
      
      const data = await res.json();
      setReportData(data);
    } catch (err) {
      addNotification(err.message, 'error');
    } finally {
      setIsGenerating(false);
    }
  }, [activeFarmId, activeReport, reportParams, addNotification]);

  useEffect(() => {
    if (activeFarmId) {
      generateReport();
    }
  // We don't want to auto-regenerate every time params change, only on farm/report type change or manual click.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFarmId, activeReport]);

  const ActiveReportComponent = reportTypes.find(r => r.id === activeReport)?.component;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">Reports</h1>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-[color:var(--border)] pb-2">
        <span className="font-medium mr-2 shrink-0">Farm:</span>
        {isLoading ? <LoadingSpinner /> : farms.length > 0 ? farms.map(farm => (
          <button
            key={farm.id}
            className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-2 shrink-0 ${
              activeFarmId === farm.id
                ? "bg-[color:var(--primary)] text-white"
                : "bg-[color:var(--card)] hover:bg-[color:var(--accent)]"
            }`}
            onClick={() => setActiveFarmId(farm.id)}
          >
            <Home size={16} />
            {farm.name}
          </button>
        )) : <p className="text-sm text-[color:var(--muted-foreground)]">No farms found.</p>}
      </div>

      {activeFarmId ? (
        <>
          <div className="flex border-b border-[color:var(--border)] overflow-x-auto">
            {reportTypes.map(report => (
              <button
                key={report.id}
                className={`px-4 py-2 font-medium flex items-center gap-2 shrink-0 ${
                  activeReport === report.id
                    ? "text-[color:var(--primary)] border-b-2 border-[color:var(--primary)]"
                    : "text-[color:var(--muted-foreground)]"
                }`}
                onClick={() => setActiveReport(report.id)}
              >
                <report.icon size={16} /> {report.name}
              </button>
            ))}
          </div>

          <div className="card p-4 md:p-6">
            {isGenerating ? (
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner />
                </div>
            ) : reportData && ActiveReportComponent ? (
                <ActiveReportComponent 
                data={reportData} 
                params={reportParams}
                onParamsChange={setReportParams}
                onRegenerate={generateReport}
                />
            ) : (
                <div className="text-center py-8 text-[color:var(--muted-foreground)]">
                    <p>Could not load report data. Try selecting another report or farm.</p>
                </div>
            )}
          </div>
        </>
      ) : (
        !isLoading && <div className="text-center p-8">
          <h2 className="text-xl font-semibold">No Farm Selected</h2>
          <p className="mt-2 text-[color:var(--muted-foreground)]">Please select a farm to generate reports.</p>
        </div>
      )}
    </div>
  );
}

export default function ReportsPage() {
    return (
        <React.Suspense fallback={<LoadingSpinner />}>
            <ReportsPageContent />
        </React.Suspense>
    );
}
