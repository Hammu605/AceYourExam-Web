import React from 'react';
import { Home, Hourglass, Trophy, MessageSquare, User } from 'lucide-react';

export const APP_TABS = {
  HOME: 'HOME',
  FOCUS: 'FOCUS',
  WORLD: 'WORLD',
  CHAT: 'CHAT',
  YOU: 'YOU',
};

const TABS_CONFIG = [
  { id: APP_TABS.HOME, label: 'Home', icon: Home },
  { id: APP_TABS.FOCUS, label: 'Focus', icon: Hourglass },
  { id: APP_TABS.WORLD, label: 'World', icon: Trophy },
  { id: APP_TABS.CHAT, label: 'Chat', icon: MessageSquare },
  { id: APP_TABS.YOU, label: 'You', icon: User },
];

export default function BottomNavBar({ activeTab, onTabSelect }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 shadow-[0_-4px_20px_rgba(15,71,57,0.08)]">
      <div className="max-w-md mx-auto px-3 py-1.5 flex items-center justify-around">
        {TABS_CONFIG.map((tab) => {
          const isSelected = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabSelect(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1.5 rounded-xl transition-all duration-200 cursor-pointer active:scale-95 ${
                isSelected 
                  ? 'text-[#0F4739] dark:text-emerald-400 font-extrabold' 
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 font-medium'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all duration-200 ${
                isSelected ? 'bg-[#E8F5E9] dark:bg-emerald-950/60 scale-110' : ''
              }`}>
                <Icon className={`w-5 h-5 ${isSelected ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              </div>
              <span className="text-[11px] tracking-tight mt-0.5">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
