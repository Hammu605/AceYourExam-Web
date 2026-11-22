import React from 'react';
import { Star, X, Trash2, BookOpen, AlertCircle } from 'lucide-react';
import MathRenderer from './MathRenderer';

export default function BookmarksModal({ isOpen, onClose, bookmarkedQuestions, onRemoveBookmark }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-500" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Revision Notebook</h3>
              <p className="text-xs text-slate-500">{bookmarkedQuestions.length} Saved Questions for Practice</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {bookmarkedQuestions.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Star className="w-12 h-12 mx-auto mb-3 text-slate-300 stroke-slate-300" />
              <p className="font-bold text-slate-700 text-sm">No saved questions yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                While attempting any mock test, click the Star (★) icon to save difficult questions for quick revision here.
              </p>
            </div>
          ) : (
            bookmarkedQuestions.map((item, idx) => (
              <div 
                key={item.id || idx}
                className="bg-slate-50 rounded-2xl p-4 border border-slate-200 relative group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-extrabold text-brand-700 uppercase tracking-wider">
                    {item.testTitle || 'Mock Test'}
                  </span>
                  <button
                    onClick={() => onRemoveBookmark(item.id || idx)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Remove from bookmarks"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-slate-900 font-semibold text-sm mb-3">
                  <MathRenderer text={item.questionText} />
                </div>

                {item.explanation && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80 text-xs text-slate-700">
                    <span className="font-bold text-brand-900 block mb-0.5">Solution:</span>
                    <MathRenderer text={item.explanation} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 text-center shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
          >
            Close Notebook
          </button>
        </div>

      </div>
    </div>
  );
}
