import React from 'react';
import { Folder, ChevronRight, Lock, Unlock, Sparkles, BookOpen } from 'lucide-react';

export default function FolderCard({ folder, onClick, testCount = 0 }) {
  const isLocked = folder.isLocked || folder.isPaid;
  const diamondPrice = folder.diamondPrice || folder.diamondsRequired || 0;
  const rupeePrice = folder.price || folder.priceInr || 0;

  return (
    <div
      onClick={onClick}
      className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-brand-500/50 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-50 to-brand-100/60 border border-brand-200/70 flex items-center justify-center text-brand-700 group-hover:scale-105 transition-transform">
          <Folder className="w-6 h-6 fill-brand-200/50 stroke-brand-700" />
        </div>

        {/* Lock or Free Badge */}
        {isLocked ? (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-[11px] font-bold">
            <Lock className="w-3 h-3 text-amber-600" />
            <span>
              {diamondPrice > 0 ? `💎 ${diamondPrice}` : rupeePrice > 0 ? `₹ ${rupeePrice}` : 'PAID'}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 text-[11px] font-bold">
            <Unlock className="w-3 h-3 text-emerald-600" />
            <span>FREE ACCESS</span>
          </div>
        )}
      </div>

      <div>
        <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-brand-600 transition-colors line-clamp-2">
          {folder.title || folder.name}
        </h3>
        {folder.sectionType && (
          <span className="inline-block text-[10px] uppercase font-bold text-slate-400 mt-1 tracking-wider">
            {folder.sectionType}
          </span>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="font-medium text-slate-600">
          {testCount > 0 ? `${testCount} Tests available` : 'Explore series'}
        </span>
        <div className="flex items-center text-brand-600 font-semibold group-hover:translate-x-1 transition-transform">
          <span>Open</span>
          <ChevronRight className="w-4 h-4 ml-0.5" />
        </div>
      </div>
    </div>
  );
}
