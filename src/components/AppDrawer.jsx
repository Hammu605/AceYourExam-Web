import React from 'react';
import { 
  X, 
  Target, 
  Bell, 
  Calendar, 
  Sparkles, 
  Moon, 
  Sun, 
  HelpCircle, 
  MessageSquare, 
  ExternalLink, 
  ShieldCheck, 
  FileText, 
  LogOut,
  ChevronRight,
  BookOpen
} from 'lucide-react';

export default function AppDrawer({ 
  isOpen, 
  onClose, 
  diamonds, 
  isDarkMode, 
  onToggleDarkMode, 
  onOpenDiamonds, 
  onOpenStudyTarget 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Drawer Panel */}
      <aside className="relative w-80 max-w-[85vw] bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col z-10 overflow-hidden text-slate-800 dark:text-slate-100">
        
        {/* Top User Card */}
        <div className="p-5 bg-gradient-to-br from-[#0F4739] to-[#16A34A] text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center font-black text-xl text-amber-300">
              AY
            </div>
            <button 
              onClick={onClose} 
              className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="font-extrabold text-base tracking-tight leading-tight">
            AceYourExam Student
          </h3>
          <p className="text-xs text-emerald-100/80 mb-3">@ace_student</p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 border border-white/20 text-xs font-bold text-amber-300">
            <span>💎</span> {diamonds} Diamonds Balance
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1 text-sm font-semibold">
          
          <button
            onClick={() => { onClose(); onOpenStudyTarget(); }}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200"
          >
            <div className="flex items-center gap-3">
              <Target className="w-4 h-4 text-[#16A34A]" />
              <span>Set Study Target</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => { onClose(); onOpenDiamonds(); }}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200"
          >
            <div className="flex items-center gap-3">
              <span className="text-base">💎</span>
              <span>Diamond Store & Packs</span>
            </div>
            <span className="text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full">TOP-UP</span>
          </button>

          <div className="my-2 border-t border-slate-100 dark:border-slate-800" />

          {/* Dark Mode Switch */}
          <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200">
            <div className="flex items-center gap-3">
              {isDarkMode ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              <span>Dark Theme</span>
            </div>
            <button
              onClick={onToggleDarkMode}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                isDarkMode ? 'bg-[#16A34A]' : 'bg-slate-300'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                isDarkMode ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          <div className="my-2 border-t border-slate-100 dark:border-slate-800" />

          {/* Legal and official links */}
          <a
            href="https://xsupreme.world"
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200"
          >
            <div className="flex items-center gap-3">
              <ExternalLink className="w-4 h-4 text-slate-400" />
              <span>Official Website (xsupreme.world)</span>
            </div>
          </a>

          <a
            href="https://xsupreme.world/#privacy-policy"
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <span>Privacy Policy</span>
            </div>
          </a>

          <a
            href="https://xsupreme.world/#terms"
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Terms of Service</span>
            </div>
          </a>

          <a
            href="https://xsupreme.world/#feedback"
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200"
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              <span>Share Feedback</span>
            </div>
          </a>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 text-center">
          AceYourExam v1.2.0 • Web App
        </div>

      </aside>
    </div>
  );
}
