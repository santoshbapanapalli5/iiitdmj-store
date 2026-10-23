import React, { useState } from 'react';
import {
  ShoppingBag,
  Store,
  User as UserIcon,
  BookOpen,
  HelpCircle,
  Code2,
  ChevronDown,
  LogOut,
  Sparkles,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import { User } from '../types';
import { storage } from '../services/storage';

interface HeaderProps {
  currentUser: User | null;
  activeView: 'buyer' | 'seller';
  onViewChange: (view: 'buyer' | 'seller') => void;
  onOpenAuth: () => void;
  onOpenArchitecture: () => void;
  onOpenFaq: () => void;
  onSelectCategory: (cat: string) => void;
  onSwitchUser: (userId: string) => void;
  onLogout: () => void;
  cartCount: number;
  onOpenOrders: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeView,
  onViewChange,
  onOpenAuth,
  onOpenArchitecture,
  onOpenFaq,
  onSelectCategory,
  onSwitchUser,
  onLogout,
  onOpenOrders,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const allUsers = storage.getAllUsers();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar Contract: 3 zones separated by gap-8 */}
        <div className="flex items-center justify-between gap-8 h-18">
          
          {/* Zone 1: Brand wordmark in Display font */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onSelectCategory('All');
                onViewChange('buyer');
              }}
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#0A192F] text-[#F59E0B] flex items-center justify-center font-bold text-lg shadow-sm group-hover:scale-102 transition-transform">
                <span className="font-serif tracking-tighter">IIIT</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-[#0A192F] whitespace-nowrap leading-tight">
                  IIITDMJ Campus Bazaar
                </span>
                <span className="text-[11px] font-medium text-amber-700 tracking-wide uppercase">
                  PDPM IIIT Jabalpur · P2P
                </span>
              </div>
            </a>
          </div>

          {/* Zone 2: 4-5 Nav links (single line, no capsules) */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
            <button
              onClick={() => {
                onViewChange('buyer');
                onSelectCategory('All');
              }}
              className={`hover:text-[#0A192F] transition-colors whitespace-nowrap shrink-0 ${
                activeView === 'buyer' ? 'text-[#0A192F] font-semibold' : ''
              }`}
            >
              Browse Campus
            </button>
            <button
              onClick={() => {
                onViewChange('buyer');
                onSelectCategory('Bicycles');
              }}
              className="hover:text-[#0A192F] transition-colors whitespace-nowrap shrink-0"
            >
              Cycles & Gear
            </button>
            <button
              onClick={() => {
                onViewChange('buyer');
                onSelectCategory('Textbooks & Notes');
              }}
              className="hover:text-[#0A192F] transition-colors whitespace-nowrap shrink-0"
            >
              Textbooks & Notes
            </button>
            <button
              onClick={onOpenOrders}
              className="hover:text-[#0A192F] transition-colors whitespace-nowrap shrink-0"
            >
              My Hostel Orders
            </button>
            <button
              onClick={onOpenArchitecture}
              className="hover:text-amber-700 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 text-amber-800 font-semibold"
            >
              <Code2 className="w-4 h-4 text-amber-600" />
              <span>Tech Architecture & Schema</span>
            </button>
          </nav>

          {/* Zone 3: Primary action + Dual View switch + Profile */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Dual Buyer / Seller Switch */}
            <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
              <button
                onClick={() => onViewChange('buyer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap shrink-0 ${
                  activeView === 'buyer'
                    ? 'bg-[#0A192F] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to Buyer Marketplace"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Buyer View</span>
              </button>
              <button
                onClick={() => onViewChange('seller')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap shrink-0 ${
                  activeView === 'seller'
                    ? 'bg-[#F59E0B] text-[#0A192F] shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to Student Seller Dashboard"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Seller View</span>
              </button>
            </div>

            {/* User Profile / Switcher Dropdown */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white transition-colors"
                >
                  <div className="w-7 h-7 rounded-md bg-[#0A192F] text-amber-400 font-bold text-xs flex items-center justify-center">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-semibold text-slate-900 leading-tight">
                      {currentUser.name.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {currentUser.rollNumber}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="p-3 border-b border-slate-100 bg-slate-50/50 rounded-lg mb-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#0A192F]">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Verified IIITDMJ Student</span>
                      </div>
                      <div className="text-xs font-medium text-slate-800 mt-1">{currentUser.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{currentUser.email}</div>
                      <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span>{currentUser.hostel} · Room {currentUser.roomNumber}</span>
                      </div>
                    </div>

                    <div className="py-1">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-1">
                        Switch Student Account (Demo)
                      </div>
                      {allUsers.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            onSwitchUser(u.id);
                            setUserDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors flex items-center justify-between ${
                            u.id === currentUser.id
                              ? 'bg-amber-50 text-amber-900 font-medium'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="truncate">
                            {u.name} ({u.rollNumber})
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {u.hostel.split(' ')[0]} {u.hostel.includes('3') ? '3' : u.hostel.includes('4') ? '4' : u.hostel.includes('Girls') ? 'Girls' : 'Hostel'}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="border-t border-slate-100 pt-1 mt-1">
                      <button
                        onClick={() => {
                          onLogout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-md flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out of Campus Bazaar</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0A192F] rounded-lg hover:bg-[#162a45] transition-colors whitespace-nowrap shrink-0 shadow-xs"
              >
                Sign In with @iiitdmj.ac.in
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
