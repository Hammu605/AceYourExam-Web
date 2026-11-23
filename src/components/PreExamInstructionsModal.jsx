import React, { useState } from 'react';
import { X, ShieldCheck, Clock, Award, HelpCircle, CheckSquare, Globe, AlertCircle } from 'lucide-react';

export default function PreExamInstructionsModal({ 
  isOpen, 
  onClose, 
  test, 
  onConfirmStart 
}) {
  if (!isOpen || !test) return null;

  const [selectedLang, setSelectedLang] = useState('English');
  const [agreed, setAgreed] = useState(false);

  const durationMins = test.timeLimitMinutes || Math.floor((test.durationSeconds || 3600) / 60) || 60;
  const qCount = test.totalQuestionsCount || (Array.isArray(test.questions) ? test.questions.length : 100);
  const totalMarks = test.totalMarks || (qCount * (test.positiveMarks || 1.0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] dark:bg-emerald-950/60 text-[#0F4739] dark:text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 stroke-[2.2px]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                Exam Instructions & Rules
              </h3>
              <p className="text-xs text-slate-500">Read carefully before starting</p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable instructions */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          
          <div className="bg-[#F8FAFC] dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700">
            <h4 className="font-black text-sm text-slate-900 dark:text-white mb-2">{test.title}</h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Duration</span>
                <span className="font-extrabold text-slate-800 dark:text-white text-xs">{durationMins} Mins</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Questions</span>
                <span className="font-extrabold text-slate-800 dark:text-white text-xs">{qCount} Qs</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Max Marks</span>
                <span className="font-extrabold text-slate-800 dark:text-white text-xs">{totalMarks} Marks</span>
              </div>
            </div>
          </div>

          {/* Marking scheme */}
          <div className="space-y-1.5 bg-emerald-50/50 dark:bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 text-xs">
            <div className="font-bold text-emerald-900 dark:text-emerald-300">Marking Scheme:</div>
            <p className="text-emerald-800 dark:text-emerald-200">
              • Each correct question gives <strong className="font-extrabold">+{test.positiveMarks || 1.0} Marks</strong>.
            </p>
            {(test.negativeMarks || 0) > 0 ? (
              <p className="text-rose-700 dark:text-rose-400">
                • Incorrect answer penalty is <strong className="font-extrabold">-{test.negativeMarks} Marks</strong>.
              </p>
            ) : (
              <p className="text-emerald-800 dark:text-emerald-200">
                • No negative marking for wrong answers.
              </p>
            )}
            <p className="text-slate-600 dark:text-slate-400">
              • Unattempted questions carry 0 marks.
            </p>
          </div>

          {/* Test guidelines */}
          <div className="space-y-2 text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
            <p className="font-bold text-slate-900 dark:text-white">General Examination Rules:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>The countdown clock at the top will automatically submit the exam when the time is up.</li>
              <li>You can navigate to any question anytime using the Question Palette on the right.</li>
              <li>Click <strong>"Save & Next"</strong> to save your answer and move to the next question.</li>
              <li>Click <strong>"Mark for Review"</strong> to flag doubtful questions to review before submission.</li>
            </ul>
          </div>

          {/* Choose Language */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="font-bold text-xs text-slate-900 dark:text-white block mb-1.5">
              Choose Default Paper Language:
            </label>
            <div className="flex gap-2">
              {['English', 'Hindi'].map(lang => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setSelectedLang(lang)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                    selectedLang === lang 
                      ? 'bg-[#0F4739] text-white border-[#0F4739]' 
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {lang === 'Hindi' ? 'हिंदी (Hindi)' : 'English'}
                </button>
              ))}
            </div>
          </div>

          {/* Checkbox agreement */}
          <div className="pt-1 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="agree-rules"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-[#16A34A] focus:ring-[#16A34A] cursor-pointer"
            />
            <label htmlFor="agree-rules" className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
              I have read and understood all exam instructions. I agree not to use unfair means.
            </label>
          </div>

        </div>

        {/* Start Button */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <button
            onClick={() => onConfirmStart(test, selectedLang)}
            disabled={!agreed}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#0F4739] to-[#16A34A] hover:from-[#0D3A2F] hover:to-[#15803D] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-xl text-sm shadow-md transition-all active:scale-95 cursor-pointer"
          >
            I am Ready to Begin Test
          </button>
        </div>

      </div>
    </div>
  );
}
