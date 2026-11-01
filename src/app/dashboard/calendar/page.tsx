"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  X,
  Download,
} from "lucide-react";
import { Actor } from "next/font/google";

const actor = Actor({ weight: "400", style: "normal", variable: "--font-actor" });

type EventCategory = "OUAC" | "Supplemental" | "Scholarship" | "Personal";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  category: EventCategory;
  isOfficialDeadline: boolean;
}

interface EventFormState {
  title: string;
  date: string;
  category: EventCategory;
  isOfficialDeadline: boolean;
}
const CATEGORY_STYLES: Record<EventCategory, { dot: string; chip: string }> = {
  OUAC: { dot: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  Supplemental: { dot: "bg-blue-500", chip: "bg-blue-50 text-blue-700 border-blue-200" },
  Scholarship: { dot: "bg-amber-500", chip: "bg-amber-50 text-amber-700 border-amber-200" },
  Personal: { dot: "bg-violet-500", chip: "bg-violet-50 text-violet-700 border-violet-200" },
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
function pad(n: number): string {
  return String(n).padStart(2, "0");
}
function toISODate(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}
function parseISODate(iso: string): { year: number; month: number; day: number } {
  const [y, m, d] = iso.split("-").map(Number);
  return { year: y, month: m - 1, day: d }; 
}

export default function CalendarPage() {
  const todayISO = useMemo(() => {
    const t = new Date();
    return toISODate(t.getFullYear(), t.getMonth(), t.getDate());
  }, []);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | "All">("All");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<EventFormState>({
    title: "",
    date: "",
    category: "Personal",
    isOfficialDeadline: false,
  });
  const now = new Date();
  const [viewYear, setViewYear] = useState<number>(now.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(now.getMonth()); 
  const [selectedDate, setSelectedDate] = useState<string | null>(null); 
  const filteredEvents = selectedCategory === "All"
    ? events
    : events.filter((e) => e.category === selectedCategory);
  const sortedEvents = [...filteredEvents].sort((a, b) => a.date.localeCompare(b.date));
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const e of events) {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    }
    return map;
  }, [events]);
  function handleAddEvent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.title.trim() || !form.date) return;
    const newEvent: CalendarEvent = {
      id: `evt-${Date.now()}`,
      title: form.title.trim(),
      date: form.date,
      category: form.category,
      isOfficialDeadline: form.isOfficialDeadline,
    };
    setEvents((prev) => [...prev, newEvent]);
    const { year, month } = parseISODate(form.date);
    setViewYear(year);
    setViewMonth(month);
    setSelectedDate(form.date);
    setForm({ title: "", date: "", category: "Personal", isOfficialDeadline: false });
    setShowForm(false);
  }
  function removeEvent(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }
  function goToPrevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }
  function goToNextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }
  function exportToGoogleCalendar(evt: CalendarEvent) {
    const { year, month, day } = parseISODate(evt.date);
    const start = `${year}${pad(month + 1)}${pad(day)}`;
    const endDateObj = new Date(year, month, day + 1);
    const end = `${endDateObj.getFullYear()}${pad(endDateObj.getMonth() + 1)}${pad(endDateObj.getDate())}`;
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: evt.title,
      dates: `${start}/${end}`,
      details: `${evt.category}${evt.isOfficialDeadline ? " — Official deadline" : ""}`,
    });
    window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, "_blank");
  }
  function exportAllToICS() {
    if (events.length === 0) return;
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Admissions Timeline//EN",
      "CALSCALE:GREGORIAN",
    ];
    for (const evt of events) {
      const { year, month, day } = parseISODate(evt.date);
      const start = `${year}${pad(month + 1)}${pad(day)}`;
      const endDateObj = new Date(year, month, day + 1);
      const end = `${endDateObj.getFullYear()}${pad(endDateObj.getMonth() + 1)}${pad(endDateObj.getDate())}`;
      lines.push(
        "BEGIN:VEVENT",
        `UID:${evt.id}@admissions-timeline`,
        `DTSTART;VALUE=DATE:${start}`,
        `DTEND;VALUE=DATE:${end}`,
        `SUMMARY:${evt.title.replace(/,/g, "\\,")}`,
        `DESCRIPTION:${evt.category}${evt.isOfficialDeadline ? " - Official deadline" : ""}`,
        "END:VEVENT"
      );
    }
    lines.push("END:VCALENDAR");
    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "admissions-deadlines.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startWeekday = firstOfMonth.getDay();
  const gridCells = [];
  for (let i = 0; i < startWeekday; i++) gridCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) gridCells.push(d);
  const selectedDayEvents = selectedDate ? (eventsByDate[selectedDate] || []) : [];
  return (
    <div className="max-w-6xl mx-auto space-y-8 mt-[80px]" style={{ fontFamily: actor.style.fontFamily }}>
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Key Deadlines & Milestones
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Add your own OUAC dates, supplemental cutoffs, and personal target goals, then sync them to your calendar.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white p-1.5 border border-gray-200 rounded-xl">
            {(["All", "OUAC", "Supplemental", "Scholarship", "Personal"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus size={14} /> Add Date
          </button>
        </div>
      </div>
      {showForm && (
        <form
          onSubmit={handleAddEvent}
          className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end"
        >
          <div className="lg:col-span-2 flex flex-col gap-1">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Title</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Queen's Supplementary Form Due"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Date</label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as EventCategory }))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400"
            >
              {Object.keys(CATEGORY_STYLES).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 pb-2.5">
            <input
              id="official"
              type="checkbox"
              checked={form.isOfficialDeadline}
              onChange={(e) => setForm((f) => ({ ...f, isOfficialDeadline: e.target.checked }))}
              className="h-4 w-4 accent-emerald-600"
            />
            <label htmlFor="official" className="text-xs font-semibold text-gray-600">Official cutoff</label>
          </div>
          <div className="lg:col-span-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3.5 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Save date
            </button>
          </div>
        </form>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={goToPrevMonth}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                  aria-label="Previous month"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => { setViewYear(now.getFullYear()); setViewMonth(now.getMonth()); }}
                  className="px-2 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-[11px] font-semibold text-gray-600 cursor-pointer"
                >
                  Today
                </button>
                <button
                  onClick={goToNextMonth}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                  aria-label="Next month"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <div key={i} className="text-center text-[10px] font-bold text-gray-400 py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {gridCells.map((day, idx) => {
                if (day === null) return <div key={`empty-${idx}`} className="aspect-square" />;
                const iso = toISODate(viewYear, viewMonth, day);
                const dayEvents = eventsByDate[iso] || [];
                const isToday = iso === todayISO;
                const isSelected = iso === selectedDate;
                return (
                  <button
                    key={iso}
                    onClick={() => setSelectedDate(isSelected ? null : iso)}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-colors relative cursor-pointer
                      ${isSelected ? "bg-emerald-600 text-white" : dayEvents.length > 0 ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100" : "text-gray-600 hover:bg-gray-50"}
                      ${isToday && !isSelected ? "ring-1 ring-emerald-400" : ""}
                    `}
                  >
                    <span>{day}</span>
                    {dayEvents.length > 0 && (
                      <span className="flex gap-0.5">
                        {dayEvents.slice(0, 3).map((e) => (
                          <span
                            key={e.id}
                            className={`w-1 h-1 rounded-full ${isSelected ? "bg-white" : CATEGORY_STYLES[e.category].dot}`}
                          />
                        ))}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedDate && (
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-900">{selectedDate}</h3>
                <button onClick={() => setSelectedDate(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                  <X size={14} />
                </button>
              </div>
              {selectedDayEvents.length === 0 ? (
                <p className="text-xs text-gray-400">No dates saved on this day yet.</p>
              ) : (
                selectedDayEvents.map((evt) => (
                  <div key={evt.id} className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-gray-800">{evt.title}</span>
                    <button
                      onClick={() => exportToGoogleCalendar(evt)}
                      className="text-emerald-600 hover:text-emerald-800 font-semibold shrink-0 cursor-pointer"
                    >
                      + Google Calendar
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center justify-between pt-2">
            <span>All Saved Dates ({sortedEvents.length})</span>
          </h2>
          <div className="space-y-3">
            {sortedEvents.length === 0 && (
              <div className="bg-white p-6 rounded-2xl border border-dashed border-gray-300 text-center text-sm text-gray-400">
                No dates yet. Please Click "Add Date" to start building your timeline.
              </div>
            )}
            {sortedEvents.map((evt) => (
              <div
                key={evt.id}
                className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200/60 rounded-xl text-emerald-600 shrink-0 mt-0.5">
                    <Clock size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm text-gray-900">{evt.title}</h3>
                      {evt.isOfficialDeadline && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-md">
                          Official Cutoff
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span className="font-mono text-gray-700 font-semibold">{evt.date}</span>
                      <span>•</span>
                      <span className={`px-1.5 py-0.5 rounded border text-[10px] font-semibold ${CATEGORY_STYLES[evt.category].chip}`}>
                        {evt.category}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => exportToGoogleCalendar(evt)}
                    className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-800 cursor-pointer"
                  >
                    Add to Google
                  </button>
                  <button
                    onClick={() => removeEvent(evt.id)}
                    className="text-gray-300 hover:text-rose-500 cursor-pointer"
                    aria-label="Remove"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Calendar Sync
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Export every saved date as a single file that Google Calendar, Apple Calendar, and Outlook can all import, or push one date straight to Google from its card.
            </p>
            <button
              onClick={exportAllToICS}
              disabled={events.length === 0}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download size={14} /> Export All (.ics)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}