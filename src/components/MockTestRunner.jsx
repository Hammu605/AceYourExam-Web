import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Bookmark, 
  RotateCcw, 
  AlertTriangle,
  Send,
  Globe,
  Menu,
  X
} from 'lucide-react';
import { 
  formatDuration, 
  extractQuestionText, 
  extractQuestionOptions, 
  extractCorrectOptionIndex, 
  extractQuestionExplanation 
} from '../utils';

export default function MockTestRunner({ test, initialLang = 'English', onSubmitTest, onExit }) {
  const [currentLang, setCurrentLang] = useState(initialLang);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  
  // Timer state
  const totalSeconds = test.durationSeconds || ((test.timeLimitMinutes || 60) * 60);
  const [timeLeft, setTimeLeft] = useState(totalSeconds);

  // Answers Map: questionIndex -> selectedOptionIndex (0, 1, 2, 3)
  const [answers, setAnswers] = useState({});

  // Question Status: questionIndex -> 'ANSWERED' | 'NOT_ANSWERED' | 'MARKED' | 'ANSWERED_MARKED'
  const [visitedIndices, setVisitedIndices] = useState(new Set([0]));
  const [markedIndices, setMarkedIndices] = useState(new Set());

  // Palette drawer on mobile
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Normalize questions array from test
  const rawQuestions = Array.isArray(test.questions) && test.questions.length > 0 
    ? test.questions 
    : [
        {
          id: 'q1',
          question: 'What is the capital of India?',
          options: ['Mumbai', 'New Delhi', 'Kolkata', 'Chennai'],
          correctOptionIndex: 1,
          explanation: 'New Delhi is the official capital of India.'
        }
      ];

  // Tick timer
  useEffect(() => {
    if (timeLeft <= 0) {
      handleFinalSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Mark visited on index change
  useEffect(() => {
    setVisitedIndices(prev => new Set(prev).add(currentQIndex));
  }, [currentQIndex]);

  const currentQ = rawQuestions[currentQIndex] || rawQuestions[0];
  const qText = extractQuestionText(currentQ, currentLang);
  const qOptions = extractQuestionOptions(currentQ, currentLang);
  const selectedOption = answers[currentQIndex];

  const handleSelectOption = (optIdx) => {
    setAnswers(prev => ({
      ...prev,
      [currentQIndex]: optIdx
    }));
  };

  const handleClearResponse = () => {
    setAnswers(prev => {
      const copy = { ...prev };
      delete copy[currentQIndex];
      return copy;
    });
  };

  const handleToggleMarkReview = () => {
    setMarkedIndices(prev => {
      const next = new Set(prev);
      if (next.has(currentQIndex)) {
        next.delete(currentQIndex);
      } else {
        next.add(currentQIndex);
      }
      return next;
    });
  };

  const handleSaveAndNext = () => {
    if (currentQIndex < rawQuestions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    }
  };

  const handleMarkAndNext = () => {
    handleToggleMarkReview();
    if (currentQIndex < rawQuestions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    }
  };

  const handleFinalSubmit = () => {
    setShowSubmitModal(false);
    const timeSpentSeconds = totalSeconds - timeLeft;
    onSubmitTest({
      test,
      rawQuestions,
      answers,
      timeSpentSeconds,
      totalSeconds
    });
  };

  // Status calculation for question badge in palette
  const getQuestionStatus = (idx) => {
    const isAnswered = answers[idx] !== undefined;
    const isMarked = markedIndices.has(idx);
    const isVisited = visitedIndices.has(idx);

    if (isAnswered && isMarked) return 'ANSWERED_MARKED';
    if (isAnswered) return 'ANSWERED';
    if (isMarked) return 'MARKED';
    if (isVisited) return 'NOT_ANSWERED';
    return 'NOT_VISITED';
  };

  // Summary counts for submit modal
  const answeredCount = Object.keys(answers).length;
  const markedCount = markedIndices.size;
  const unattemptedCount = rawQuestions.length - answeredCount;

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col overflow-hidden">
      
      {/* 1. Exam Top Navigation Bar */}
      <header className="h-16 bg-brand-900 text-white px-4 sm:px-6 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to quit the test? Your current progress will be lost.")) {
                onExit();
              }
            }}
            className="text-xs bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-lg font-semibold transition-all"
          >
            Exit Test
          </button>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold tracking-tight truncate max-w-[200px] sm:max-w-md">
              {test.title}
            </h2>
            <div className="text-[10px] text-brand-200">
              Question {currentQIndex + 1} of {rawQuestions.length}
            </div>
          </div>
        </div>

        {/* Center: Live Countdown Timer */}
        <div className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl font-mono text-sm sm:text-base font-black shadow-inner ${
          timeLeft < 300 ? 'bg-rose-500 text-white animate-pulse' : 'bg-brand-950/70 text-amber-300 border border-brand-800'
        }`}>
          <Clock className="w-4 h-4" />
          <span>{formatDuration(timeLeft)}</span>
        </div>

        {/* Right Controls: Language, Palette Toggle & Submit */}
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <button
            onClick={() => setCurrentLang(prev => prev === 'Hindi' ? 'English' : 'Hindi')}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-all"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-amber-300" />
            <span>{currentLang === 'Hindi' ? 'हिंदी' : 'EN'}</span>
          </button>

          {/* Mobile Palette Button */}
          <button
            onClick={() => setIsPaletteOpen(prev => !prev)}
            className="lg:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
            title="Question Palette"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Submit Button */}
          <button
            onClick={() => setShowSubmitModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Submit</span>
          </button>
        </div>
      </header>

      {/* 2. Main Content Area: Left Question Area + Right Question Palette */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left: Active Question Screen */}
        <main className="flex-1 flex flex-col bg-slate-50 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col justify-between">
            
            {/* Question Header */}
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                <span className="font-extrabold text-slate-800 text-base sm:text-lg">
                  Question {currentQIndex + 1}
                </span>
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md border border-emerald-300">
                    +{test.positiveMarks || 1.0}
                  </span>
                  {(test.negativeMarks || 0) > 0 && (
                    <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-md border border-rose-300">
                      -{test.negativeMarks}
                    </span>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <div className="text-slate-900 text-base sm:text-lg font-medium leading-relaxed mb-6 select-text">
                {qText || 'Question text not available.'}
              </div>

              {/* Question Image if available */}
              {(currentQ.imageUrl || currentQ.image) && (
                <div className="mb-6 max-w-lg mx-auto rounded-xl overflow-hidden border border-slate-200 shadow-xs">
                  <img 
                    src={currentQ.imageUrl || currentQ.image} 
                    alt="Question Diagram" 
                    className="w-full h-auto object-contain bg-white"
                  />
                </div>
              )}

              {/* Options List */}
              <div className="space-y-3 mb-8">
                {qOptions.map((optText, optIdx) => {
                  const isSelected = selectedOption === optIdx;
                  const letter = String.fromCharCode(65 + optIdx); // A, B, C, D

                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 select-text active:scale-[0.99] ${
                        isSelected 
                          ? 'bg-brand-50/80 border-brand-600 shadow-sm' 
                          : 'bg-white border-slate-200 hover:border-brand-300 hover:bg-slate-50/80'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        isSelected 
                          ? 'bg-brand-600 text-white' 
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {letter}
                      </div>
                      <div className="flex-1 text-sm sm:text-base text-slate-800 pt-0.5 font-medium leading-snug">
                        {optText}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Action Controls */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearResponse}
                  disabled={selectedOption === undefined}
                  className="px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Clear Response
                </button>
                <button
                  onClick={handleMarkAndNext}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    markedIndices.has(currentQIndex)
                      ? 'bg-purple-100 text-purple-900 border border-purple-300'
                      : 'bg-white border border-purple-300 text-purple-700 hover:bg-purple-50'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5 fill-current" />
                  <span>Mark for Review</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQIndex === 0}
                  className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={handleSaveAndNext}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold flex items-center gap-1 shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <span>{currentQIndex === rawQuestions.length - 1 ? 'Last Question' : 'Save & Next'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </main>

        {/* Right: Question Palette Drawer / Sidebar */}
        <aside className={`w-80 bg-white border-l border-slate-200 flex flex-col justify-between shrink-0 fixed lg:static right-0 top-16 bottom-0 z-40 transition-transform duration-200 ${
          isPaletteOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full lg:translate-x-0'
        }`}>
          
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Question Palette</h3>
            <button 
              onClick={() => setIsPaletteOpen(false)} 
              className="lg:hidden p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Palette Legend */}
          <div className="p-3 bg-slate-50 grid grid-cols-2 gap-2 text-[10px] text-slate-600 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-emerald-500 text-white font-bold flex items-center justify-center text-[8px]">✓</span>
              <span>Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-purple-500 text-white font-bold flex items-center justify-center text-[8px]">★</span>
              <span>Review ({markedCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-rose-500 text-white font-bold flex items-center justify-center text-[8px]">•</span>
              <span>Not Answered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-[8px]"></span>
              <span>Not Visited</span>
            </div>
          </div>

          {/* Question Numbers Grid */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="grid grid-cols-5 gap-2">
              {rawQuestions.map((_, idx) => {
                const status = getQuestionStatus(idx);
                const isCurrent = idx === currentQIndex;

                let bgClass = 'bg-slate-100 text-slate-700 hover:bg-slate-200';
                if (status === 'ANSWERED') bgClass = 'bg-emerald-500 text-white shadow-xs';
                else if (status === 'MARKED') bgClass = 'bg-purple-600 text-white shadow-xs';
                else if (status === 'ANSWERED_MARKED') bgClass = 'bg-purple-600 text-white ring-2 ring-emerald-400 ring-offset-1';
                else if (status === 'NOT_ANSWERED') bgClass = 'bg-rose-500 text-white shadow-xs';

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentQIndex(idx);
                      setIsPaletteOpen(false);
                    }}
                    className={`h-9 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${bgClass} ${
                      isCurrent ? 'ring-2 ring-brand-900 ring-offset-2 scale-105 font-black' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Palette Footer Mobile Submit */}
          <div className="p-4 border-t border-slate-100">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-extrabold rounded-xl shadow-md text-sm active:scale-95 transition-all"
            >
              Submit Entire Test
            </button>
          </div>

        </aside>

      </div>

      {/* 3. Final Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 text-center mb-1">
              Ready to Submit Test?
            </h3>
            <p className="text-xs text-slate-500 text-center mb-6">
              Please review your question attempts before final submission.
            </p>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 grid grid-cols-3 gap-2 text-center mb-6">
              <div>
                <span className="text-[11px] text-slate-500 block">Answered</span>
                <span className="text-lg font-extrabold text-emerald-600">{answeredCount}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Marked</span>
                <span className="text-lg font-extrabold text-purple-600">{markedCount}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Unattempted</span>
                <span className="text-lg font-extrabold text-slate-400">{unattemptedCount}</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={handleFinalSubmit}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-extrabold rounded-xl text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Yes, Submit Now
              </button>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="w-full py-2.5 text-slate-600 hover:text-slate-800 text-xs font-bold"
              >
                Keep Attempting Test
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
