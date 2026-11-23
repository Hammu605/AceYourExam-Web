import React, { useState } from 'react';
import { Trophy, Medal, Award, Flame, Star, Sparkles } from 'lucide-react';

const TOP_THREE = [
  {
    rank: 1,
    name: 'Aarav Sharma',
    handle: '@aarav_ias',
    accuracy: '99%',
    hours: '19h 45m',
    points: 4850,
    avatarBg: 'bg-amber-500',
    initial: 'A'
  },
  {
    rank: 2,
    name: 'Bhavya Patel',
    handle: '@bhavya_ssc',
    accuracy: '98%',
    hours: '18h 10m',
    points: 4620,
    avatarBg: 'bg-sky-500',
    initial: 'B'
  },
  {
    rank: 3,
    name: 'Chirag Verma',
    handle: '@chirag_rrb',
    accuracy: '96%',
    hours: '16h 30m',
    points: 4390,
    avatarBg: 'bg-orange-600',
    initial: 'C'
  }
];

const LEADERBOARD_LIST = [
  { rank: 4, name: 'Divya Rajput', handle: '@divya_upsc', accuracy: '95%', hours: '15h 20m', score: 4180 },
  { rank: 5, name: 'Eklavya Singh', handle: '@eklavya_cgl', accuracy: '94%', hours: '14h 50m', score: 3950 },
  { rank: 6, name: 'Farhan Khan', handle: '@farhan_bank', accuracy: '93%', hours: '13h 40m', score: 3820 },
  { rank: 7, name: 'Garima Mehta', handle: '@garima_tet', accuracy: '92%', hours: '12h 15m', score: 3690 },
  { rank: 8, name: 'Harman Preet', handle: '@harman_ace', accuracy: '91%', hours: '11h 30m', score: 3510 },
  { rank: 9, name: 'Ishaan Gupta', handle: '@ishaan_nda', accuracy: '90%', hours: '10h 45m', score: 3380 },
  { rank: 10, name: 'Jasleen Kaur', handle: '@jasleen_law', accuracy: '89%', hours: '9h 55m', score: 3200 }
];

export default function WorldScreen() {
  const [timeFilter, setTimeFilter] = useState('WEEKLY'); // 'TODAY' | 'WEEKLY' | 'ALL_TIME'

  return (
    <div className="pb-28 pt-4 px-4 sm:px-6 max-w-lg mx-auto space-y-6">
      
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
          <Trophy className="w-6 h-6 text-amber-500 fill-amber-400" />
          <span>Global Leaderboard</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Top rankers across all mock test series & study streak</p>
      </div>

      {/* Filter Switcher */}
      <div className="bg-[#F8FAFC] dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-center gap-1">
        {[
          { id: 'TODAY', label: 'Today' },
          { id: 'WEEKLY', label: 'This Week' },
          { id: 'ALL_TIME', label: 'All Time' }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setTimeFilter(f.id)}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
              timeFilter === f.id 
                ? 'bg-[#0F4739] text-white shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 3D PODIUM GRAPH (Matching Android WorldScreen.kt) */}
      <div className="bg-gradient-to-b from-[#E8F5E9]/60 to-white dark:from-slate-800 dark:to-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div className="flex items-end justify-center gap-2 sm:gap-4 pt-10 pb-2">
          
          {/* #2 Rank: Left Sky Blue Pillar */}
          <div className="flex flex-col items-center flex-1 max-w-[100px]">
            <div className="relative mb-2">
              <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white font-black text-lg flex items-center justify-center shadow-md">
                {TOP_THREE[1].initial}
              </div>
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-sky-100 text-sky-800 text-[10px] font-black rounded-full flex items-center justify-center border border-sky-300">
                2
              </span>
            </div>
            <span className="text-[11px] font-extrabold text-slate-800 dark:text-white truncate max-w-full">
              {TOP_THREE[1].name.split(' ')[0]}
            </span>
            <span className="text-[9px] font-bold text-sky-600 dark:text-sky-400">
              {TOP_THREE[1].accuracy}
            </span>

            {/* Pillar */}
            <div className="w-full h-24 bg-gradient-to-t from-sky-600 to-sky-400 rounded-t-2xl shadow-md mt-2 flex flex-col items-center justify-center text-white">
              <span className="font-black text-xl">#2</span>
              <span className="text-[9px] font-bold opacity-90">{TOP_THREE[1].points} pts</span>
            </div>
          </div>

          {/* #1 Rank: Center Tallest Gold Pillar */}
          <div className="flex flex-col items-center flex-1 max-w-[110px] -mt-6">
            <Trophy className="w-8 h-8 text-amber-500 fill-amber-400 animate-bounce mb-1" />
            <div className="relative mb-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white font-black text-xl flex items-center justify-center shadow-lg ring-4 ring-amber-300/40">
                {TOP_THREE[0].initial}
              </div>
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 text-white text-xs font-black rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                👑
              </span>
            </div>
            <span className="text-xs font-black text-slate-900 dark:text-white truncate max-w-full">
              {TOP_THREE[0].name.split(' ')[0]}
            </span>
            <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400">
              {TOP_THREE[0].accuracy} • {TOP_THREE[0].hours}
            </span>

            {/* Pillar */}
            <div className="w-full h-36 bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-2xl shadow-lg mt-2 flex flex-col items-center justify-center text-white">
              <span className="font-black text-2xl">#1</span>
              <span className="text-[10px] font-extrabold opacity-90">{TOP_THREE[0].points} pts</span>
            </div>
          </div>

          {/* #3 Rank: Right Bronze Pillar */}
          <div className="flex flex-col items-center flex-1 max-w-[100px]">
            <div className="relative mb-2">
              <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                {TOP_THREE[2].initial}
              </div>
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-orange-100 text-orange-900 text-[10px] font-black rounded-full flex items-center justify-center border border-orange-300">
                3
              </span>
            </div>
            <span className="text-[11px] font-extrabold text-slate-800 dark:text-white truncate max-w-full">
              {TOP_THREE[2].name.split(' ')[0]}
            </span>
            <span className="text-[9px] font-bold text-orange-600 dark:text-orange-400">
              {TOP_THREE[2].accuracy}
            </span>

            {/* Pillar */}
            <div className="w-full h-20 bg-gradient-to-t from-orange-700 to-orange-500 rounded-t-2xl shadow-md mt-2 flex flex-col items-center justify-center text-white">
              <span className="font-black text-xl">#3</span>
              <span className="text-[9px] font-bold opacity-90">{TOP_THREE[2].points} pts</span>
            </div>
          </div>

        </div>
      </div>

      {/* Leaderboard Table List (Ranks 4+) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 px-1">Top Achievers</h4>
        {LEADERBOARD_LIST.map((user) => (
          <div
            key={user.rank}
            className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800/60 hover:bg-[#E8F5E9]/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 text-center font-black text-xs text-slate-400">
                #{user.rank}
              </span>
              <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center text-xs">
                {user.name.charAt(0)}
              </div>
              <div>
                <h5 className="font-extrabold text-xs text-slate-900 dark:text-white">{user.name}</h5>
                <span className="text-[10px] text-slate-400">{user.handle}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="font-black text-xs text-emerald-700 dark:text-emerald-400 block">{user.score} pts</span>
              <span className="text-[10px] text-slate-400">{user.accuracy} accuracy</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
