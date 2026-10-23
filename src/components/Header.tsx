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
  Menu,
  X,
  Package,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const allUsers = storage.getAllUsers();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Top Bar Contract: 3 zones separated by gap */}
        <div className="flex items-center justify-between gap-2 sm:gap-6 h-16 sm:h-18">
          
          {/* Zone 1: Brand wordmark in Display font */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Mobile hamburger menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 -ml-1 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onSelectCategory('All');
                onViewChange('buyer');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 sm:gap-3 group"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#0A192F] text-[#F59E0B] flex items-center justify-center font-bold text-sm sm:text-lg shadow-sm group-hover:scale-102 transition-transform">
                <span className="font-serif tracking-tighter">IIIT</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm sm:text-base lg:text-lg font-bold tracking-tight text-[#0A192F] whitespace-nowrap leading-tight">
                  Campus Bazaar
                </span>
                <span className="text-[9px] sm:text-[11px] font-medium text-amber-700 tracking-wide uppercase truncate max-w-[120px] sm:max-w-none">
                  PDPM IIITDMJ · P2P
                </span>
              </div>
            </a>
          </div>

          {/* Zone 2: Desktop Navigation links (hidden on mobile) */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-7 text-sm font-medium text-slate-600">
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
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            
            {/* Dual Buyer / Seller Switch (Responsive) */}
            <div className="flex items-center p-0.5 sm:p-1 bg-slate-100 rounded-lg border border-slate-200">
              <button
                onClick={() => {
                  onViewChange('buyer');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap shrink-0 ${
                  activeView === 'buyer'
                    ? 'bg-[#0A192F] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to Buyer Marketplace"
              >
                <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden xs:inline sm:inline">Buyer</span>
              </button>
              <button
                onClick={() => {
                  onViewChange('seller');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap shrink-0 ${
                  activeView === 'seller'
                    ? 'bg-[#F59E0B] text-[#0A192F] shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to Student Seller Dashboard"
              >
                <Store className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden xs:inline sm:inline">Seller</span>
              </button>
            </div>

            {/* User Profile / Switcher Dropdown */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white transition-colors"
                  aria-label="User profile and account switcher"
                >
                  <div className="w-7 h-7 rounded-md bg-[#0A192F] text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="text-left hidden md:block">
                    <div className="text-xs font-semibold text-slate-900 leading-tight">
                      {currentUser.name.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {currentUser.rollNumber}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-24px)] bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="p-3 border-b border-slate-100 bg-slate-50/50 rounded-lg mb-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#0A192F]">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Verified IIITDMJ Student</span>
                      </div>
                      <div className="text-xs font-medium text-slate-800 mt-1 truncate">{currentUser.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono truncate">{currentUser.email}</div>
                      <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1 truncate">
                        <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{currentUser.hostel} · Room {currentUser.roomNumber}</span>
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
                          <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-1">
                            {u.hostel.split(' ')[0]} {u.hostel.includes('3') ? '3' : u.hostel.includes('4') ? '4' : 'G'}
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
                        className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-md flex items-center gap-2"
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
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold text-white bg-[#0A192F] rounded-lg hover:bg-[#162a45] transition-colors whitespace-nowrap shrink-0 shadow-xs"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu (Expandable for smaller viewports) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 animate-in slide-in-from-top-2 duration-150 shadow-md">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
            <button
              onClick={() => {
                onViewChange('buyer');
                onSelectCategory('All');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 ${
                activeView === 'buyer' ? 'bg-[#0A192F] text-white' : 'bg-slate-50 text-slate-700'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Buyer Catalog</span>
            </button>
            <button
              onClick={() => {
                onViewChange('seller');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 ${
                activeView === 'seller' ? 'bg-[#F59E0B] text-[#0A192F]' : 'bg-slate-50 text-slate-700'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Seller Dashboard</span>
            </button>
          </div>

          <div className="space-y-1 text-xs font-medium text-slate-700">
            <button
              onClick={() => {
                onViewChange('buyer');
                onSelectCategory('Bicycles');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg flex items-center justify-between"
            >
              <span>Cycles & Campus Gear</span>
              <span className="text-[10px] text-slate-400">Hall Delivery</span>
            </button>
            <button
              onClick={() => {
                onViewChange('buyer');
                onSelectCategory('Textbooks & Notes');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg flex items-center justify-between"
            >
              <span>Textbooks & Course Notes</span>
              <span className="text-[10px] text-slate-400">Academic</span>
            </button>
            <button
              onClick={() => {
                onOpenOrders();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg flex items-center justify-between"
            >
              <span>My Hostel Orders & Reviews</span>
              <Package className="w-3.5 h-3.5 text-amber-600" />
            </button>
            <button
              onClick={() => {
                onOpenArchitecture();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-amber-800 bg-amber-50/60 rounded-lg flex items-center justify-between font-semibold"
            >
              <span>Tech Architecture & Schema Spec</span>
              <Code2 className="w-3.5 h-3.5 text-amber-600" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
