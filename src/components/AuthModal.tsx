import React, { useState, useEffect } from 'react';
import {
  X,
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
} from 'lucide-react';
import { User, HostelName } from '../types';
import { HOSTELS_LIST, DEMO_USERS, parseIIITRollNumber } from '../data/mockData';
import { api } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

type AuthStep = 'email_entry' | 'login' | 'register';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
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

  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleEmailCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your institute email address.');
      return;
    }

    if (!cleanEmail.endsWith('@iiitdmj.ac.in')) {
      setErrorMessage('Strict Access Policy: Only official @iiitdmj.ac.in corporate emails are permitted to access Campus Bazaar.');
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
      onClose();
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
      onClose();
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
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Modal Top Bar */}
        <div className="bg-[#0A192F] px-6 py-4 flex items-center justify-between text-white border-b border-amber-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-[#0A192F] font-black text-sm flex items-center justify-center">
              DMJ
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight">PDPM IIITDMJ Student Portal</div>
              <div className="text-[11px] text-amber-300">Single Sign-On & Verification</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: Combined Email Entry & Auto-Detection */}
          {step === 'email_entry' && (
            <div>
              <div className="mb-5">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  Welcome to Campus Bazaar
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your institute email. Our system will automatically detect if you are an existing student or guide you through instant onboarding.
                </p>
              </div>

              <form onSubmit={handleEmailCheck} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Official Corporate Email (@iiitdmj.ac.in)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. 22bcs045@iiitdmj.ac.in"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A192F] focus:border-transparent transition-all font-mono"
                      autoFocus
                      required
                    />
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Restricted exclusively to PDPM IIITDM Jabalpur students</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 text-sm font-semibold text-white bg-[#0A192F] hover:bg-[#162A45] rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span>Verifying Campus Credentials...</span>
                  ) : (
                    <>
                      <span>Continue with IIITDMJ Email</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Demo Student Switcher */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Instant Demo Login (Presaved Students)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {DEMO_USERS.map((demo) => (
                    <button
                      key={demo.id}
                      onClick={() => handleSelectDemo(demo)}
                      type="button"
                      className="p-2.5 text-left border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 rounded-xl transition-all group"
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
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 mb-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Account Detected in Database</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Welcome back, {existingUser.name}!
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {existingUser.email} · {existingUser.rollNumber}
                  </p>
                </div>
                <button
                  onClick={() => setStep('email_entry')}
                  className="text-xs text-amber-700 hover:underline"
                >
                  Change Email
                </button>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4 text-xs space-y-1 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Hostel & Room:</span>
                  <span className="font-semibold text-slate-900">{existingUser.hostel} (Room {existingUser.roomNumber})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Discipline:</span>
                  <span className="font-semibold text-slate-900">{existingUser.discipline}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Campus Status:</span>
                  <span className="font-semibold text-emerald-600">Active Verified Student</span>
                </div>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Campus Portal Password / PIN
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A192F] focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 text-sm font-semibold text-white bg-[#0A192F] hover:bg-[#162A45] rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Authenticating...' : 'Sign In to Campus Bazaar'}
                </button>
              </form>
            </div>
          )}

          {/* STEP 3: New Student Registration (Smartly Redirected) */}
          {step === 'register' && (
            <div>
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 mb-0.5">
                    <Sparkles className="w-4 h-4" />
                    <span>New Email Detected · Auto-Switched to Sign-Up</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Complete Your Student Profile
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {email}
                  </p>
                </div>
                <button
                  onClick={() => setStep('email_entry')}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Edit
                </button>
              </div>

              {parsedInfo && (
                <div className="mb-4 p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 flex items-center justify-between">
                  <span>Detected Roll: <strong>{parsedInfo.rollNumber}</strong></span>
                  <span>Batch: <strong>{parsedInfo.batch}</strong></span>
                  <span className="truncate max-w-[140px]">{parsedInfo.discipline}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name (As in Institute ERP)
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aditi Sharma"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A192F]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Hostel Residence
                    </label>
                    <select
                      value={hostel}
                      onChange={(e) => setHostel(e.target.value as HostelName)}
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A192F]"
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
                      placeholder="e.g. B-314 or P-205"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A192F]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Phone Number (For Hostel Handover)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-mono text-slate-400">+91</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="9876543210"
                      className="w-full pl-12 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A192F]"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-2.5 text-xs font-semibold text-white bg-[#0A192F] hover:bg-[#162A45] rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Creating Student Profile...' : 'Complete Registration & Enter Bazaar'}
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
