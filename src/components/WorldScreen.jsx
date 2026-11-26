import React, { useEffect, useState, useMemo } from 'react';
import { Trophy, Flame, Clock, MessageCircle, X, Crown, Sparkles, Search } from 'lucide-react';
import { db, collection, onSnapshot } from '../firebase';
import { getDinoById } from '../services/userSync';

export default function WorldScreen({ currentUid, onStartDirectChat }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('ALL_TIME'); // ALL_TIME | STREAK | STUDY
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'users'),
      (snap) => {
        const list = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(u => !u.isBanned && !u.banned && (u.displayName || u.name));
        setUsers(list);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, []);

  const rankedUsers = useMemo(() => {
    const sorted = [...users].sort((a, b) => {
      if (filterTab === 'STREAK') return (b.streak || 0) - (a.streak || 0) || (b.xp || 0) - (a.xp || 0);
      if (filterTab === 'STUDY') return (b.totalStudySeconds || 0) - (a.totalStudySeconds || 0);
      return (b.xp || b.testsAttempted * 20 || 0) - (a.xp || a.testsAttempted * 20 || 0);
    });
    if (!searchQuery.trim()) return sorted;
    const q = searchQuery.toLowerCase();
    return sorted.filter(u =>
      (u.displayName || u.name || '').toLowerCase().includes(q) ||
      (u.handle || '').toLowerCase().includes(q)
    );
  }, [users, filterTab, searchQuery]);

  const top3 = rankedUsers.slice(0, 3);
  const rest = rankedUsers.slice(3, 50);

  const getMetricLabel = (u) => {
    if (filterTab === 'STREAK') return `${u.streak || 0}d streak`;
    if (filterTab === 'STUDY') return `${Math.round((u.totalStudySeconds || 0) / 60)}m`;
    return `${u.xp || (u.testsAttempted || 0) * 20} XP`;
  };

  return (
    <div className="min-h-screen bg-ace-bg dark:bg-slate-950 pb-28">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-emerald-600 via-ace-green to-teal-700 text-white px-4 pt-5 pb-6 rounded-b-[28px] shadow-lg">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="font-pixelTitle text-sm tracking-tight flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-300" /> WORLD RANKING
              </h1>
              <p className="text-xs text-emerald-100 mt-1">Live leaderboard synced with AceYourExam Android & iOS</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-white/15 text-[11px] font-extrabold">
              {users.length} Scholars
            </span>
          </div>

          <div className="flex gap-2 mt-3">
            {[
              { id: 'ALL_TIME', label: 'Top XP' },
              { id: 'STREAK', label: 'Streaks' },
              { id: 'STUDY', label: 'Study Time' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setFilterTab(t.id)}
                className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  filterTab === t.id
                    ? 'bg-white text-ace-green shadow'
                    : 'bg-white/15 text-white hover:bg-white/25'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scholar by name or @handle..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-ace-green"
          />
        </div>

        {loading ? (
          <div className="text-center py-12 text-xs font-bold text-slate-400">Loading live leaderboard...</div>
        ) : rankedUsers.length === 0 ? (
          <div className="text-center py-12 text-xs font-bold text-slate-400">No scholars found.</div>
        ) : (
          <>
            {/* 3D Podium for Top 3 */}
            {!searchQuery.trim() && top3.length >= 1 && (
              <div className="grid grid-cols-3 gap-2.5 items-end pt-3 pb-1">
                {[top3[1], top3[0], top3[2]].map((u, slotIdx) => {
                  if (!u) return <div key={slotIdx} />;
                  const rank = slotIdx === 1 ? 1 : slotIdx === 0 ? 2 : 3;
                  const dino = getDinoById(u.selectedDinoId || 1);
                  const podiumStyles =
                    rank === 1
                      ? 'bg-gradient-to-b from-amber-400 to-amber-500 text-white h-36 border-amber-300'
                      : rank === 2
                      ? 'bg-gradient-to-b from-sky-400 to-sky-600 text-white h-28 border-sky-300'
                      : 'bg-gradient-to-b from-orange-400 to-rose-500 text-white h-24 border-orange-300';

                  return (
                    <button
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className="bouncy-tap flex flex-col items-center text-center group"
                    >
                      <div className="relative mb-1.5">
                        {rank === 1 && <Crown className="w-5 h-5 text-amber-400 mx-auto mb-0.5 drop-shadow" />}
                        <div className={`w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 p-1.5 border-2 shadow-md ${rank === 1 ? 'border-amber-400 scale-110' : 'border-slate-200 dark:border-slate-700'}`}>
                          <img src={dino.img} alt={u.displayName || u.name} className="w-full h-full object-contain" />
                        </div>
                      </div>
                      <span className="text-[11px] font-extrabold text-slate-800 dark:text-white truncate w-full px-1">
                        {u.displayName || u.name}
                      </span>
                      <div className={`w-full mt-1 rounded-t-2xl border-t-2 flex flex-col items-center justify-center p-2 shadow-md ${podiumStyles}`}>
                        <span className="font-pixelTitle text-sm">#{rank}</span>
                        <span className="text-[10px] font-extrabold opacity-95 mt-0.5">{getMetricLabel(u)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Remaining Ranked List */}
            <div className="space-y-2">
              {(searchQuery.trim() ? rankedUsers : rest).map((u, idx) => {
                const actualRank = searchQuery.trim() ? idx + 1 : idx + 4;
                const dino = getDinoById(u.selectedDinoId || 1);
                const isMe = u.id === currentUid;
                return (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUser(u)}
                    className={`bouncy-tap w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                      isMe
                        ? 'bg-ace-green-light/70 dark:bg-emerald-950/40 border-ace-green'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-ace-green/50'
                    }`}
                  >
                    <span className="w-7 text-center text-xs font-black text-slate-400">#{actualRank}</span>
                    <img src={dino.img} alt="" className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 object-contain shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                          {u.displayName || u.name}
                        </span>
                        {isMe && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-ace-green text-white">YOU</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                        <span className="flex items-center gap-0.5"><Flame className="w-3 h-3 text-amber-500" /> {u.streak || 0}d</span>
                        <span className="flex items-center gap-0.5"><Clock className="w-3 h-3 text-sky-500" /> {Math.round((u.totalStudySeconds || 0) / 60)}m</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-ace-green">{getMetricLabel(u)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* User Profile Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="p-4 bg-gradient-to-r from-ace-green to-emerald-600 text-white flex justify-between items-start">
              <div className="flex items-center gap-3">
                <img
                  src={getDinoById(selectedUser.selectedDinoId || 1).img}
                  alt=""
                  className="w-14 h-14 rounded-2xl bg-white/20 p-1.5 object-contain"
                />
                <div>
                  <h3 className="font-extrabold text-base">{selectedUser.displayName || selectedUser.name}</h3>
                  <p className="text-xs text-emerald-100">{selectedUser.handle || `ID #${selectedUser.id}`}</p>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-1.5 rounded-full bg-white/20">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800">
                  <div className="text-base font-black text-amber-500">{selectedUser.streak || 0}d</div>
                  <div className="text-[10px] font-bold text-slate-400">Streak</div>
                </div>
                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800">
                  <div className="text-base font-black text-ace-green">{selectedUser.xp || 0}</div>
                  <div className="text-[10px] font-bold text-slate-400">XP</div>
                </div>
                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800">
                  <div className="text-base font-black text-sky-500">{selectedUser.testsAttempted || 0}</div>
                  <div className="text-[10px] font-bold text-slate-400">Tests</div>
                </div>
              </div>

              {selectedUser.id !== currentUid && onStartDirectChat && (
                <button
                  onClick={() => {
                    const target = selectedUser;
                    setSelectedUser(null);
                    onStartDirectChat(target);
                  }}
                  className="w-full py-3 rounded-2xl bg-ace-green hover:bg-green-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-ace-green/20"
                >
                  <MessageCircle className="w-4 h-4" /> Send Direct Message
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
