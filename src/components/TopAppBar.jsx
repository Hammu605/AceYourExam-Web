import React from 'react';
import { Menu, Flame, Sparkles, Search, Bell } from 'lucide-react';

export default function TopAppBar({ 
  onMenuClick, 
  streakCount = 1, 
  diamonds = 100, 
  onDiamondsClick, 
  onSearchClick,
  isSearching = false
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between gap-3">
        
        {/* Left: Hamburger & Brand */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95"
            title="Open Drawer Menu"
          >
            <Menu className="w-5 h-5 stroke-[2.2px]" />
          </button>

          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.hash = ''}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0F4739] to-[#16A34A] flex items-center justify-center text-white font-black text-sm shadow-sm">
              A
            </div>
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#0F172A] dark:text-white font-sans">
              AceYourExam
            </span>
          </div>
        </div>

        {/* Right: Streak & Diamonds Badge */}
        <div className="flex items-center gap-2">
          
          {/* Streak Flame Pill */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 text-orange-600 dark:text-orange-400 font-extrabold text-xs shadow-xs">
            <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500 animate-pulse" />
            <span>{streakCount}</span>
          </div>

          {/* Diamonds Wallet Pill */}
          <button
            onClick={onDiamondsClick}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-50 to-amber-100/90 dark:from-amber-950/60 dark:to-amber-900/40 border border-amber-300 dark:border-amber-700/80 text-amber-900 dark:text-amber-300 font-black text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Diamond Store"
          >
            <span className="text-sm">💎</span>
            <span>{diamonds}</span>
          </button>

          {/* Search Toggle */}
          <button
            onClick={onSearchClick}
            className={`p-2 rounded-xl border transition-colors ${
              isSearching 
                ? 'bg-[#E8F5E9] dark:bg-emerald-950/60 text-[#0F4739] dark:text-emerald-400 border-emerald-300' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent'
            }`}
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
