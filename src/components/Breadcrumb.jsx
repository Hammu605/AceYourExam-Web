import React from 'react';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';

export default function Breadcrumb({ folderStack, onNavigateBack, onJumpToLevel }) {
  if (!folderStack || folderStack.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 text-xs text-slate-500 no-scrollbar">
      {/* Back button */}
      <button 
        onClick={onNavigateBack}
        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-200/70 hover:bg-slate-300 text-slate-700 font-semibold transition-all mr-1 shrink-0 active:scale-95"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back</span>
      </button>

      {/* Home link */}
      <button
        onClick={() => onJumpToLevel(-1)}
        className="flex items-center gap-1 hover:text-brand-600 shrink-0 font-medium transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span>All Exams</span>
      </button>

      {/* Stack items */}
      {folderStack.map((folder, idx) => {
        const isLast = idx === folderStack.length - 1;
        return (
          <React.Fragment key={folder.id || folder.fullPath || idx}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <button
              onClick={() => onJumpToLevel(idx)}
              className={`shrink-0 truncate max-w-[160px] font-medium transition-colors ${
                isLast 
                  ? 'text-brand-700 font-bold bg-brand-50/80 px-2 py-0.5 rounded-md border border-brand-200/60' 
                  : 'hover:text-brand-600'
              }`}
            >
              {folder.title || folder.name || 'Folder'}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}
