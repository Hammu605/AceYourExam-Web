import React, { useState } from 'react';
import { Play, Clock, HelpCircle, Award, Lock, Sparkles, Share2, Check } from 'lucide-react';

export default function TestCard({ test, isUnlocked, onStartTest, onUnlock }) {
  const [copied, setCopied] = useState(false);

  const isDemo = test.isDemo || test.isFreeDemo;
  const isPaid = (test.isLocked || test.isPaid) && !isDemo && !isUnlocked;
  const diamondPrice = test.diamondPrice || test.diamondsRequired || 0;
  const rupeePrice = test.price || test.priceInr || 0;

  const durationMins = test.timeLimitMinutes || Math.floor((test.durationSeconds || 3600) / 60) || 60;
  const qCount = test.totalQuestionsCount || (Array.isArray(test.questions) ? test.questions.length : 100);
  const totalMarks = test.totalMarks || (qCount * (test.positiveMarks || 1.0));

  const handleShare = (e) => {
    e.stopPropagation();
    const url = new URL(window.location.href);
    url.searchParams.set('testId', test.id || test.documentId);
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-brand-500/50 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {isDemo && (
              <span className="bg-emerald-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                FREE DEMO
              </span>
            )}
            {isUnlocked && !isDemo && (
              <span className="bg-sky-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                UNLOCKED
              </span>
            )}
            <span className="bg-slate-100 text-slate-700 text-[11px] font-bold px-2 py-0.5 rounded-md">
              {test.testType || 'Mock Test'}
            </span>
          </div>

          {/* Share Test Button */}
          <button
            onClick={handleShare}
            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
            title="Copy test direct link to share"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Title */}
        <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug mb-3">
          {test.title}
        </h4>

        {/* Key Metrics: Questions, Time, Marks */}
        <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50/80 rounded-xl text-center border border-slate-100">
          <div>
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 mb-0.5">
              <HelpCircle className="w-3 h-3" />
              <span>Questions</span>
            </div>
            <div className="font-extrabold text-xs sm:text-sm text-slate-800">{qCount}</div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 mb-0.5">
              <Clock className="w-3 h-3" />
              <span>Time</span>
            </div>
            <div className="font-extrabold text-xs sm:text-sm text-slate-800">{durationMins}m</div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 mb-0.5">
              <Award className="w-3 h-3" />
              <span>Marks</span>
            </div>
            <div className="font-extrabold text-xs sm:text-sm text-slate-800">{totalMarks}</div>
          </div>
        </div>

        {/* Marking info */}
        <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between px-1">
          <span>Marks: <strong className="text-emerald-700">+{test.positiveMarks || 1.0}</strong> / <strong className="text-rose-600">-{test.negativeMarks || 0.0}</strong></span>
          {test.languages && Array.isArray(test.languages) && test.languages.length > 0 && (
            <span className="text-slate-400">{test.languages.join(', ')}</span>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        {isPaid ? (
          <>
            <div className="text-left">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Series Price</span>
              <span className="text-sm font-extrabold text-amber-700">
                {diamondPrice > 0 ? `💎 ${diamondPrice}` : `₹ ${rupeePrice}`}
              </span>
            </div>
            <button
              onClick={() => onUnlock(test)}
              className="flex-1 max-w-[140px] flex items-center justify-center gap-1.5 py-2 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Unlock Test</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => onStartTest(test)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Test Now</span>
          </button>
        )}
      </div>
    </div>
  );
}
