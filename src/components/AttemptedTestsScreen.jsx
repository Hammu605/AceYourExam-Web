import React from 'react';
import { ArrowLeft, Trophy, Clock, CheckCircle2, XCircle, Eye, FileCheck2 } from 'lucide-react';

export default function AttemptedTestsScreen({ attempts = [], allTests = [], onBack, onReviewAttempt }) {
  return (
    <div className="min-h-screen bg-ace-bg dark:bg-slate-950 pb-24">
      <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base font-extrabold text-slate-900 dark:text-white">Attempted Tests</h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{attempts.length} test(s) completed</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-3">
        {attempts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center">
            <FileCheck2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-white mb-1">No Attempted Tests Yet</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Complete any Mock Test or Practice Quiz to see your score history and solutions here.
            </p>
          </div>
        ) : (
          attempts.map((att, idx) => {
            const accuracy = att.accuracy ?? (att.totalQuestions ? Math.round(((att.correctCount || 0) / att.totalQuestions) * 100) : 0);
            const matchedTest = allTests.find(t => t.id === att.testId);
            return (
              <div
                key={att.attemptId || idx}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-ace-green-light text-ace-green mb-1">
                      {att.subject || 'Mock Test'}
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                      {att.testTitle || 'Mock Test'}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {att.dateFormatted || (att.timestamp ? new Date(att.timestamp).toLocaleString() : 'Recently')}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-black text-ace-green">
                      {att.score ?? 0}<span className="text-xs text-slate-400 font-bold">/{att.maxMarks || att.totalQuestions || 0}</span>
                    </div>
                    <div className="text-[11px] font-bold text-amber-500">{accuracy}% Acc</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5 mb-3">
                  <div className="flex items-center justify-center gap-1 text-xs font-bold text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {att.correctCount ?? 0}
                  </div>
                  <div className="flex items-center justify-center gap-1 text-xs font-bold text-red-500">
                    <XCircle className="w-3.5 h-3.5" /> {att.wrongCount ?? 0}
                  </div>
                  <div className="flex items-center justify-center gap-1 text-xs font-bold text-slate-500">
                    <Clock className="w-3.5 h-3.5" /> {Math.round((att.timeTakenSeconds || 0) / 60)}m
                  </div>
                </div>

                {(matchedTest || att.testSnapshot) && onReviewAttempt && (
                  <button
                    onClick={() => onReviewAttempt(att, matchedTest || att.testSnapshot)}
                    className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-ace-green hover:text-white text-slate-700 dark:text-slate-200 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> Review Answers & Solutions
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
