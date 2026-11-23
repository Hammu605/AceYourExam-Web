import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Flame, 
  Sparkles, 
  Coffee, 
  Target, 
  Volume2, 
  VolumeX,
  Award,
  Clock
} from 'lucide-react';
import { formatDuration } from '../utils';

export default function FocusScreen({ 
  diamonds = 100, 
  onRewardDiamonds, 
  studyStreak = 1 
}) {
  const [targetMinutes, setTargetMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [todayStudyMinutes, setTodayStudyMinutes] = useState(() => {
    return parseInt(localStorage.getItem('today_study_mins') || '15', 10);
  });
  const [dailyGoalMinutes] = useState(60);

  // Tick timer
  useEffect(() => {
    let interval = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsActive(false);
            try { confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } }); } catch (_) {}
            const minsDone = targetMinutes;
            const updated = todayStudyMinutes + minsDone;
            setTodayStudyMinutes(updated);
            localStorage.setItem('today_study_mins', updated.toString());
            onRewardDiamonds(25);
            alert(`🎉 Congratulations! You completed ${minsDone} minutes of focused study and earned +25 💎 Diamonds!`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft, targetMinutes, todayStudyMinutes, onRewardDiamonds]);

  const handleSelectMinutes = (mins) => {
    setIsActive(false);
    setTargetMinutes(mins);
    setSecondsLeft(mins * 60);
  };

  const dialProgress = ((targetMinutes * 60 - secondsLeft) / (targetMinutes * 60)) * 100;

  return (
    <div className="pb-24 pt-4 px-4 sm:px-6 max-w-lg mx-auto space-y-6 text-center">
      
      {/* Top Focus Header Pill */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8F5E9] dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-[#0F4739] dark:text-emerald-300 text-xs font-black">
        <span>🦖 Rex</span>
        <span className="text-slate-400">•</span>
        <span>Focus Room & Diamond Mining</span>
      </div>

      {/* Daily Goal Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center font-bold">
            <Flame className="w-5 h-5 fill-orange-500 text-orange-500" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Today's Progress</span>
            <div className="font-black text-sm text-slate-800 dark:text-white">
              {todayStudyMinutes}m / {dailyGoalMinutes}m Target
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">+25 💎 / session</span>
          <span className="text-xs font-extrabold text-amber-600">Active Miner</span>
        </div>
      </div>

      {/* The Real Focus Dial Clock */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-xs relative overflow-hidden">
        
        {/* Minute Selector Pills */}
        <div className="flex justify-center gap-1.5 mb-6 overflow-x-auto no-scrollbar">
          {[10, 15, 20, 25, 30, 45, 60].map(mins => (
            <button
              key={mins}
              onClick={() => handleSelectMinutes(mins)}
              className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all ${
                targetMinutes === mins 
                  ? 'bg-[#0F4739] text-white shadow-xs' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {mins}m
            </button>
          ))}
        </div>

        {/* Big Circular Dial Visual */}
        <div className="relative w-56 h-56 mx-auto flex items-center justify-center mb-6">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Clock background ring */}
            <circle
              cx="50"
              cy="50"
              r="42"
              stroke="#F1F5F9"
              strokeWidth="7"
              fill="transparent"
              className="dark:stroke-slate-800"
            />
            {/* Active swept progress */}
            <circle
              cx="50"
              cy="50"
              r="42"
              stroke="#16A34A"
              strokeWidth="7"
              strokeDasharray="263.89"
              strokeDashoffset={263.89 - (263.89 * dialProgress) / 100}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Clock Numerals 0, 15, 30, 45 */}
          <span className="absolute top-3 text-[10px] font-black text-slate-400">0</span>
          <span className="absolute right-3 text-[10px] font-black text-slate-400">15</span>
          <span className="absolute bottom-3 text-[10px] font-black text-slate-400">30</span>
          <span className="absolute left-3 text-[10px] font-black text-slate-400">45</span>

          {/* Center Digital Time Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatDuration(secondsLeft)}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mt-1">
              {isActive ? 'FOCUSED STUDYING' : 'READY TO MINE'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setIsActive(prev => !prev)}
            className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-black text-white shadow-md active:scale-95 transition-all cursor-pointer ${
              isActive 
                ? 'bg-amber-600 hover:bg-amber-700' 
                : 'bg-gradient-to-r from-[#0F4739] to-[#16A34A] hover:from-[#0D3A2F] hover:to-[#15803D]'
            }`}
          >
            {isActive ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
            <span>{isActive ? 'Take a Break' : 'Start Focus Session'}</span>
          </button>

          <button
            onClick={() => handleSelectMinutes(targetMinutes)}
            className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="Reset Session"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Motivational Info Box */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-300 text-left">
        <span className="font-bold block mb-1">💡 Daily Study Habit Tip:</span>
        Consistent 25-minute Pomodoro study bursts with 5-minute breaks boost exam retention by up to 40% and earn diamonds to unlock premium test series!
      </div>

    </div>
  );
}
