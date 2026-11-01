"use client";

import React, { useState } from 'react';
import { FileText, Sparkles, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Actor, Google_Sans_Flex } from 'next/font/google';
const actor = Actor({ weight: '400', style: 'normal', variable: '--font-actor' });
const googleSansFlex = Google_Sans_Flex({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-google-sans-flex",
});


export default function EssayReviewerPage() {
  const [essay, setEssay] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!essay.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/review-essay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ essayText: essay }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="max-w-5xl mx-auto space-y-8 mt-[80px]" 
      style={{ fontFamily: actor.style.fontFamily }}
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h1 className="text-3xl font-heading font-bold text-gray-900">
          Essay Authenticity & AI Reviewer
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Paste your supplemental answers or essay below to detect AI writing patterns and get feedback.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4"
        >
          <label className="block text-sm font-semibold text-gray-700">
            Your Essay Draft
          </label>
          <textarea
            rows={12}
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            placeholder="Paste your essay here..."
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAnalyze}
            disabled={loading || essay.length < 50}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            {loading ? <RefreshCw className="animate-spin w-4 h-4" /> : <FileText className="w-4 h-4" />}
            {loading ? "Analyzing Essay..." : "Run Analysis"}
          </motion.button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-4"
        >
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6"
                style={{ fontFamily: googleSansFlex.style.fontFamily }}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                    <span className="text-xs font-semibold text-emerald-700 uppercase">Human Score</span>
                    <p className="text-3xl font-bold text-emerald-600 mt-1">{result.humanScore}%</p>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
                    <span className="text-xs font-semibold text-amber-700 uppercase">AI Pattern Likelihood</span>
                    <p className="text-3xl font-bold text-amber-600 mt-1">{result.aiScore}%</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Assessment</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{result.summary}</p>
                </div>
                {result.flaggedPhrases?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1 text-amber-600">
                      <AlertCircle size={14} /> Potential AI Triggers
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.flaggedPhrases.map((phrase: string, idx: number) => (
                        <motion.span 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          key={idx} 
                          className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-md border border-amber-200 font-mono"
                        >
                          "{phrase}"
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}
                {result.feedback?.length > 0 && (
                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Improvement Tips</h4>
                    <ul className="space-y-2">
                      {result.feedback.map((tip: string, idx: number) => (
                        <motion.li 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          key={idx} 
                          className="text-xs text-gray-600 flex items-start gap-2"
                        >
                          <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="h-full min-h-[300px] border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center bg-gray-50/50"
              >
                <FileText className="w-10 h-10 text-gray-300 mb-2" />
                <p className="text-sm font-semibold text-gray-500">No Essay Analyzed Yet</p>
                <p className="text-xs text-gray-400 max-w-xs mt-1">
                  Paste your text on the left and click "Run Analysis" to get real-time feedback.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}