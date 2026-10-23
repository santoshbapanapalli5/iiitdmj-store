import React, { useState } from 'react';
import {
  X,
  Code2,
  Database,
  Layers,
  ShieldCheck,
  Check,
  Copy,
  Server,
  Terminal,
  Cpu,
} from 'lucide-react';
import {
  TECH_STACK_SPEC,
  DATABASE_SCHEMA_CODE,
  VERIFIED_REVIEW_ENDPOINT_CODE,
} from '../docs/technicalArchitecture';

interface TechArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'stack' | 'schema' | 'endpoint' | 'diagram';

export const TechArchitectureModal: React.FC<TechArchitectureModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('stack');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Modal Top Header */}
        <div className="bg-[#0A192F] px-6 py-4 flex items-center justify-between text-white border-b border-amber-500/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-[#0A192F] font-bold flex items-center justify-center text-sm">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                Technical Architecture & Database Schema
              </h2>
              <div className="text-[11px] text-amber-300">
                PDPM IIITDM Jabalpur Peer-to-Peer E-Commerce Platform
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Controls (Functional buttons, not pills) */}
        <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('stack')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'stack'
                ? 'bg-white text-[#0A192F] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Recommended Tech Stack
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'schema'
                ? 'bg-white text-[#0A192F] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. Database Schema (4 Collections)
          </button>

          <button
            onClick={() => setActiveTab('endpoint')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'endpoint'
                ? 'bg-white text-[#0A192F] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3. Core Verified Review Endpoint Logic
          </button>

          <button
            onClick={() => setActiveTab('diagram')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'diagram'
                ? 'bg-white text-[#0A192F] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            4. Campus Workflow & Security Rules
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* TAB 1: TECH STACK BREAKDOWN */}
          {activeTab === 'stack' && (
            <div className="space-y-6 text-xs">
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200/60 text-slate-700">
                <h3 className="text-sm font-bold text-[#0A192F] mb-1">
                  Deliverable 1: Recommended Full-Stack Architecture
                </h3>
                <p className="text-xs text-slate-600">
                  Engineered specifically for university campus low-latency peer interactions, zero hosting overhead, and strict @iiitdmj.ac.in authentication gating.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Frontend Card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <Layers className="w-4 h-4 text-amber-600" />
                    <span>Frontend Tier</span>
                  </div>
                  <div className="space-y-2 text-slate-600">
                    <div>
                      <strong className="text-slate-800">Framework:</strong> React 19 + TypeScript + Vite
                    </div>
                    <div>
                      <strong className="text-slate-800">Styling:</strong> Tailwind CSS v4 with official IIITDMJ colors (Navy #0A192F, Gold #F59E0B, White #FFFFFF)
                    </div>
                    <div>
                      <strong className="text-slate-800">Motion:</strong> Motion (Framer Motion v12) for smooth tab & modal settles
                    </div>
                    <div>
                      <strong className="text-slate-800">Design System:</strong> Anti-slop zero-pill typography hierarchy, 60-30-10 distribution, 1440px desktop baseline
                    </div>
                  </div>
                </div>

                {/* Backend Card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <Server className="w-4 h-4 text-blue-600" />
                    <span>Backend Tier</span>
                  </div>
                  <div className="space-y-2 text-slate-600">
                    <div>
                      <strong className="text-slate-800">Runtime:</strong> Node.js (v20+ LTS)
                    </div>
                    <div>
                      <strong className="text-slate-800">REST API:</strong> Express.js with TypeScript controllers
                    </div>
                    <div>
                      <strong className="text-slate-800">Auth Engine:</strong> JWT with server-side regex restricting email to <code>/^[a-zA-Z0-9._%+-]+@iiitdmj\.ac\.in$/</code>
                    </div>
                    <div>
                      <strong className="text-slate-800">Media CDN:</strong> Cloudinary API / Firebase Storage with 5MB client image compression
                    </div>
                  </div>
                </div>

                {/* Database Card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <Database className="w-4 h-4 text-emerald-600" />
                    <span>Database & Indexing</span>
                  </div>
                  <div className="space-y-2 text-slate-600">
                    <div>
                      <strong className="text-slate-800">Database:</strong> MongoDB with Mongoose ODM or Cloud Firestore
                    </div>
                    <div>
                      <strong className="text-slate-800">Core Collections:</strong> Users, Products, Orders, Reviews
                    </div>
                    <div>
                      <strong className="text-slate-800">High-Performance Index:</strong> Compound index <code>{`{ buyerId: 1, productId: 1, status: 1 }`}</code> for O(1) review verification
                    </div>
                    <div>
                      <strong className="text-slate-800">Hostel Registry:</strong> Strict enum for Hall 1, Hall 3, Hall 4, Panini, Nagarjuna, Saraswati
                    </div>
                  </div>
                </div>

              </div>

              {/* Security & Verification Table */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-2">
                  Campus Verification Guarantees
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Smart Email Detection:</strong> Automatically routes existing vs new students while preventing any non-IIITDMJ address from writing to the DB.
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Delivered-Only Reviews:</strong> Database middleware strictly aborts any review write if an order does not exist with status = "Delivered".
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DATABASE SCHEMA */}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Deliverable 2: Complete Database Schema (Mongoose & Firestore)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Production TypeScript schema definitions for Users, Products, Orders, and Reviews with strict constraints and compound indexes.
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(DATABASE_SCHEMA_CODE, 'schema')}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  {copiedKey === 'schema' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Schema</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
                {DATABASE_SCHEMA_CODE}
              </pre>
            </div>
          )}

          {/* TAB 3: VERIFIED REVIEW ENDPOINT */}
          {activeTab === 'endpoint' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Deliverable 4: Core Backend/API Endpoint Logic for Verified Reviews
                  </h3>
                  <p className="text-xs text-slate-500">
                    Express.js handler enforcing atomicity, transaction safety, and strict "Delivered" order status verification.
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(VERIFIED_REVIEW_ENDPOINT_CODE, 'endpoint')}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  {copiedKey === 'endpoint' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Endpoint Code</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                <strong>Enforcement Mechanism:</strong> If a customer tries to submit a review before the item arrives, the endpoint returns an HTTP <code>403 Forbidden</code> with error code <code>ORDER_NOT_DELIVERED</code>.
              </div>

              <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
                {VERIFIED_REVIEW_ENDPOINT_CODE}
              </pre>
            </div>
          )}

          {/* TAB 4: WORKFLOW & SECURITY DIAGRAM */}
          {activeTab === 'diagram' && (
            <div className="space-y-5 text-xs text-slate-700">
              <h3 className="text-sm font-bold text-slate-900">
                Campus Lifecycle & Security Enforcement
              </h3>

              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#0A192F] text-white flex items-center justify-center text-[10px]">1</span>
                    <span>Student Onboarding & Roll Extraction Flow</span>
                  </div>
                  <p className="text-slate-600 pl-7">
                    When student enters <code>22bcs045@iiitdmj.ac.in</code>, the auth service parses roll number (<code>22BCS045</code>), calculates batch (<code>2022</code>), maps the department code to Computer Science & Engineering, and checks existence in the <code>users</code> collection. New users seamlessly land on the room & hostel registration view.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#0A192F] text-white flex items-center justify-center text-[10px]">2</span>
                    <span>Campus-Specific Hostel Checkout Flow</span>
                  </div>
                  <p className="text-slate-600 pl-7">
                    Bypasses standard shipping carriers. Forces selection from official IIITDMJ halls (Hall 1, Hall 3, Hall 4, Panini, Nagarjuna, Saraswati, PG Blocks), room number, and preferred handover slot (Morning before classes, Afternoon break, Evening post-labs, or Night mess).
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#0A192F] text-white flex items-center justify-center text-[10px]">3</span>
                    <span>Verified Review Delivery Gate</span>
                  </div>
                  <p className="text-slate-600 pl-7">
                    Review text and star rating are client-locked and server-gated. Only after either the buyer confirms receipt at their hostel or the seller confirms handover does order status become <code>"Delivered"</code>, immediately unlocking the review form for that buyer.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
