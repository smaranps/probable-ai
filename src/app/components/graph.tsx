"use client";

import React, { useEffect, useState } from "react";
import { UserProfileData } from "@/app/components/onboarding";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  LabelList,
} from "recharts";
import {
  Users,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface DashboardChartsProps {
  profile: UserProfileData;
}

interface BenchmarkData {
  sampleCount: number;
  benchmarkMean: number;
  isProgramSpecific: boolean;
}

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-xl border border-slate-200 text-xs flex flex-col gap-1 z-50">
        <span className="font-medium text-slate-500">
          {data.payload.category}
        </span>
        <span className="text-base font-extrabold font-mono text-slate-900">
          {data.value}%
        </span>
      </div>
    );
  }
  return null;
}

export default function DashboardCharts({ profile }: DashboardChartsProps) {
  const userAvg = profile.top6Average || 0;
  const [benchmark, setBenchmark] = useState<BenchmarkData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchBenchmark() {
      setLoading(true);
      try {
        const res = await fetch("/api/benchmark", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            university: profile.university,
            program: profile.program,
          }),
        });
        const data = await res.json();
        setBenchmark(data);
      } catch (err) {
        console.error("Error fetching university benchmark:", err);
      } finally {
        setLoading(false);
      }
    }

    if (profile.university) {
      fetchBenchmark();
    }
  }, [profile.university, profile.program]);

  const benchmarkMean = benchmark?.benchmarkMean ?? 92.5;
  const sampleCount = benchmark?.sampleCount
    ? `${benchmark.sampleCount}+`
    : "0";

  const diff = userAvg - benchmarkMean;
  const isCompetitive = diff >= 0;
  const comparisonData = [
    {
      category: "Your Average",
      average: userAvg,
      gradientId: "emeraldGrad",
    },
    {
      category: `${profile.university || "Target"} Offer Avg`,
      average: benchmarkMean,
      gradientId: "indigoGrad",
    },
  ];
  const minDomain = Math.max(
    50,
    Math.floor(Math.min(userAvg, benchmarkMean) - 10)
  );

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5 w-full max-w-3xl transition-all duration-300 hover:shadow-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <div className="p-1.5 bg-emerald-100 rounded-md">
              <TrendingUp size={16} className="text-emerald-600" />
            </div>
            Admissions Benchmark
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Comparing your standing against accepted applicants for{" "}
            <span className="font-semibold text-slate-800">
              {profile.university || "selected program"}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 shrink-0">
          <Users size={14} className="text-indigo-500" />
          {loading ? (
            <span className="animate-pulse">Loading data...</span>
          ) : (
            <span>
              Sample:{" "}
              <strong className="text-slate-900 font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">
                {sampleCount}
              </strong>{" "}
              entries
            </span>
          )}
        </div>
      </div>
      <div className="h-72 w-full pt-4">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-xs font-mono text-slate-400 animate-pulse gap-3">
            <Sparkles size={20} className="animate-spin text-indigo-400" />
            Analyzing admissions statistics...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={comparisonData}
              margin={{ top: 25, right: 30, left: -15, bottom: 5 }}
            >
              <defs>
                <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={1} />
                </linearGradient>
                <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity={1} />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity={1} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="category"
                tickLine={false}
                axisLine={{ stroke: "#f1f5f9" }}
                tick={{ fontSize: 12, fontWeight: 600, fill: "#64748b" }}
              />
              <YAxis
                domain={[minDomain, 100]}
                tickLine={false}
                axisLine={{ stroke: "#f1f5f9" }}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                unit="%"
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "#f8fafc" }}
              />

              <ReferenceLine
                y={benchmarkMean}
                stroke="#818cf8"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `Target: ${benchmarkMean}%`,
                  fill: "#4f46e5",
                  fontSize: 11,
                  fontWeight: 700,
                  position: "top",
                }}
              />

              <Bar dataKey="average" radius={[6, 6, 0, 0]} barSize={60}>
                <LabelList
                  dataKey="average"
                  position="top"
                  formatter={(val: any) => (val ? `${val}%` : "")}
                  style={{
                    fill: "#334155",
                    fontSize: "12px",
                    fontWeight: 700,
                    fontFamily: "monospace",
                  }}
                />
                {comparisonData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#${entry.gradientId})`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      {!loading && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm transition-colors mt-2 ${
            isCompetitive
              ? "bg-emerald-50/50 border-emerald-100 text-emerald-900"
              : "bg-amber-50/50 border-amber-100 text-amber-900"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {isCompetitive ? (
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle size={18} className="text-amber-500 shrink-0" />
            )}
            <span className="font-medium">
              {isCompetitive
                ? "Your average places you in a highly competitive range."
                : "You are currently below the historical benchmark."}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs uppercase tracking-wide font-bold opacity-70">
              Variance
            </span>
            <span
              className={`font-mono font-bold px-2 py-1 rounded-md bg-white border ${
                isCompetitive
                  ? "text-emerald-600 border-emerald-100"
                  : "text-amber-600 border-amber-100"
              }`}
            >
              {diff >= 0 ? "+" : ""}
              {diff.toFixed(1)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
