import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Folder, 
  ChevronRight, 
  Play, 
  Clock, 
  HelpCircle, 
  Award, 
  Lock, 
  Unlock, 
  Share2, 
  Check, 
  BookOpen,
  Layers
} from 'lucide-react';
import { normalizeMakerXPath } from '../utils';

export default function ExamTestsListScreen({ 
  exam, 
  onBack, 
  allFolders = [], 
  allTests = [], 
  unlockedIds = new Set(), 
  onStartTestPreExam, 
  onUnlockItem 
}) {
  const [folderNavStack, setFolderNavStack] = useState([]);
  const [activeTabFilter, setActiveTabFilter] = useState('ALL'); // 'ALL' | 'MOCK' | 'PYQ' | 'PRACTICE'
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const currentFolder = folderNavStack.length > 0 ? folderNavStack[folderNavStack.length - 1] : null;
  const currentTitle = currentFolder ? (currentFolder.title || currentFolder.name) : (exam.title || exam.name);

  // Normalize target folder path
  const targetNormPath = useMemo(() => {
    if (currentFolder) {
      return normalizeMakerXPath(currentFolder.fullPath || currentFolder.folderPath || currentFolder.title || '');
    }
    return normalizeMakerXPath(exam.fullPath || exam.folderPath || exam.name || exam.title || '');
  }, [currentFolder, exam]);

  // Child sub-folders
  const subFolders = useMemo(() => {
    if (!targetNormPath) return [];
    return allFolders.filter(f => {
      const fNorm = normalizeMakerXPath(f.fullPath || '');
      const fParent = normalizeMakerXPath(f.parentPath || '');
      return (fParent && fParent === targetNormPath) || 
             (fNorm.startsWith(targetNormPath + '/') && fNorm.split('/').length === targetNormPath.split('/').length + 1);
    });
  }, [allFolders, targetNormPath]);

  // Tests under this exam/folder
  const folderTests = useMemo(() => {
    return allTests.filter(t => {
      const tNorm = normalizeMakerXPath(t.fullFolderPath || t.folderPath || '');
      const matchesPath = tNorm === targetNormPath || 
                          tNorm.startsWith(targetNormPath + '/') || 
                          (t.examName && t.examName.toLowerCase() === (exam.name || exam.title || '').toLowerCase()) ||
                          (t.category && t.category.toLowerCase().includes((exam.name || exam.title || '').toLowerCase()));

      if (!matchesPath) return false;

      // Tab filter
      const typeStr = (t.type || t.testType || t.title || '').toUpperCase();
      if (activeTabFilter === 'MOCK' && !typeStr.includes('MOCK')) return false;
      if (activeTabFilter === 'PYQ' && !typeStr.includes('PYQ') && !typeStr.includes('PREVIOUS')) return false;
      if (activeTabFilter === 'PRACTICE' && !typeStr.includes('PRACTICE') && !typeStr.includes('CHAPTER')) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (t.title && t.title.toLowerCase().includes(q));
      }

      return true;
    });
  }, [allTests, targetNormPath, exam, activeTabFilter, searchQuery]);

  const handleCopyShare = (t) => {
    const url = new URL(window.location.href);
    url.searchParams.set('testId', t.id || t.documentId);
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopiedId(t.id || t.documentId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="pb-24 pt-3 px-4 sm:px-6 max-w-5xl mx-auto space-y-4">
      
      {/* Top Bar with Back & Title */}
      <div className="flex items-center justify-between border-b border-slate-200/90 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (folderNavStack.length > 0) {
                setFolderNavStack(prev => prev.slice(0, -1));
              } else {
                onBack();
              }
            }}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-all active:scale-95"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="font-black text-base sm:text-lg text-slate-900 dark:text-white tracking-tight line-clamp-1">
              {currentTitle}
            </h2>
            <div className="text-[11px] text-slate-500 font-medium">
              {folderNavStack.length > 0 ? `Sub-folder Level ${folderNavStack.length}` : 'Official Test Series & Mocks'}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-[180px] sm:max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search papers..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-transparent focus:border-[#16A34A] outline-none"
          />
        </div>
      </div>

      {/* Filter Tabs (All / Mock Tests / PYQ / Practice) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {[
          { id: 'ALL', label: 'All Content' },
          { id: 'MOCK', label: '🎯 Full Mocks' },
          { id: 'PYQ', label: '📜 PYQ Papers' },
          { id: 'PRACTICE', label: '⚡ Practice Sets' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTabFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTabFilter === tab.id
                ? 'bg-[#0F4739] text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. Sub-folders Grid (If any nested directories exist) */}
      {subFolders.length > 0 && (
        <div className="space-y-2.5">
          <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Folder Sections ({subFolders.length})</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {subFolders.map(sf => (
              <div
                key={sf.id || sf.fullPath}
                onClick={() => setFolderNavStack(prev => [...prev, sf])}
                className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-[#16A34A]/50 transition-all cursor-pointer flex items-center justify-between group active:scale-[0.99]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#E8F5E9] dark:bg-emerald-950/60 text-[#0F4739] dark:text-emerald-400 flex items-center justify-center">
                    <Folder className="w-4 h-4 fill-[#DCFCE7] stroke-[#0F4739]" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#0F4739] dark:group-hover:text-emerald-400">
                      {sf.title || sf.name}
                    </h5>
                    <span className="text-[10px] text-slate-400">Open sub-tests</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Mock Tests List */}
      <div className="space-y-3">
        <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
          <span>Available Tests ({folderTests.length})</span>
        </h4>

        {folderTests.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-dashed border-slate-300 dark:border-slate-800 text-center text-slate-400">
            <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-bold text-sm text-slate-600 dark:text-slate-300">No mock tests found in this section</p>
            <p className="text-xs text-slate-400 mt-1">Tests added via Mekar-X will sync here automatically.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {folderTests.map((t) => {
              const isDemo = t.isDemo || t.isFreeDemo;
              const isUnlocked = unlockedIds.has(t.id) || unlockedIds.has(t.documentId) || unlockedIds.has(t.fullFolderPath);
              const isLocked = (t.isLocked || t.isPaid) && !isDemo && !isUnlocked;
              const durationMins = t.timeLimitMinutes || Math.floor((t.durationSeconds || 3600) / 60) || 60;
              const qCount = t.totalQuestionsCount || (Array.isArray(t.questions) ? t.questions.length : 100);
              const totalMarks = t.totalMarks || (qCount * (t.positiveMarks || 1.0));
              const diamondPrice = t.diamondPrice || t.diamondsRequired || 100;

              return (
                <div
                  key={t.id || t.documentId}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top status badges */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isDemo && (
                          <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                            FREE DEMO
                          </span>
                        )}
                        {isUnlocked && !isDemo && (
                          <span className="bg-sky-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                            UNLOCKED
                          </span>
                        )}
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {t.testType || 'Full Mock'}
                        </span>
                      </div>

                      {/* Share link button */}
                      <button
                        onClick={() => handleCopyShare(t)}
                        className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors"
                        title="Copy direct test link"
                      >
                        {copiedId === (t.id || t.documentId) ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-snug mb-3">
                      {t.title}
                    </h4>

                    {/* Stats pills: Questions, Time, Marks */}
                    <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-[#F8FAFC] dark:bg-slate-800/60 rounded-xl text-center border border-slate-100 dark:border-slate-800 mb-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Questions</span>
                        <span className="font-black text-xs sm:text-sm text-slate-800 dark:text-white">{qCount}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Time</span>
                        <span className="font-black text-xs sm:text-sm text-slate-800 dark:text-white">{durationMins}m</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Marks</span>
                        <span className="font-black text-xs sm:text-sm text-slate-800 dark:text-white">{totalMarks}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center justify-between px-0.5">
                      <span>Marking: <strong className="text-emerald-700 font-bold">+{t.positiveMarks || 1.0}</strong> / <strong className="text-rose-600 font-bold">-{t.negativeMarks || 0.0}</strong></span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    {isLocked ? (
                      <>
                        <div className="text-left">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Series Lock</span>
                          <span className="text-sm font-black text-amber-700 dark:text-amber-400">💎 {diamondPrice}</span>
                        </div>
                        <button
                          onClick={() => onUnlockItem(t)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-black shadow-xs transition-all active:scale-95 cursor-pointer"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Unlock Test</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => onStartTestPreExam(t)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-[#0F4739] to-[#16A34A] hover:from-[#0D3A2F] hover:to-[#15803D] text-white rounded-xl text-xs sm:text-sm font-black shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>Start Test</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
