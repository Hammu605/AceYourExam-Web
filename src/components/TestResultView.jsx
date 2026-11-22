import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Clock, 
  RotateCcw, 
  ArrowLeft, 
  Filter,
  Sparkles,
  BookOpen,
  Printer,
  Star
} from 'lucide-react';
import { 
  formatDuration, 
  extractQuestionText, 
  extractQuestionOptions, 
  extractCorrectOptionIndex, 
  extractQuestionExplanation 
} from '../utils';
import MathRenderer from './MathRenderer';

export default function TestResultView({ result, onRetake, onBackToDashboard, currentLang = 'English', onBookmarkToggle, bookmarkedIds = new Set() }) {
  const { test, rawQuestions, answers, timeSpentSeconds, totalSeconds } = result;

  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'CORRECT' | 'INCORRECT' | 'UNATTEMPTED'
  const [selectedLang, setSelectedLang] = useState(currentLang);

  // Calculate detailed performance
  const positiveMarks = test.positiveMarks || 1.0;
  const negativeMarks = test.negativeMarks || 0.0;

  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;

  const questionEvaluations = rawQuestions.map((q, idx) => {
    const selectedOpt = answers[idx];
    const correctOpt = extractCorrectOptionIndex(q);
    const isAttempted = selectedOpt !== undefined;
    const isCorrect = isAttempted && selectedOpt === correctOpt;

    if (!isAttempted) {
      unattemptedCount++;
    } else if (isCorrect) {
      correctCount++;
    } else {
      incorrectCount++;
    }

    return {
      index: idx,
      question: q,
      selectedOpt,
      correctOpt,
      isAttempted,
      isCorrect
    };
  });

  const totalScore = Math.max(0, (correctCount * positiveMarks) - (incorrectCount * negativeMarks));
  const totalMaxMarks = rawQuestions.length * positiveMarks;
  const attemptedTotal = correctCount + incorrectCount;
  const accuracyPct = attemptedTotal > 0 ? Math.round((correctCount / attemptedTotal) * 100) : 0;
  const scorePct = totalMaxMarks > 0 ? Math.round((totalScore / totalMaxMarks) * 100) : 0;

  // Trigger celebration confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (_) {}
  }, []);

  // Filter questions for review
  const filteredQuestions = questionEvaluations.filter(item => {
    if (activeFilter === 'CORRECT') return item.isCorrect;
    if (activeFilter === 'INCORRECT') return item.isAttempted && !item.isCorrect;
    if (activeFilter === 'UNATTEMPTED') return !item.isAttempted;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Series</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              title="Print Scorecard"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>
            <button
              onClick={() => setSelectedLang(prev => prev === 'Hindi' ? 'English' : 'Hindi')}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-brand-600 hover:bg-brand-50"
            >
              Lang: {selectedLang === 'Hindi' ? 'हिंदी' : 'English'}
            </button>
            <button
              onClick={onRetake}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Re-take Test</span>
            </button>
          </div>
        </div>

        {/* 1. Main Score Banner */}
        <div className="bg-gradient-to-br from-brand-900 via-brand-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            <div className="text-center sm:text-left">
              <span className="inline-block bg-white/10 text-amber-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                Test Assessment Completed
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-1">
                {test.title}
              </h1>
              <p className="text-xs text-brand-200">
                Time Taken: <strong className="text-white">{formatDuration(timeSpentSeconds)}</strong> of {formatDuration(totalSeconds)}
              </p>
            </div>

            {/* Score Ring / Pill */}
            <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 min-w-[160px] text-center shadow-inner">
              <span className="text-[11px] uppercase font-bold text-brand-200 tracking-wider">Your Score</span>
              <div className="text-3xl sm:text-4xl font-black text-amber-300 leading-none my-1">
                {totalScore.toFixed(1)}
              </div>
              <span className="text-xs text-brand-200">out of {totalMaxMarks} Marks</span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/10">
            <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/5">
              <span className="text-[11px] text-brand-200 block">Accuracy</span>
              <span className="text-lg sm:text-xl font-black text-white">{accuracyPct}%</span>
            </div>
            <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/5">
              <span className="text-[11px] text-brand-200 block">Correct (✅)</span>
              <span className="text-lg sm:text-xl font-black text-emerald-400">{correctCount}</span>
            </div>
            <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/5">
              <span className="text-[11px] text-brand-200 block">Incorrect (❌)</span>
              <span className="text-lg sm:text-xl font-black text-rose-400">{incorrectCount}</span>
            </div>
            <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/5">
              <span className="text-[11px] text-brand-200 block">Unattempted</span>
              <span className="text-lg sm:text-xl font-black text-slate-300">{unattemptedCount}</span>
            </div>
          </div>

        </div>

        {/* 2. Solutions & Detailed Review Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Detailed Solutions & Explanation
              </h2>
              <p className="text-xs text-slate-500">
                Review each question with full correct solutions and rationale.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold overflow-x-auto max-w-full">
              {[
                { key: 'ALL', label: `All (${rawQuestions.length})` },
                { key: 'CORRECT', label: `Correct (${correctCount})` },
                { key: 'INCORRECT', label: `Wrong (${incorrectCount})` },
                { key: 'UNATTEMPTED', label: `Skipped (${unattemptedCount})` }
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
                    activeFilter === f.key 
                      ? 'bg-white text-slate-900 shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Questions Review List */}
          <div className="space-y-6">
            {filteredQuestions.map(item => {
              const q = item.question;
              const qText = extractQuestionText(q, selectedLang);
              const qOptions = extractQuestionOptions(q, selectedLang);
              const explanation = extractQuestionExplanation(q, selectedLang);
              const qId = q.id || `q_${item.index}`;
              const isBookmarked = bookmarkedIds.has(qId);

              return (
                <div 
                  key={item.index} 
                  className={`p-5 rounded-2xl border-2 transition-all ${
                    item.isCorrect 
                      ? 'bg-emerald-50/40 border-emerald-200' 
                      : item.isAttempted 
                        ? 'bg-rose-50/40 border-rose-200' 
                        : 'bg-slate-50/60 border-slate-200'
                  }`}
                >
                  {/* Status header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-slate-600 uppercase tracking-wider">
                        Question {item.index + 1}
                      </span>
                      {onBookmarkToggle && (
                        <button
                          onClick={() => onBookmarkToggle({
                            id: qId,
                            testId: test.id || test.documentId,
                            testTitle: test.title,
                            questionText: qText,
                            explanation: explanation
                          })}
                          className={`p-1 rounded-md transition-colors ${
                            isBookmarked ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'
                          }`}
                          title="Bookmark for Revision"
                        >
                          <Star className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400' : ''}`} />
                        </button>
                      )}
                    </div>

                    <div>
                      {item.isCorrect ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+{positiveMarks})
                        </span>
                      ) : item.isAttempted ? (
                        <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-xs font-bold px-2 py-0.5 rounded-md">
                          <XCircle className="w-3.5 h-3.5" /> Incorrect (-{negativeMarks})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-slate-200 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-md">
                          Unattempted (0)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Title */}
                  <div className="text-slate-900 font-semibold text-base mb-4 select-text">
                    <MathRenderer text={qText} />
                  </div>

                  {/* Image if present */}
                  {(q.imageUrl || q.image) && (
                    <div className="mb-4 max-w-sm rounded-xl overflow-hidden border border-slate-200">
                      <img src={q.imageUrl || q.image} alt="Question" className="w-full object-contain bg-white" />
                    </div>
                  )}

                  {/* Options with Answer Highlight */}
                  <div className="space-y-2 mb-4">
                    {qOptions.map((opt, optIdx) => {
                      const letter = String.fromCharCode(65 + optIdx);
                      const isCorrectOpt = optIdx === item.correctOpt;
                      const isUserSelected = optIdx === item.selectedOpt;

                      let optClass = 'bg-white border-slate-200 text-slate-700';
                      if (isCorrectOpt) {
                        optClass = 'bg-emerald-100/80 border-emerald-500 text-emerald-950 font-bold';
                      } else if (isUserSelected && !isCorrectOpt) {
                        optClass = 'bg-rose-100/80 border-rose-400 text-rose-950 font-medium';
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-2.5 ${optClass}`}
                        >
                          <span className="font-extrabold w-5 shrink-0">{letter}.</span>
                          <span className="flex-1"><MathRenderer text={opt} /></span>
                          {isCorrectOpt && (
                            <span className="text-[10px] font-extrabold text-emerald-700 uppercase bg-emerald-200/70 px-1.5 py-0.5 rounded-sm shrink-0">
                              Correct Answer
                            </span>
                          )}
                          {isUserSelected && !isCorrectOpt && (
                            <span className="text-[10px] font-extrabold text-rose-700 uppercase bg-rose-200/70 px-1.5 py-0.5 rounded-sm shrink-0">
                              Your Choice
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Accordion / Box */}
                  {explanation && (
                    <div className="mt-3 p-3.5 bg-white/90 rounded-xl border border-slate-200/90 text-xs text-slate-700">
                      <div className="flex items-center gap-1.5 font-bold text-brand-900 mb-1">
                        <BookOpen className="w-3.5 h-3.5 text-brand-600" />
                        <span>Explanation / Solution:</span>
                      </div>
                      <div className="leading-relaxed select-text">
                        <MathRenderer text={explanation} />
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
}
