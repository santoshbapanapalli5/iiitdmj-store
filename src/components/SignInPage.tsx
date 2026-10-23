import React, { useState } from 'react';
import {
  Mail,
  User as UserIcon,
  Phone,
  Building2,
  Lock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Truck,
  Star,
  BookOpen,
  Code2,
} from 'lucide-react';
import { User, HostelName } from '../types';
import { HOSTELS_LIST, DEMO_USERS, parseIIITRollNumber } from '../data/mockData';
import { api } from '../services/api';

interface SignInPageProps {
  onAuthSuccess: (user: User) => void;
  onExploreAsGuest: () => void;
  onOpenArchitecture: () => void;
}

type AuthStep = 'email_entry' | 'login' | 'register';

export const SignInPage: React.FC<SignInPageProps> = ({
  onAuthSuccess,
  onExploreAsGuest,
  onOpenArchitecture,
}) => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<AuthStep>('email_entry');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [existingUser, setExistingUser] = useState<User | null>(null);

  // Registration fields
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('iiitdmj@2026');
  const [hostel, setHostel] = useState<HostelName>('Hall of Residence 3 (Hall 3)');
  const [roomNumber, setRoomNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [parsedInfo, setParsedInfo] = useState<{ rollNumber: string; batch: string; discipline: string } | null>(null);

  const handleEmailCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your official IIITDMJ student email.');
      return;
    }

    if (!cleanEmail.endsWith('@iiitdmj.ac.in')) {
      setErrorMessage('Strict Access Policy: Only official @iiitdmj.ac.in corporate emails are permitted to create accounts or sign in.');
      return;
    }

    setLoading(true);
    const res = await api.checkEmail(cleanEmail);
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Failed to verify email');
      return;
    }

    if (res.data?.isExisting && res.data.user) {
      // Existing student: switch to login
      setExistingUser(res.data.user);
      setStep('login');
    } else {
      // New student: automatically switch directly to Registration form
      const parsed = parseIIITRollNumber(cleanEmail);
      setParsedInfo(parsed);
      setFullName('');
      setStep('register');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingUser) return;

    setLoading(true);
    const res = await api.login(existingUser.email);
    setLoading(false);

    if (res.success && res.data) {
      onAuthSuccess(res.data);
    } else {
      setErrorMessage(res.error || 'Login failed.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please provide your full student name.');
      return;
    }

    if (!roomNumber.trim()) {
      setErrorMessage('Please enter your hostel room number (e.g. B-314).');
      return;
    }

    if (!phone.trim() || phone.trim().length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile contact number.');
      return;
    }

    const rollInfo = parsedInfo || parseIIITRollNumber(email) || {
      rollNumber: email.split('@')[0].toUpperCase(),
      batch: '2024',
      discipline: 'Engineering & Technology',
    };

    setLoading(true);
    const res = await api.registerStudent({
      name: fullName.trim(),
      email: email.toLowerCase().trim(),
      rollNumber: rollInfo.rollNumber,
      batch: rollInfo.batch,
      discipline: rollInfo.discipline,
      hostel,
      roomNumber: roomNumber.trim(),
      phone: phone.trim(),
    });
    setLoading(false);

    if (res.success && res.data) {
      onAuthSuccess(res.data);
    } else {
      setErrorMessage(res.error || 'Registration failed.');
    }
  };

  const handleSelectDemo = async (demoUser: User) => {
    setLoading(true);
    const res = await api.login(demoUser.email);
    setLoading(false);
    if (res.success && res.data) {
      onAuthSuccess(res.data);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100 font-sans relative overflow-x-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/10">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#0A192F] text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-sm sm:text-lg shadow-sm">
            IIIT
          </div>
          <div>
            <div className="text-sm sm:text-base font-bold tracking-tight text-white leading-tight">
              IIITDMJ Campus Bazaar
            </div>
            <div className="text-[10px] sm:text-[11px] text-amber-400 font-medium tracking-wide uppercase">
              PDPM IIITDM Jabalpur · Student Portal
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          <button
            onClick={onOpenArchitecture}
            className="text-slate-400 hover:text-white transition-colors text-[11px] sm:text-xs"
          >
            Specs & Schema
          </button>
          <span className="text-slate-600">·</span>
          <button
            onClick={onExploreAsGuest}
            className="text-amber-400 hover:text-amber-300 font-semibold transition-colors text-[11px] sm:text-xs whitespace-nowrap"
          >
            Explore as Guest →
          </button>
        </div>
      </header>

      {/* Main Content Split */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          
          {/* Left Hero Column: Campus Brand & Trust */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Gated @iiitdmj.ac.in Student Marketplace</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight" style={{ textWrap: 'balance' }}>
              PDPM IIIT Jabalpur Campus Bazaar
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Buy and sell pre-loved cycles, textbooks, air coolers, mattresses, and electronics directly with fellow students across Hall 1, Hall 3, Hall 4, Panini, and Saraswati Hostels.
            </p>

            <div className="space-y-2.5 sm:space-y-3 pt-1">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="text-white">Smart Identity Detection:</strong> Automatically routes existing accounts to sign in and new accounts to hostel registration.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="text-white">College Delivery Details:</strong> Orders specify hostel rooms and student handover time slots. Zero couriers or postal delays.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="text-white">Strict Delivered-Only Reviews:</strong> Ratings and reviews are strictly locked until delivery is confirmed by the buyer.
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Dedicated Authentication Box */}
          <div className="lg:col-span-6 flex justify-center w-full">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 text-slate-900 overflow-hidden">
              
              {/* Form Card Top */}
              <div className="bg-[#0A192F] px-4 sm:px-6 py-3.5 sm:py-4 border-b border-amber-500/20 text-white flex items-center justify-between">
                <div>
                  <div className="text-xs sm:text-sm font-bold tracking-tight">Student Single Sign-On</div>
                  <div className="text-[10px] sm:text-[11px] text-amber-300">Sign in to list items & manage orders</div>
                </div>
                <div className="w-7 h-7 rounded-lg bg-amber-400 text-[#0A192F] font-black text-xs flex items-center justify-center">
                  DMJ
                </div>
              </div>

              {/* Form Body */}
              <div className="p-4 sm:p-6">
                
                {errorMessage && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* STEP 1: Combined Email Entry & Auto-Detection */}
                {step === 'email_entry' && (
                  <div>
                    <div className="mb-4">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        Enter Your Institute Email
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        We will auto-detect whether your student profile is existing or guide you through sign-up.
                      </p>
                    </div>

                    <form onSubmit={handleEmailCheck} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Official Corporate Email (@iiitdmj.ac.in)
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="e.g. 22bcs045@iiitdmj.ac.in"
                            className="w-full pl-10 pr-4 py-2.5 sm:py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A192F] min-h-[44px]"
                            autoFocus
                            required
                          />
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Strictly restricted to @iiitdmj.ac.in domain</span>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 sm:py-2.5 text-sm font-semibold text-white bg-[#0A192F] hover:bg-[#162A45] rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
                      >
                        {loading ? (
                          <span>Checking Institute Database...</span>
                        ) : (
                          <>
                            <span>Continue with IIITDMJ Email</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>

                    {/* Quick Demo Student Switcher */}
                    <div className="mt-5 pt-4 border-t border-slate-100">
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Instant Demo Login (Presaved Students)
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {DEMO_USERS.map((demo) => (
                          <button
                            key={demo.id}
                            type="button"
                            onClick={() => handleSelectDemo(demo)}
                            className="p-2 sm:p-2.5 text-left border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 rounded-xl transition-all group min-h-[44px]"
                          >
                            <div className="text-xs font-semibold text-slate-900 group-hover:text-amber-900 truncate">
                              {demo.name}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono truncate">
                              {demo.rollNumber} · {demo.hostel.split(' ')[0]} {demo.hostel.includes('3') ? '3' : demo.hostel.includes('4') ? '4' : 'G'}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Existing User Login */}
                {step === 'login' && existingUser && (
                  <div>
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 mb-0.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Student Account Recognized</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">
                          Welcome Back, {existingUser.name}!
                        </h3>
                        <p className="text-xs text-slate-500 font-mono">
                          {existingUser.email} · {existingUser.rollNumber}
                        </p>
                      </div>
                      <button
                        onClick={() => setStep('email_entry')}
                        className="text-xs text-amber-700 hover:underline p-1"
                      >
                        Change
                      </button>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4 text-xs space-y-1 text-slate-700">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Hostel & Room:</span>
                        <span className="font-semibold text-slate-900">{existingUser.hostel} ({existingUser.roomNumber})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Discipline:</span>
                        <span className="font-semibold text-slate-900">{existingUser.discipline}</span>
                      </div>
                    </div>

                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Campus Portal Password / PIN
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A192F] min-h-[44px]"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 text-sm font-semibold text-white bg-[#0A192F] hover:bg-[#162A45] rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
                      >
                        {loading ? 'Signing In...' : 'Sign In to Campus Bazaar'}
                      </button>
                    </form>
                  </div>
                )}

                {/* STEP 3: New Student Registration */}
                {step === 'register' && (
                  <div>
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 mb-0.5">
                          <Sparkles className="w-4 h-4" />
                          <span>Auto-Switched to Sign-Up</span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900">
                          Complete Student Onboarding
                        </h3>
                        <p className="text-xs text-slate-500 font-mono">
                          {email}
                        </p>
                      </div>
                      <button
                        onClick={() => setStep('email_entry')}
                        className="text-xs text-slate-400 hover:text-slate-600 p-1"
                      >
                        Edit
                      </button>
                    </div>

                    {parsedInfo && (
                      <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-center justify-between flex-wrap gap-1">
                        <span>Roll: <strong>{parsedInfo.rollNumber}</strong></span>
                        <span>Batch: <strong>{parsedInfo.batch}</strong></span>
                        <span className="truncate max-w-[120px]">{parsedInfo.discipline}</span>
                      </div>
                    )}

                    <form onSubmit={handleRegisterSubmit} className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Aditi Sharma"
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A192F] min-h-[44px]"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Hostel
                          </label>
                          <select
                            value={hostel}
                            onChange={(e) => setHostel(e.target.value as HostelName)}
                            className="w-full px-2.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A192F] min-h-[44px]"
                          >
                            {HOSTELS_LIST.map((h) => (
                              <option key={h} value={h}>
                                {h}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Room Number
                          </label>
                          <input
                            type="text"
                            value={roomNumber}
                            onChange={(e) => setRoomNumber(e.target.value)}
                            placeholder="e.g. B-314"
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A192F] min-h-[44px]"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Contact Number
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-3 text-xs font-mono text-slate-400">+91</span>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            placeholder="9876543210"
                            className="w-full pl-11 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A192F] min-h-[44px]"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 text-sm font-semibold text-white bg-[#0A192F] hover:bg-[#162A45] rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 min-h-[44px]"
                      >
                        {loading ? 'Creating Student Profile...' : 'Complete Registration & Enter Bazaar'}
                      </button>
                    </form>
                  </div>
                )}

              </div>

              {/* Card Footer */}
              <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Not ready to sign in?</span>
                <button
                  onClick={onExploreAsGuest}
                  className="font-semibold text-amber-700 hover:text-amber-800 p-1"
                >
                  Explore as Guest →
                </button>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-t border-white/10 text-center text-xs text-slate-400">
        © 2026 PDPM IIITDM Jabalpur Student Body · Dumna Nature Park Road, Jabalpur, MP - 482005.
      </footer>

    </div>
  );
};
