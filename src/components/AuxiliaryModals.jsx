import React, { useEffect, useState } from 'react';
import { X, Bell, Target, Flame, Calendar, PlayCircle, FileText, ExternalLink, CheckCircle2 } from 'lucide-react';
import { db, collection, onSnapshot } from '../firebase';

export function NoticeBoardModal({ isOpen, onClose }) {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    const unsub = onSnapshot(
      collection(db, 'notice_board'),
      (snap) => {
        const list = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setNotices(list);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md max-h-[82vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-ace-green text-white">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <h3 className="font-extrabold text-base">Notice Board</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-white/20 hover:bg-white/30">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <p className="text-xs text-slate-400 text-center py-8">Loading notices...</p>
          ) : notices.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">All Caught Up!</p>
              <p className="text-xs text-slate-400 mt-1">New exam alerts & updates will appear here.</p>
            </div>
          ) : (
            notices.map((n) => (
              <div key={n.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                    {n.tag || n.category || 'Update'}
                  </span>
                  {n.date && <span className="text-[10px] text-slate-400">{n.date}</span>}
                </div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{n.title || 'Announcement'}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{n.message || n.body || n.description}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export function SetTargetModal({ isOpen, onClose, dailyTargetMinutes, todayStudySeconds, onSaveTarget }) {
  const [selected, setSelected] = useState(dailyTargetMinutes || 60);
  const options = [30, 45, 60, 90, 120, 180];
  const doneMin = Math.floor((todayStudySeconds || 0) / 60);
  const pct = Math.min(100, Math.round((doneMin / (selected || 60)) * 100));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="p-4 bg-gradient-to-r from-ace-green to-emerald-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            <h3 className="font-extrabold text-base">Daily Study Target</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-white/20">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-slate-700 dark:text-slate-200">Today's Progress</span>
              <span className="text-ace-green">{doneMin} / {selected} min ({pct}%)</span>
            </div>
            <div className="w-full h-2.5 bg-white dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-ace-green transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <div>
            <p className="text-xs font-extrabold text-slate-600 dark:text-slate-300 mb-2">Choose Daily Goal</p>
            <div className="grid grid-cols-3 gap-2">
              {options.map(min => (
                <button
                  key={min}
                  onClick={() => setSelected(min)}
                  className={`py-2.5 rounded-xl text-xs font-extrabold border-2 transition-all ${
                    selected === min
                      ? 'border-ace-green bg-ace-green-light text-ace-green'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {min >= 60 ? `${min / 60}h${min % 60 ? ` ${min % 60}m` : ''}` : `${min}m`}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              onSaveTarget(selected);
              onClose();
            }}
            className="w-full py-3 rounded-2xl bg-ace-green hover:bg-green-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-ace-green/25"
          >
            <CheckCircle2 className="w-4 h-4" /> Save Study Target
          </button>
        </div>
      </div>
    </div>
  );
}

export function StreakCalendarModal({ isOpen, onClose, streak = 0, streakProtectors = 0, dailyStudyMap = {} }) {
  if (!isOpen) return null;

  const days = [];
  for (let i = 20; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const sec = dailyStudyMap[key]?.seconds || 0;
    days.push({ key, dayNum: d.getDate(), label: d.toLocaleDateString('en', { weekday: 'narrow' }), active: sec > 0, minutes: Math.round(sec / 60) });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 fill-white" />
            <h3 className="font-extrabold text-base">Study Streak</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-white/20">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
            <div>
              <div className="text-3xl font-black text-amber-500">{streak} Days</div>
              <div className="text-xs font-bold text-slate-600 dark:text-slate-300">Current Active Streak</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-sky-600">{streakProtectors}</div>
              <div className="text-[11px] font-bold text-slate-500">Protectors</div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-600 dark:text-slate-300 mb-2">
              <Calendar className="w-4 h-4 text-amber-500" /> Last 21 Days Activity
            </div>
            <div className="grid grid-cols-7 gap-2">
              {days.map(d => (
                <div
                  key={d.key}
                  title={`${d.key}: ${d.minutes} min`}
                  className={`rounded-xl py-2 text-center border ${
                    d.active
                      ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="text-[9px] font-bold opacity-80">{d.label}</div>
                  <div className="text-xs font-black">{d.dayNum}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VideoSessionsModal({ isOpen, onClose }) {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    const unsub = onSnapshot(collection(db, 'video_sessions'), (snap) => {
      setVideos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});
    return () => unsub();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md max-h-[82vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="p-4 bg-ace-sky text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlayCircle className="w-5 h-5" />
            <h3 className="font-extrabold text-base">Video Sessions</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-white/20">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {videos.length === 0 ? (
            <div className="text-center py-8">
              <PlayCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No Live Video Sessions Right Now</p>
              <p className="text-xs text-slate-400 mt-1">Recorded & live strategy classes added by Admin will appear here.</p>
            </div>
          ) : (
            videos.map(v => (
              <a
                key={v.id}
                href={v.url || v.videoUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-ace-sky"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{v.title || 'Study Session'}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{v.subject || v.instructor || 'AceYourExam Faculty'}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-ace-sky shrink-0" />
                </div>
              </a>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export function PdfViewerModal({ pdfItem, onClose }) {
  if (!pdfItem) return null;
  const url = pdfItem.pdfUrl || pdfItem.url || pdfItem.fileUrl || '';
  const viewerUrl = url ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}` : '';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col pt-safe pb-safe">
      <div className="px-4 py-3 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-5 h-5 text-ace-green shrink-0" />
          <h3 className="text-sm font-extrabold truncate">{pdfItem.title || 'Study Notes PDF'}</h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-ace-green text-white text-xs font-bold flex items-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open
            </a>
          )}
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 bg-slate-900">
        {viewerUrl ? (
          <iframe src={viewerUrl} title={pdfItem.title || 'PDF'} className="w-full h-full border-0" />
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm">PDF URL not available.</div>
        )}
      </div>
    </div>
  );
}
