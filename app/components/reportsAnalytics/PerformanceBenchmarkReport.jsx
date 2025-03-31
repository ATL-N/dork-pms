// app/components/reportsAnalytics/PerformanceBenchmarkReport.js
import { useState } from 'react';
import { Award, Globe, LucideGitCompare } from 'lucide-react';

export default function PerformanceBenchmarkReport() {
  const [activeCategory, setActiveCategory] = useState("layers");

  const benchmarkData = {
    layers: [
      {
        metric: "Egg Production",
        farmPerformance: 92.5,
        industryAverage: 88.0,
        benchmark: "above",
      },
      {
        metric: "Feed Conversion",
        farmPerformance: 1.8,
        industryAverage: 2.0,
        benchmark: "below",
      },
      {
        metric: "Mortality Rate",
        farmPerformance: 3.2,
        industryAverage: 4.5,
        benchmark: "below",
      },
    ],
    broilers: [
      {
        metric: "Weight Gain",
        farmPerformance: 48,
        industryAverage: 45,
        benchmark: "above",
      },
      {
        metric: "Feed Conversion",
        farmPerformance: 1.65,
        industryAverage: 1.75,
        benchmark: "below",
      },
      {
        metric: "Mortality Rate",
        farmPerformance: 4.2,
        industryAverage: 5.0,
        benchmark: "below",
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 flex items-center gap-2 rounded-full ${
              activeCategory === "layers"
                ? "bg-[color:var(--primary)] text-white"
                : "bg-[color:var(--card)] text-[color:var(--muted-foreground)]"
            }`}
            onClick={() => setActiveCategory("layers")}
          >
            <Award size={18} />
            Layer Farm
          </button>
          <button
            className={`px-4 py-2 flex items-center gap-2 rounded-full ${
              activeCategory === "broilers"
                ? "bg-[color:var(--primary)] text-white"
                : "bg-[color:var(--card)] text-[color:var(--muted-foreground)]"
            }`}
            onClick={() => setActiveCategory("broilers")}
          >
            <Globe size={18} />
            Broiler Farm
          </button>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <LucideGitCompare size={18} />
          <span>Compare Regions</span>
        </button>
      </div>
      {/* // continued from previous artifact... */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Benchmark Metrics */}
        <div className="card">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <LucideGitCompare size={18} /> Performance Metrics Comparison
          </h3>
          <table className="w-full">
            <thead>
              <tr className="bg-[color:var(--card)] text-[color:var(--muted-foreground)]">
                <th className="p-2 text-left">Metric</th>
                <th className="p-2 text-right">Farm Performance</th>
                <th className="p-2 text-right">Industry Average</th>
                <th className="p-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {benchmarkData[activeCategory].map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-[color:var(--border)]"
                >
                  <td className="p-2">{item.metric}</td>
                  <td className="p-2 text-right font-medium">
                    {item.farmPerformance}
                  </td>
                  <td className="p-2 text-right">{item.industryAverage}</td>
                  <td className="p-2 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        item.benchmark === "above"
                          ? "bg-[color:var(--success)] bg-opacity-10 text-[color:var(--success)]"
                          : "bg-[color:var(--destructive)] bg-opacity-10 text-[color:var(--destructive)]"
                      }`}
                    >
                      {item.benchmark === "above"
                        ? "Outperforming"
                        : "Below Average"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Comparative Analysis */}
        <div className="card">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Globe size={18} /> Regional Comparative Analysis
          </h3>
          <div className="space-y-4">
            {[
              {
                region: "Local Region",
                score: 92,
                color: "bg-[color:var(--primary)]",
              },
              {
                region: "National Average",
                score: 88,
                color: "bg-[color:var(--accent)]",
              },
              {
                region: "Top Performing Region",
                score: 95,
                color: "bg-[color:var(--success)]",
              },
            ].map((region, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-[color:var(--muted-foreground)]">
                    {region.region}
                  </p>
                </div>
                <div className="w-full bg-[color:var(--card)] rounded-full h-2.5">
                  <div
                    className={`${region.color} h-2.5 rounded-full`}
                    style={{ width: `${region.score}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{region.score}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}