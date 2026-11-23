import React, { useState } from 'react';
import { 
  User, 
  Sparkles, 
  Target, 
  Flame, 
  Clock, 
  Award, 
  Star, 
  ChevronRight, 
  Moon, 
  Sun, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  BookOpen
} from 'lucide-react';

const DINO_AVATARS = [
  { id: 1, name: 'Rex', icon: '🦖', color: 'bg-emerald-100 text-emerald-800' },
  { id: 2, name: 'Spiky', icon: '🦕', color: 'bg-blue-100 text-blue-800' },
  { id: 3, name: 'Stego', icon: '🐢', color: 'bg-amber-100 text-amber-800' },
  { id: 4, name: 'Falcon', icon: '🦅', color: 'bg-purple-100 text-purple-800' }
];

export default function YouScreen({ 
  diamonds = 100, 
  onOpenDiamonds, 
  streakCount = 1,
  unlockedCount = 0,
  bookmarkedCount = 0,
  onOpenBookmarks,
  isDarkMode,
  onToggleDarkMode
}) {
  const [selectedAvatar, setSelectedAvatar] = useState(DINO_AVATARS[0]);
  const [dailyTarget, setDailyTarget] = useState(60);

  return (
    <div className="pb-28 pt-4 px-4 sm:px-6 max-w-lg mx-auto space-y-5">
      
      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={`w-16 h-16 rounded-2xl ${selectedAvatar.color} text-3xl flex items-center justify-center shadow-inner`}>
              {selectedAvatar.icon}
            </div>
            <span className="absolute -bottom-1 -right-1 bg-[#16A34A] text-white p-0.5 rounded-full text-[10px]">
              ✓
            </span>
          </div>

          <div className="flex-1">
            <h3 className="font-black text-lg text-slate-900 dark:text-white leading-tight">
              AceYourExam Student
            </h3>
            <p className="text-xs text-slate-400">@ace_aspirant • Web Aspirant</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-900/40">
                <span>💎</span> {diamonds} Diamonds
              </span>
            </div>
          </div>
        </div>

        {/* Dino Avatar Pick Row */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Select Companion Avatar</span>
          <div className="flex gap-2">
            {DINO_AVATARS.map(avatar => (
              <button
                key={avatar.id}
                onClick={() => setSelectedAvatar(avatar)}
                className={`p-2 rounded-xl text-xl transition-all ${
                  selectedAvatar.id === avatar.id 
                    ? 'ring-2 ring-[#0F4739] scale-110 bg-slate-100 dark:bg-slate-800' 
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                {avatar.icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Performance & Study Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 mb-1 text-orange-600">
            <Flame className="w-4 h-4 fill-orange-500" />
            <span className="text-[11px] uppercase font-bold text-slate-400">Streak</span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">{streakCount} Days Active</div>
          <span className="text-[10px] text-slate-400">Daily study habit</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 mb-1 text-[#16A34A]">
            <Award className="w-4 h-4 text-[#16A34A]" />
            <span className="text-[11px] uppercase font-bold text-slate-400">Unlocked</span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">{unlockedCount} Series</div>
          <span className="text-[10px] text-slate-400">Full mock access</span>
        </div>
      </div>

      {/* Quick Access Menu List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-3 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-1">
        
        <button
          onClick={onOpenBookmarks}
          className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-[#F8FAFC] dark:hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
            <div className="text-left">
              <h5 className="font-bold text-sm text-slate-800 dark:text-white">Revision Notebook</h5>
              <p className="text-[11px] text-slate-400">{bookmarkedCount} Saved Questions</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={onOpenDiamonds}
          className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-[#F8FAFC] dark:hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#0F4739] dark:text-emerald-400 flex items-center justify-center font-bold">
              💎
            </div>
            <div className="text-left">
              <h5 className="font-bold text-sm text-slate-800 dark:text-white">Diamond Store</h5>
              <p className="text-[11px] text-slate-400">Top-up diamonds & unlock packs</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Theme toggle row */}
        <div className="flex items-center justify-between p-3 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
              {isDarkMode ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            </div>
            <div className="text-left">
              <h5 className="font-bold text-sm text-slate-800 dark:text-white">Dark Theme</h5>
              <p className="text-[11px] text-slate-400">Easy on the eyes at night</p>
            </div>
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

      </div>

    </div>
  );
}
