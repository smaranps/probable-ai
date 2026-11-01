"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Mail, Lock, Server, FileText, UserCheck } from "lucide-react";

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState("introduction");

  const sections = [
    { id: "introduction", label: "1. Introduction" },
    { id: "collection", label: "2. Information Collection" },
    { id: "purpose", label: "3. Processing Purpose" },
    { id: "subprocessors", label: "4. Third-Party Sub-processors" },
    { id: "security", label: "5. Retention & Security" },
    { id: "disclosure", label: "6. Sharing & Disclosure" },
    { id: "rights", label: "7. User Rights" },
    { id: "contact", label: "8. Contact Us" },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans mt-[50px]">
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-8 shadow-sm">
         
          <h1 className="text-3xl font-heading font-bold text-gray-900">
            Privacy Policy
          </h1>
          <div className="flex items-center gap-4 text-xs text-gray-500 mt-2 font-mono">
            <span>Effective Date: August 8, 2026</span>
            <span>•</span>
            <span>Last Updated: August 8, 2026</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="hidden lg:block lg:col-span-1 space-y-1 sticky top-24 h-fit">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 px-3 mb-2">
              On this page
            </p>
            {sections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => scrollToSection(sec.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeSection === sec.id
                    ? "bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                }`}
              >
                {sec.label}
              </button>
            ))}
          </aside>
          <div className="lg:col-span-3 space-y-10 bg-white p-8 sm:p-10 rounded-2xl border border-gray-200 shadow-sm text-sm text-gray-700 leading-relaxed">
            <section id="introduction" className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 border-b pb-2 border-gray-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" /> 1. Introduction
              </h2>
              <p>
                Probable.ai (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) respects your privacy and is committed to protecting your personal data. This Privacy Policy governs your access to and use of the Probable.ai application and related services (collectively, the &quot;Service&quot;). It outlines our policies regarding the collection, use, disclosure, and protection of personal information when you utilize our platform.
              </p>
              <p>
                By accessing or using the Service, you acknowledge that you have read, understood, and agreed to the practices described in this Privacy Policy.
              </p>
            </section>
            <section id="collection" className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 border-b pb-2 border-gray-100 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" /> 2. Information Collection
              </h2>
              <p>
                We collect minimal personal data necessary to provide, maintain, and enhance our services. The categories of data we collect include:
              </p>
              <div className="space-y-3 pl-2">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-1">A. Information You Directly Provide</h3>
                  <ul className="list-disc list-inside space-y-1 text-xs text-gray-600">
                    <li><strong className="text-gray-800">Account Credentials:</strong> Name, email address, and profile picture URL collected via Google Single Sign-On (OAuth).</li>
                    <li><strong className="text-gray-800">User-Submitted Academic Data:</strong> Self-reported course history, GPAs, target institutions, repeated coursework, or non-day school credits.</li>
                  </ul>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-1">B. Automatically Collected Data</h3>
                  <p className="text-xs text-gray-600">
                    <strong className="text-gray-800">Technical and Usage Log Data:</strong> IP addresses, browser types, operating system specifications, session timestamps, and system performance metrics.
                  </p>
                </div>
              </div>
            </section>
            <section id="purpose" className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 border-b pb-2 border-gray-100">
                3. Purpose and Legal Basis for Processing
              </h2>
              <p>We process your personal data for the following operational and technical purposes:</p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs text-gray-600">
                <li>To authenticate user sessions and maintain persistent state across application modules via Firebase.</li>
                <li>To compute objective probability assessments and generate custom application roadmaps based on user inputs.</li>
                <li>To secure, optimize, and maintain the performance and stability of the platform.</li>
              </ul>
            </section>
            <section id="subprocessors" className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 border-b pb-2 border-gray-100 flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-600" /> 4. Third-Party Sub-processors
              </h2>
              <p>
                To deliver core functionality, we engage third-party infrastructure and processing providers under strict security standards:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-gray-50 border border-gray-100 rounded-xl">
                  <h4 className="font-semibold text-xs text-gray-900">Google Gemini API</h4>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Academic metrics are transmitted via structured JSON interfaces for analytics. No PII (names/emails) is submitted to AI sub-processors.
                  </p>
                </div>
                <div className="p-3.5 bg-gray-50 border border-gray-100 rounded-xl">
                  <h4 className="font-semibold text-xs text-gray-900">Google Firebase</h4>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Used for secure Google OAuth user authentication and real-time database management (Cloud Firestore).
                  </p>
                </div>

                <div className="p-3.5 bg-gray-50 border border-gray-100 rounded-xl">
                  <h4 className="font-semibold text-xs text-gray-900">Vercel</h4>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Acts as our cloud hosting and deployment infrastructure provider.
                  </p>
                </div>

                <div className="p-3.5 bg-gray-50 border border-gray-100 rounded-xl">
                  <h4 className="font-semibold text-xs text-gray-900">Public Institutional Data</h4>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Evaluation algorithms rely on public datasets (CUDO, OUInfo). Private user metrics are never ingested to train public or proprietary models.
                  </p>
                </div>
              </div>
            </section>
            <section id="security" className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 border-b pb-2 border-gray-100 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" /> 5. Data Retention and Security
              </h2>
              <p>
                We retain your personal information only for as long as necessary to fulfill the purposes outlined in this policy. We employ commercial-grade technical and organizational measures including encrypted transit protocols and controlled access mechanisms—to prevent unauthorized access, disclosure, alteration, or destruction of your personal data.
              </p>
            </section>

            {/* Section 6 */}
            <section id="disclosure" className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 border-b pb-2 border-gray-100">
                6. Data Sharing and Disclosure
              </h2>
              <p>
                We do <strong className="text-gray-900">not</strong> sell, rent, trade, or monetize your personal information under any circumstances. We disclose data only to essential service providers as outlined in Section 4, or when required by applicable legal obligations, court orders, or governmental regulations.
              </p>
            </section>
            <section id="rights" className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 border-b pb-2 border-gray-100">
                7. User Rights and Data Choice
              </h2>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs text-gray-600">
                <li><strong className="text-gray-800">Access and Rectification:</strong> View or update your academic inputs directly within your account settings at any time.</li>
                <li><strong className="text-gray-800">Data Erasure:</strong> Request the complete deletion of your account, authentication tokens, session logs, and saved academic profile metrics.</li>
              </ul>
            </section>
            <section id="contact" className="space-y-3 pt-4 border-t border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-600" /> 8. Contact Information
              </h2>
              <p className="text-xs text-gray-600">
                For formal privacy inquiries, data deletion requests, or questions regarding this Privacy Policy, please contact:
              </p>
              <div className="bg-emerald-50/50 border border-emerald-200/60 p-4 rounded-xl text-xs space-y-1 font-mono text-emerald-900">
                <p><strong>Probable.ai Development Team</strong></p>
                <p>Project Lead: Smaran Pinisetty</p>
                <p>URL: <a href="https://probableai-topaz.vercel.app" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-700">probableai-topaz.vercel.app</a></p>
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}