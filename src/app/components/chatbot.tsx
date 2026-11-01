"use client";

import React, { useState } from 'react';
import { MessageSquare, X, Send, Sparkles, RefreshCw } from 'lucide-react';

export default function DashboardChatbot({ userProfile }: { userProfile?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', text: string }>>([
    { role: 'assistant', text: 'Hey! Have any quick questions about your Top 6 calculation, or application strategy?' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!query.trim() || loading) return;
    const userMsg = query;
    setQuery("");
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userMsg,
          profile: userProfile || {}
        }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', text: data.answer || "Sorry, I couldn't process that." }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', text: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-13 h-13 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-3.5 shadow-lg flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
          aria-label="Open Admissions Assistant"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[450px] bg-white rounded-2xl border border-gray-200 shadow-2xl flex flex-col justify-between overflow-hidden transition-all">
          <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold">Admissions Assistant</h3>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/50 text-xs">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-xl leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-white border border-gray-200 text-gray-800 shadow-sm rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-3 rounded-xl shadow-sm text-gray-400 flex items-center gap-2">
                  <RefreshCw className="animate-spin w-3 h-3 text-emerald-600" /> Thinking...
                </div>
              </div>
            )}
          </div>
          <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask about cutoffs, or courses..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <button
              onClick={handleSend}
              disabled={loading || !query.trim()}
              className="p-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white rounded-xl transition-all cursor-pointer"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}