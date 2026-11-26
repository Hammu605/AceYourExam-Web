import React from 'react';
import {
  Flame,
  Award,
  Star,
  ChevronRight,
  Moon,
  Sun,
  LogIn,
  LogOut,
  FileCheck2,
  Target,
  Calendar,
  Lock
} from 'lucide-react';
import { DINO_CHARACTERS, getDinoById } from '../services/userSync';

export default function YouScreen({
  userProfile,
  isGuest = true,
  diamonds = 100,
  onOpenDiamonds,
  streakCount = 0,
  unlockedCount = 0,
  bookmarkedCount = 0,
  attemptedCount = 0,
  selectedDinoId = 1,
  unlockedDinos = [1],
  onSelectOrBuyDino,
  onOpenBookmarks,
  onOpenAttemptedTests,
  onOpenSetTarget,
  onOpenStreakCalendar,
  onSignIn,
  onSignOut,
  isDarkMode,
  onToggleDarkMode
}) {
  const currentDino = getDinoById(selectedDinoId);
  const displayName = userProfile?.displayName || userProfile?.name || (isGuest ? 'Guest Aspirant' : 'AceYourExam Student');
  const handleText = userProfile?.handle || (userProfile?.email ? userProfile.email : 'Sign in to sync Android & iPhone');

  return (
    <div className="pb-28 pt-4 px-4 sm:px-6 max-w-lg mx-auto space-y-5">
      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border-2 border-ace-green/30 p-1.5 flex items-center justify-center shadow-inner">
              <img src={currentDino.img} alt={currentDino.name} className="w-full h-full object-contain" />
            </div>
            <span className="absolute -bottom-1 -right-1 bg-[#16A34A] text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold border-2 border-white dark:border-slate-900">
              ✓
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-black text-lg text-slate-900 dark:text-white leading-tight truncate">
              {displayName}
            </h3>
            <p className="text-xs text-slate-400 truncate">{handleText}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-900/40">
                <span>💎</span> {diamonds} Diamonds
              </span>
              {userProfile?.uid && (
                <span className="text-[10px] font-extrabold text-ace-green bg-ace-green-light px-2 py-0.5 rounded-full">
                  ID #{userProfile.uid}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Dino Mascot Shop & Selector */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-extrabold text-slate-400">Dino Companions</span>
            <span className="text-[10px] font-bold text-ace-green">{currentDino.name} Equipped</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {DINO_CHARACTERS.map(dino => {
              const isUnlocked = unlockedDinos.includes(dino.id) || dino.id === 1;
              const isSelected = Number(selectedDinoId) === dino.id;
              return (
                <button
                  key={dino.id}
                  onClick={() => onSelectOrBuyDino?.(dino)}
                  className={`bouncy-tap relative p-2 rounded-2xl border-2 flex flex-col items-center transition-all ${
                    isSelected
                      ? 'border-ace-green bg-ace-green-light/50 dark:bg-emerald-950/40'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50'
                  }`}
                >
                  <img src={dino.img} alt={dino.name} className={`w-10 h-10 object-contain ${!isUnlocked ? 'opacity-60 grayscale-[30%]' : ''}`} />
                  <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-200 mt-1 truncate w-full text-center">
                    {dino.name}
                  </span>
                  {!isUnlocked && (
                    <span className="mt-0.5 inline-flex items-center gap-0.5 text-[9px] font-black text-amber-600">
                      <Lock className="w-2.5 h-2.5" /> 💎{dino.diamondPrice}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onOpenStreakCalendar}
          className="bouncy-tap bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-sm text-left hover:border-amber-400"
        >
          <div className="flex items-center gap-2 mb-1 text-orange-600">
            <Flame className="w-4 h-4 fill-orange-500" />
            <span className="text-[11px] uppercase font-bold text-slate-400">Streak</span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">{streakCount} Days</div>
          <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1 mt-0.5">
            <Calendar className="w-3 h-3" /> View Calendar
          </span>
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-1 text-[#16A34A]">
            <Award className="w-4 h-4 text-[#16A34A]" />
            <span className="text-[11px] uppercase font-bold text-slate-400">Unlocked</span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">{unlockedCount} Series</div>
          <span className="text-[10px] text-slate-400">Full mock access</span>
        </div>
      </div>

      {/* Quick Access Menu List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-3 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-1">
        <button
          onClick={onOpenAttemptedTests}
          className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-[#F8FAFC] dark:hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-ace-sky flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h5 className="font-bold text-sm text-slate-800 dark:text-white">Attempted Tests</h5>
              <p className="text-[11px] text-slate-400">{attemptedCount} Completed Mocks & Solutions</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={onOpenSetTarget}
          className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-[#F8FAFC] dark:hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-ace-green flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h5 className="font-bold text-sm text-slate-800 dark:text-white">Daily Study Target</h5>
              <p className="text-[11px] text-slate-400">Goal: {userProfile?.dailyTargetMinutes || 60} min / day</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

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
              <p className="text-[11px] text-slate-400">Syncs with Android & Focus Timer</p>
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

        {/* Account Sign In / Sign Out */}
        {isGuest ? (
          <button
            onClick={onSignIn}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-ace-green/10 hover:bg-ace-green/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-ace-green text-white flex items-center justify-center">
                <LogIn className="w-4 h-4" />
              </div>
              <div className="text-left">
                <h5 className="font-extrabold text-sm text-ace-green">Sign In with Google</h5>
                <p className="text-[11px] text-slate-500">Sync Android & iPhone progress</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-ace-green" />
          </button>
        ) : (
          <button
            onClick={onSignOut}
            className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-500 flex items-center justify-center">
                <LogOut className="w-4 h-4" />
              </div>
              <div className="text-left">
                <h5 className="font-bold text-sm text-red-600 dark:text-red-400">Sign Out</h5>
                <p className="text-[11px] text-slate-400">{userProfile?.email}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-red-400" />
          </button>
        )}
      </div>
    </div>
  );
}
