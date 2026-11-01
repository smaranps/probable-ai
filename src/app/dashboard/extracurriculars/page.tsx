"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  ExternalLink,
  Clock,
  MapPin,
  Award,
  Filter,
  BookOpen,
  DollarSign,
} from "lucide-react";
import ecData from "@/app/data/extracurriculars.json";
import { motion } from "framer-motion";

interface Extracurricular {
  id: string;
  title: string;
  organization: string;
  category: "STEM" | "Business" | "Volunteer" | "Leadership" | "Arts";
  type: "Competition" | "Program" | "Volunteer" | "Club" | "Leadership";
  section?: string;
  commitment: string;
  locationType: string;
  description: string;
  targetGrades: number[];
  officialUrl: string;
  cost: string;
}

const SECTION_ORDER = [
  "Programs & Enrichment",
  "STEM Clubs & Activities",
  "Business",
  "Leadership",
  "Volunteer & Community",
  "Arts & Communication",
  "Other",
  "Contests",
];

export default function ExtracurricularsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedSection, setSelectedSection] = useState<string>("All");

  const categories = [
    "All",
    "STEM",
    "Business",
    "Volunteer",
    "Leadership",
    "Arts",
  ];
  const types = ["All", "Competition", "Program", "Volunteer", "Club"];
  const sections = ["All", ...SECTION_ORDER];

  const filteredData = useMemo(() => {
    return (ecData as Extracurricular[]).filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      const matchesType =
        selectedType === "All" || item.type === selectedType;
      const matchesSection =
        selectedSection === "All" ||
        (item.section || "Other") === selectedSection;
      return (
        matchesSearch && matchesCategory && matchesType && matchesSection
      );
    });
  }, [searchQuery, selectedCategory, selectedType, selectedSection]);

  const grouped = useMemo(() => {
    const map = new Map<string, Extracurricular[]>();
    for (const item of filteredData) {
      const key = item.section || "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return SECTION_ORDER.filter((s) => map.has(s)).map((s) => ({
      section: s,
      items: map.get(s)!,
    }));
  }, [filteredData]);

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "STEM":
        return "bg-[var(--accent-muted)] text-[var(--accent)] border-[var(--accent)]/20";
      case "Business":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "Volunteer":
        return "bg-sky-50 text-sky-800 border-sky-200";
      case "Leadership":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-rose-50 text-rose-700 border-rose-200";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="max-w-7xl mx-auto space-y-8 mt-[60px]"
    >
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold text-[var(--ink)] tracking-tight">
          Extracurricular opportunities
        </h1>
        <p className="text-[var(--ink-soft)] max-w-2xl text-sm leading-relaxed">
          Browse programs, clubs, and contests to strengthen your application.
          Waterloo math contests live in their own Contests section at the end.
        </p>
      </div>

      <div className="bg-[var(--paper)] p-5 rounded-xl border border-[var(--border)] space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ink-soft)] w-5 h-5" />
          <input
            type="text"
            placeholder="Search by title, organization, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[var(--mist)] border border-[var(--border)] rounded-lg text-[var(--ink)] placeholder:text-[var(--ink-soft)]/70 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border)]">
          <span className="text-xs font-semibold text-[var(--ink-soft)] flex items-center gap-1">
            <Filter size={12} /> Section:
          </span>
          {sections.map((section) => (
            <button
              key={section}
              onClick={() => setSelectedSection(section)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                selectedSection === section
                  ? "bg-[var(--ink)] text-white"
                  : "bg-[var(--mist)] text-[var(--ink-soft)] hover:bg-[var(--border)]"
              }`}
            >
              {section}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-[var(--ink-soft)]">
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--mist)] text-[var(--ink-soft)] hover:bg-[var(--border)]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-[var(--ink-soft)]">
              Type:
            </span>
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  selectedType === type
                    ? "bg-[var(--ink)] text-white"
                    : "bg-[var(--mist)] text-[var(--ink-soft)] hover:bg-[var(--border)]"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="text-xs font-medium text-[var(--ink-soft)] px-1">
        Showing{" "}
        <span className="text-[var(--ink)] font-semibold">
          {filteredData.length}
        </span>{" "}
        opportunities
      </div>

      <div className="space-y-10">
        {grouped.map(({ section, items }) => (
          <section key={section} className="space-y-4">
            <div className="flex items-end justify-between gap-3 border-b border-[var(--border)] pb-2">
              <h2 className="font-heading text-lg font-semibold text-[var(--ink)] tracking-tight">
                {section}
              </h2>
              {section === "Contests" && (
                <p className="text-xs text-[var(--ink-soft)] max-w-md text-right">
                  CEMC / Waterloo contests — useful for engineering, math, and
                  CS applications.
                </p>
              )}
            </div>
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {items.map((ec, index) => (
                <motion.div
                  key={ec.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.02 }}
                  className="bg-[var(--paper)] border border-[var(--border)] rounded-xl p-5 flex flex-col justify-between hover:border-[var(--accent)]/40 transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${getCategoryBadgeColor(ec.category)}`}
                      >
                        {ec.category}
                      </span>
                      <span className="bg-[var(--mist)] text-[var(--ink-soft)] text-xs px-2.5 py-1 rounded-md font-medium border border-[var(--border)]">
                        {ec.type}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors line-clamp-2">
                        {ec.title}
                      </h3>
                      <p className="text-xs font-medium text-[var(--ink-soft)] mt-0.5">
                        {ec.organization}
                      </p>
                    </div>
                    <p className="text-xs text-[var(--ink-soft)] leading-relaxed line-clamp-3">
                      {ec.description}
                    </p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-[var(--border)] space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-[var(--ink-soft)]">
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} />
                        <span>{ec.commitment}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} />
                        <span>{ec.locationType}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <DollarSign size={14} />
                        <span className="line-clamp-1">{ec.cost}</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2">
                        <BookOpen size={13} />
                        <span>Grades: {ec.targetGrades.join(", ")}</span>
                      </div>
                    </div>
                    <a
                      href={ec.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[var(--mist)] hover:bg-[var(--accent-muted)] text-[var(--ink)] hover:text-[var(--accent)] border border-[var(--border)] rounded-lg text-xs font-semibold transition-all"
                    >
                      Visit official site <ExternalLink size={13} />
                    </a>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </section>
        ))}
      </div>

      {filteredData.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 bg-[var(--paper)] rounded-xl border border-[var(--border)] space-y-3"
        >
          <Award className="w-10 h-10 text-[var(--border)] mx-auto" />
          <h3 className="text-base font-semibold text-[var(--ink)]">
            No opportunities found
          </h3>
          <p className="text-xs text-[var(--ink-soft)] max-w-sm mx-auto">
            Try adjusting your search terms or clearing section filters.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
