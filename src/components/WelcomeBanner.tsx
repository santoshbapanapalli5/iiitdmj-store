import React from 'react';
import { ShieldCheck, Truck, Star, Sparkles, Building, ArrowRight, UserCheck } from 'lucide-react';

interface WelcomeBannerProps {
  onListProduct: () => void;
  onBrowse: () => void;
  studentName?: string;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  onListProduct,
  onBrowse,
  studentName,
}) => {
  return (
    <section className="relative overflow-hidden bg-[#0A192F] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-amber-500/20 shadow-md">
      {/* Subtle geometric background accents using IIITDMJ colors */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-radial from-blue-600/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Main Editorial Block (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Institute Identity Kicker */}
            <div className="flex items-center gap-2 text-xs font-medium text-amber-400 tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>PDPM IIITDM Jabalpur · Dumna Nature Park Road</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-300">Est. 2005</span>
            </div>

            {/* Headline with balanced wrapping */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight" style={{ textWrap: 'balance' }}>
              IIITDMJ Campus Bazaar
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
              The verified peer-to-peer marketplace built exclusively for students, faculty, and residents of PDPM Indian Institute of Information Technology, Design and Manufacturing Jabalpur.
            </p>

            {/* Campus Trust Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xs">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                  <UserCheck className="w-4 h-4" />
                  <span>@iiitdmj.ac.in Only</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  100% gated to campus corporate IDs. Zero random outsiders or spam.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xs">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                  <Truck className="w-4 h-4" />
                  <span>Hostel Handover</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Hall 1, Hall 3, Hall 4, Panini & Saraswati room delivery or canteen meetup.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xs">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                  <Star className="w-4 h-4" />
                  <span>Verified Reviews</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Reviews unlock strictly after campus delivery is received. Zero fake stars.
                </p>
              </div>
            </div>

            {/* Action CTA Row */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onBrowse}
                className="px-5 py-2.5 text-sm font-semibold text-[#0A192F] bg-[#F59E0B] hover:bg-[#d97706] rounded-lg transition-colors whitespace-nowrap shadow-sm flex items-center gap-2"
              >
                <span>Browse Campus Items</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onListProduct}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg transition-colors whitespace-nowrap"
              >
                List a Pre-Loved Item (Cycles, Books, Cooler)
              </button>
            </div>
          </div>

          {/* Side Institute Showcase Card (4 cols) */}
          <div className="lg:col-span-4 bg-gradient-to-b from-[#162A45] to-[#0D1D33] p-6 rounded-2xl border border-amber-500/20 shadow-lg text-slate-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <div className="text-xs font-mono text-amber-400 uppercase tracking-wider">
                  Campus Quick Stats
                </div>
                <div className="text-lg font-bold text-white mt-0.5">
                  Hostel Exchange Network
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-base">
                <Building className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Supported Hostels</span>
                <span className="font-semibold text-white">Hall 1, 3, 4, Panini, Saraswati</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Payment Modes</span>
                <span className="font-semibold text-amber-400">UPI on Handover / Cash</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Commission / Platform Fee</span>
                <span className="font-semibold text-emerald-400">₹0.00 (100% Free for Students)</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-400">Logged-in Student</span>
                <span className="font-mono text-white text-[11px] truncate max-w-[140px]">
                  {studentName || 'Guest Student'}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
