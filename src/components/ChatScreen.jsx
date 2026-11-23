import React, { useState } from 'react';
import { Send, MessageSquare, Users, Sparkles, BookOpen, Smile } from 'lucide-react';

const COMMUNITY_ROOMS = [
  { id: 'cgl_room', name: 'SSC CGL 2026 Discussion', members: 420, active: 85, icon: '🎯' },
  { id: 'upsc_room', name: 'UPSC Civil Services Doubt Clearing', members: 680, active: 114, icon: '🏛️' },
  { id: 'math_room', name: 'Quant & Reasoning Shortcuts', members: 310, active: 47, icon: '📐' },
  { id: 'gk_room', name: 'Daily Current Affairs & GK Quiz', members: 550, active: 92, icon: '📰' }
];

export default function ChatScreen() {
  const [activeRoom, setActiveRoom] = useState(COMMUNITY_ROOMS[0]);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Priya K.', text: 'Does anyone have the formula sheet for Trigonometry Height & Distance?', time: '10:14 AM', isUser: false },
    { id: 2, sender: 'Vikram S.', text: 'Check the Study Notes section in SSC CGL folder, formula PDF is uploaded there!', time: '10:18 AM', isUser: false },
    { id: 3, sender: 'Ace Bot 🤖', text: 'Tip: Attempt today\'s live Free Demo mock test to check your all-India percentile!', time: '10:25 AM', isBot: true }
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    const newMsg = {
      id: Date.now(),
      sender: 'You',
      text: inputMsg.trim(),
      time: 'Just now',
      isUser: true
    };
    setMessages(prev => [...prev, newMsg]);
    setInputMsg('');
  };

  return (
    <div className="pb-24 pt-4 px-4 sm:px-6 max-w-lg mx-auto space-y-4">
      
      {/* Room Selector */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {COMMUNITY_ROOMS.map(room => (
          <button
            key={room.id}
            onClick={() => setActiveRoom(room)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              activeRoom.id === room.id
                ? 'bg-[#0F4739] text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <span>{room.icon}</span>
            <span>{room.name.split(' ')[0]} Room</span>
          </button>
        ))}
      </div>

      {/* Active Room Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>{activeRoom.icon}</span>
            <span>{activeRoom.name}</span>
          </h3>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
            ● {activeRoom.active} Online Aspirants
          </span>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs h-96 flex flex-col justify-between">
        
        <div className="flex-1 overflow-y-auto space-y-3 p-1">
          {messages.map(m => (
            <div
              key={m.id}
              className={`flex flex-col ${m.isUser ? 'items-end' : 'items-start'}`}
            >
              <span className="text-[10px] text-slate-400 font-bold mb-0.5 px-1">{m.sender}</span>
              <div className={`p-3 rounded-2xl max-w-[85%] text-xs sm:text-sm font-medium ${
                m.isUser
                  ? 'bg-[#16A34A] text-white rounded-br-xs'
                  : m.isBot
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-900/40 rounded-bl-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-xs'
              }`}>
                {m.text}
              </div>
              <span className="text-[9px] text-slate-400 mt-0.5 px-1">{m.time}</span>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="Ask a doubt or share concept..."
            className="flex-1 bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white px-4 py-2.5 rounded-xl border border-transparent focus:border-[#16A34A] outline-none"
          />
          <button
            type="submit"
            className="p-2.5 rounded-xl bg-[#0F4739] hover:bg-[#16A34A] text-white transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

    </div>
  );
}
