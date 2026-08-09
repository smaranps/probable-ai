"use client";

import React from "react";
import { Zap } from "lucide-react";

interface CreditCounterProps {
  remaining: number;
  total?: number;
}
export default function CreditCounter({
  remaining,
  total = 5,
}: CreditCounterProps) {
  const isLow = remaining <= 1;

  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold backdrop-blur-md transition-all ${
        isLow
          ? "bg-rose-50/80 border-rose-200 text-rose-700"
          : "bg-emerald-50/80 border-emerald-200 text-emerald-700"
      }`}
    >
      <Zap
        size={14}
        className={
          isLow
            ? "text-rose-500 fill-rose-500"
            : "text-emerald-500 fill-emerald-500"
        }
      />
      <span>
        {remaining}/{total} Daily Limit
      </span>
    </div>
  );
}
