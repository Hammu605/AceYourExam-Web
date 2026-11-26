import React, { useEffect, useState, useRef } from 'react';
import { Send, Users, MessageCircle, HeadphonesIcon, Reply, X, Search, ArrowLeft } from 'lucide-react';
import { db, collection, doc, setDoc, onSnapshot, query, where, Timestamp } from '../firebase';
import { getDinoById } from '../services/userSync';

const CHANNELS = [
  { key: 'general', label: 'General' },
  { key: 'ssc_banking', label: 'SSC & Banking' },
  { key: 'upsc_pcs', label: 'UPSC & PCS' },
  { key: 'doubts', label: 'Doubts' }
];

export default function ChatScreen({ currentUid, currentUserName, initialDirectTarget, onClearDirectTarget }) {
  const [mode, setMode] = useState(initialDirectTarget ? 'DIRECT' : 'COMMUNITY'); // COMMUNITY | DIRECT | SUPPORT
  const [channelKey, setChannelKey] = useState('general');
  const [communityMsgs, setCommunityMsgs] = useState([]);
  const [directUsers, setDirectUsers] = useState([]);
  const [activePeer, setActivePeer] = useState(initialDirectTarget || null);
  const [directMsgs, setDirectMsgs] = useState([]);
  const [supportMsgs, setSupportMsgs] = useState([
    {
      id: 'supp_welcome',
      senderName: 'Ace Support Desk',
      text: 'Welcome to AceYourExam Support! Ask anything about Mock Tests, Diamonds, Streaks, or Account Sync.',
      isFromSupport: true
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [userSearch, setUserSearch] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    if (initialDirectTarget) {
      setMode('DIRECT');
      setActivePeer(initialDirectTarget);
      onClearDirectTarget?.();
    }
  }, [initialDirectTarget, onClearDirectTarget]);

  // Live Community Chat listener
  useEffect(() => {
    if (mode !== 'COMMUNITY') return;
    const q = query(collection(db, 'community_chats'), where('channelKey', '==', channelKey));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const ta = a.timestamp?.toMillis ? a.timestamp.toMillis() : (a.timestampMs || 0);
          const tb = b.timestamp?.toMillis ? b.timestamp.toMillis() : (b.timestampMs || 0);
          return ta - tb;
        })
        .slice(-80);
      setCommunityMsgs(list);
    }, () => {});
    return () => unsub();
  }, [mode, channelKey]);

  // Users directory for Direct Chat
  useEffect(() => {
    if (mode !== 'DIRECT') return;
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      const list = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(u => u.id !== currentUid && !u.isBanned && (u.displayName || u.name));
      setDirectUsers(list);
    }, () => {});
    return () => unsub();
  }, [mode, currentUid]);

  // Live Direct Messages listener
  useEffect(() => {
    if (mode !== 'DIRECT' || !activePeer || !currentUid) return;
    const peerId = activePeer.id || activePeer.uid;
    const chatId = currentUid < peerId ? `${currentUid}_${peerId}` : `${peerId}_${currentUid}`;
    const unsub = onSnapshot(collection(db, 'direct_chats', chatId, 'messages'), (snap) => {
      const list = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.timestampMs || 0) - (b.timestampMs || 0));
      setDirectMsgs(list);
    }, () => {});
    return () => unsub();
  }, [mode, activePeer, currentUid]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [communityMsgs.length, directMsgs.length, supportMsgs.length]);

  const handleSend = async (e) => {
    e?.preventDefault();
    const text = inputText.trim();
    if (!text) return;
    setInputText('');

    if (mode === 'COMMUNITY') {
      const msgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const msgDoc = {
        id: msgId,
        senderId: currentUid || 'guest_web',
        senderName: currentUserName || 'Scholar',
        text,
        channelKey,
        timestamp: Timestamp.now(),
        timestampMs: Date.now(),
        replySender: replyTo?.senderName || null,
        replyText: replyTo?.text?.slice(0, 60) || null
      };
      setReplyTo(null);
      try {
        await setDoc(doc(db, 'community_chats', msgId), msgDoc);
      } catch (err) {
        console.warn('community send error:', err);
      }
    } else if (mode === 'DIRECT' && activePeer) {
      const peerId = activePeer.id || activePeer.uid;
      const senderId = currentUid || 'guest_web';
      const chatId = senderId < peerId ? `${senderId}_${peerId}` : `${peerId}_${senderId}`;
      const msgId = `dm_${Date.now()}`;
      const msgDoc = {
        id: msgId,
        senderId,
        senderName: currentUserName || 'Scholar',
        recipientId: peerId,
        text,
        timestamp: Timestamp.now(),
        timestampMs: Date.now(),
        replySender: replyTo?.senderName || null,
        replyText: replyTo?.text?.slice(0, 60) || null
      };
      setReplyTo(null);
      try {
        await setDoc(doc(db, 'direct_chats', chatId, 'messages', msgId), msgDoc);
      } catch (err) {
        console.warn('dm send error:', err);
      }
    } else if (mode === 'SUPPORT') {
      const userMsg = { id: `u_${Date.now()}`, senderName: currentUserName || 'You', text, isFromUser: true };
      const lower = text.toLowerCase();
      let reply = 'Thanks for reaching out! Check our FAQs page in the side menu or email support via AceYourExam.';
      if (lower.includes('diamond') || lower.includes('coin')) {
        reply = 'Diamonds sync automatically when you sign in with the same Google account on Android & iPhone. You can also earn free Diamonds in the Focus Timer!';
      } else if (lower.includes('streak')) {
        reply = 'Complete a Focus session or Mock Test daily to grow your streak! Streak Protectors automatically save your streak if you miss a day.';
      } else if (lower.includes('ios') || lower.includes('iphone') || lower.includes('apple')) {
        reply = 'On iPhone Safari, tap Share -> Add to Home Screen to install AceYourExam as a full-screen app!';
      }
      const botMsg = { id: `b_${Date.now() + 1}`, senderName: 'Ace Support Desk', text: reply, isFromSupport: true };
      setSupportMsgs(prev => [...prev, userMsg, botMsg]);
    }
  };

  const filteredPeers = directUsers.filter(u => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (u.displayName || u.name || '').toLowerCase().includes(q) || (u.handle || '').toLowerCase().includes(q);
  });

  const activeMessages = mode === 'COMMUNITY' ? communityMsgs : mode === 'DIRECT' ? directMsgs : supportMsgs;

  return (
    <div className="flex flex-col h-[calc(100vh-124px)] bg-ace-bg dark:bg-slate-950">
      {/* Top Mode Switcher */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 py-2.5">
        <div className="max-w-3xl mx-auto flex gap-2">
          {[
            { id: 'COMMUNITY', label: 'Community', icon: Users },
            { id: 'DIRECT', label: 'Direct', icon: MessageCircle },
            { id: 'SUPPORT', label: 'Support', icon: HeadphonesIcon }
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => { setMode(t.id); setReplyTo(null); }}
                className={`flex-1 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                  mode === t.id
                    ? 'bg-ace-green text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            );
          })}
        </div>

        {mode === 'COMMUNITY' && (
          <div className="max-w-3xl mx-auto flex gap-1.5 overflow-x-auto pt-2 no-scrollbar">
            {CHANNELS.map(ch => (
              <button
                key={ch.key}
                onClick={() => setChannelKey(ch.key)}
                className={`px-3 py-1 rounded-full text-[11px] font-extrabold whitespace-nowrap border ${
                  channelKey === ch.key
                    ? 'bg-ace-green-light border-ace-green text-ace-green'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
              >
                # {ch.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Direct Chat User Picker */}
      {mode === 'DIRECT' && !activePeer ? (
        <div className="flex-1 overflow-y-auto p-4 max-w-3xl w-full mx-auto space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Find a classmate to message..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-ace-green"
            />
          </div>
          {filteredPeers.slice(0, 30).map(u => {
            const dino = getDinoById(u.selectedDinoId || 1);
            return (
              <button
                key={u.id}
                onClick={() => setActivePeer(u)}
                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-ace-green text-left"
              >
                <img src={dino.img} alt="" className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 object-contain" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white truncate">{u.displayName || u.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{u.handle || `Scholar #${u.id}`}</div>
                </div>
                <MessageCircle className="w-4 h-4 text-ace-green" />
              </button>
            );
          })}
        </div>
      ) : (
        <>
          {/* Active Peer Header in DM */}
          {mode === 'DIRECT' && activePeer && (
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center gap-3">
              <button onClick={() => setActivePeer(null)} className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <img src={getDinoById(activePeer.selectedDinoId || 1).img} alt="" className="w-8 h-8 rounded-lg object-contain" />
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                {activePeer.displayName || activePeer.name}
              </div>
            </div>
          )}

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 max-w-3xl w-full mx-auto space-y-2.5">
            {activeMessages.length === 0 ? (
              <div className="text-center py-12 text-xs font-semibold text-slate-400">
                No messages yet. Say hello!
              </div>
            ) : (
              activeMessages.map(m => {
                const isMine = m.isFromUser || (currentUid && m.senderId === currentUid);
                return (
                  <div key={m.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 shadow-sm ${
                        isMine
                          ? 'bg-ace-green text-white rounded-br-sm'
                          : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-bl-sm'
                      }`}
                    >
                      {!isMine && (
                        <div className="text-[10px] font-extrabold text-ace-green mb-0.5">{m.senderName || 'Scholar'}</div>
                      )}
                      {m.replyText && (
                        <div className={`text-[10px] px-2 py-1 rounded-lg mb-1.5 border-l-2 ${isMine ? 'bg-white/15 border-white/60' : 'bg-slate-100 dark:bg-slate-800 border-ace-green'}`}>
                          <span className="font-bold">{m.replySender}:</span> {m.replyText}
                        </div>
                      )}
                      <p className="text-xs leading-relaxed whitespace-pre-wrap break-words">{m.text}</p>
                    </div>
                    {mode !== 'SUPPORT' && (
                      <button
                        onClick={() => setReplyTo(m)}
                        className="text-[10px] text-slate-400 hover:text-ace-green mt-0.5 px-1 flex items-center gap-1"
                      >
                        <Reply className="w-2.5 h-2.5" /> Reply
                      </button>
                    )}
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSend} className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-3">
            <div className="max-w-3xl mx-auto">
              {replyTo && (
                <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl mb-2 text-[11px]">
                  <span className="truncate text-slate-600 dark:text-slate-300">
                    Replying to <strong>{replyTo.senderName}</strong>: {replyTo.text}
                  </span>
                  <button type="button" onClick={() => setReplyTo(null)} className="ml-2 text-slate-400">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={mode === 'SUPPORT' ? 'Ask Ace Support Desk...' : 'Type a message...'}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ace-green"
                />
                <button
                  type="submit"
                  className="p-2.5 rounded-2xl bg-ace-green hover:bg-green-700 text-white shadow-md"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
