import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Play, Pause, RotateCcw, X, Sparkles, Timer, Flame, CheckCircle2 } from 'lucide-react';
import { formatDuration } from '../utils';

export default function StudyFocusTimerModal({ isOpen, onClose, onRewardDiamonds }) {
  const INITIAL_SECONDS = 25 * 60; // 25 min Pomodoro
  const [secondsLeft, setSecondsLeft] = useState(INITIAL_SECONDS);
  const [isActive, setIsActive] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(() => {
    return parseInt(localStorage.getItem('study_sessions_completed') || '0', 10);
  });

  useEffect(() => {
    let interval = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false);
      try {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      } catch (_) {}
      const nextSessions = completedSessions + 1;
      setCompletedSessions(nextSessions);
      localStorage.setItem('study_sessions_completed', nextSessions.toString());
      onRewardDiamonds(25);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft, completedSessions, onRewardDiamonds]);

  if (!isOpen) return null;

  const pct = Math.round(((INITIAL_SECONDS - secondsLeft) / INITIAL_SECONDS) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center relative border border-slate-100 shadow-2xl overflow-hidden">
        
        {/* Background glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-3">
          <Timer className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-extrabold text-slate-900">
          Study Focus Timer
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Focus for 25 minutes and earn <strong className="text-amber-600 font-bold">💎 25 Diamonds</strong>!
        </p>

        {/* Big Circular Countdown Display */}
        <div className="relative w-44 h-44 mx-auto flex items-center justify-center mb-6">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="#f1f5f9"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="#f59e0b"
              strokeWidth="8"
              strokeDasharray="276.46"
              strokeDashoffset={276.46 - (276.46 * pct) / 100}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-3xl font-black text-slate-900 tracking-tight">
              {formatDuration(secondsLeft)}
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">
              {isActive ? 'In Focus Mode' : 'Ready'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <button
            onClick={() => setIsActive(prev => !prev)}
            className={`flex items-center justify-center gap-1.5 px-6 py-3 rounded-2xl text-sm font-extrabold shadow-md active:scale-95 transition-all cursor-pointer ${
              isActive 
                ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                : 'bg-brand-900 hover:bg-brand-800 text-white'
            }`}
          >
            {isActive ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
            <span>{isActive ? 'Pause' : 'Start Focus'}</span>
          </button>

          <button
            onClick={() => {
              setIsActive(false);
              setSecondsLeft(INITIAL_SECONDS);
            }}
            className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            title="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Reward Status */}
        <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-amber-900 font-bold">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>Completed Sessions:</span>
          </div>
          <span className="font-extrabold text-amber-950 text-sm">
            {completedSessions}
          </span>
        </div>

      </div>
    </div>
  );
}
