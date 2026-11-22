import React from 'react';
import { Sparkles, Globe, Search, BookOpen, User, ShieldCheck } from 'lucide-react';

export default function Header({ 
  diamonds, 
  onOpenDiamonds, 
  searchQuery, 
  onSearchChange, 
  selectedLang, 
  onToggleLang,
  userProfile,
  onOpenProfile
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5 min-w-max cursor-pointer" onClick={() => window.location.hash = ''}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-900 to-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-900/20">
            <BookOpen className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 font-sans">AceYourExam</span>
              <span className="bg-emerald-500/10 text-emerald-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-500/20">WEB</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">Premier Mock Test Series & Prep</p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md mx-2 hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search tests, exams, subjects, papers..."
              className="w-full pl-9 pr-4 py-2 bg-slate-100/80 focus:bg-white text-xs sm:text-sm text-slate-900 placeholder-slate-400 rounded-xl border border-transparent focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 rounded-full w-4 h-4 flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right Action Icons: Diamonds & Language */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Diamonds Balance Pill */}
          <button
            onClick={onOpenDiamonds}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-amber-100/70 border border-amber-300/80 rounded-xl hover:shadow-xs transition-all cursor-pointer group active:scale-95"
            title="Available Diamonds"
          >
            <span className="text-base animate-pulse">💎</span>
            <div className="text-left">
              <span className="text-xs sm:text-sm font-bold text-amber-900 leading-none block">{diamonds}</span>
              <span className="text-[9px] text-amber-700/80 uppercase font-semibold hidden sm:inline">Balance</span>
            </div>
          </button>

          {/* Language Toggle: EN / HI */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-all active:scale-95"
            title="Toggle Language"
          >
            <Globe className="w-3.5 h-3.5 text-brand-600" />
            <span>{selectedLang === 'Hindi' ? 'हिंदी' : 'EN'}</span>
          </button>

          {/* Student Profile */}
          <button
            onClick={onOpenProfile}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-brand-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-brand-600 transition-all active:scale-95"
            title="Student Profile"
          >
            <User className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Mobile Search Bar Row */}
      <div className="px-4 pb-2.5 md:hidden">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search exams, mock tests..."
            className="w-full pl-8 pr-4 py-1.5 bg-slate-100 text-xs text-slate-900 rounded-lg border border-transparent focus:border-brand-500 outline-none"
          />
        </div>
      </div>
    </header>
  );
}
