import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import Breadcrumb from './components/Breadcrumb';
import FolderCard from './components/FolderCard';
import TestCard from './components/TestCard';
import UnlockModal from './components/UnlockModal';
import MockTestRunner from './components/MockTestRunner';
import TestResultView from './components/TestResultView';
import StudyFocusTimerModal from './components/StudyFocusTimerModal';
import BookmarksModal from './components/BookmarksModal';
import { db, collection, onSnapshot } from './firebase';
import { normalizeMakerXPath } from './utils';
import { Sparkles, BookOpen, Layers, RefreshCw, FolderSearch, AlertCircle, X } from 'lucide-react';

export default function App() {
  // Global App States
  const [diamonds, setDiamonds] = useState(() => {
    const saved = localStorage.getItem('user_diamonds');
    return saved ? parseInt(saved, 10) : 100; // Free 100 starting bonus for every student!
  });

  const [unlockedIds, setUnlockedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('unlocked_ids');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (_) {
      return new Set();
    }
  });

  const [bookmarkedQuestions, setBookmarkedQuestions] = useState(() => {
    try {
      const saved = localStorage.getItem('bookmarked_questions');
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme_mode') === 'dark';
  });

  const [selectedLang, setSelectedLang] = useState('English');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSectionTab, setActiveSectionTab] = useState(0); // 0 = All, 1 = Competitive, 2 = Subject-wise
  
  // Navigation stack: array of folder objects
  const [folderStack, setFolderStack] = useState([]);

  // Active Runner or Result State
  const [activeTest, setActiveTest] = useState(null);
  const [testResult, setTestResult] = useState(null);

  // Modals
  const [unlockTarget, setUnlockTarget] = useState(null);
  const [isDiamondsModalOpen, setIsDiamondsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isFocusTimerOpen, setIsFocusTimerOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);

  // Firestore Data
  const [appDirectoryDocs, setAppDirectoryDocs] = useState([]);
  const [testsDocs, setTestsDocs] = useState([]);
  const [pricingControlDocs, setPricingControlDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Save diamonds to local storage
  useEffect(() => {
    localStorage.setItem('user_diamonds', diamonds.toString());
  }, [diamonds]);

  // Save unlocked items to local storage
  useEffect(() => {
    localStorage.setItem('unlocked_ids', JSON.stringify(Array.from(unlockedIds)));
  }, [unlockedIds]);

  // Save bookmarks
  useEffect(() => {
    localStorage.setItem('bookmarked_questions', JSON.stringify(bookmarkedQuestions));
  }, [bookmarkedQuestions]);

  // Apply dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme_mode', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme_mode', 'light');
    }
  }, [isDarkMode]);

  // Realtime Firebase Listeners
  useEffect(() => {
    setLoading(true);

    // 1. Listen to app_directory
    const unsubAppDir = onSnapshot(collection(db, 'app_directory'), (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAppDirectoryDocs(docs);
    }, (err) => console.warn("app_directory listener:", err));

    // 2. Listen to tests
    const unsubTests = onSnapshot(collection(db, 'tests'), (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTestsDocs(docs);
      setLoading(false);
    }, (err) => console.warn("tests listener:", err));

    // 3. Listen to test_pricing_control
    const unsubPricing = onSnapshot(collection(db, 'test_pricing_control'), (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPricingControlDocs(docs);
    }, (err) => console.warn("test_pricing_control listener:", err));

    return () => {
      unsubAppDir();
      unsubTests();
      unsubPricing();
    };
  }, []);

  // Merge tests with pricing controls
  const allTests = useMemo(() => {
    const pricingMap = new Map();
    pricingControlDocs.forEach(p => {
      if (p.id) pricingMap.set(p.id.toLowerCase(), p);
      if (p.targetId) pricingMap.set(p.targetId.toLowerCase(), p);
    });

    return testsDocs.map(test => {
      const docId = (test.id || '').toLowerCase();
      const pDoc = pricingMap.get(docId) || {};
      
      const isLockedExplicit = typeof pDoc.isLocked === 'boolean' ? pDoc.isLocked : test.isLocked;
      const isPaidExplicit = typeof pDoc.isPaid === 'boolean' ? pDoc.isPaid : test.isPaid;
      const diamondPrice = pDoc.diamondPrice !== undefined ? pDoc.diamondPrice : test.diamondPrice;
      const rupeePrice = pDoc.price !== undefined ? pDoc.price : test.price;

      return {
        ...test,
        isLocked: isLockedExplicit || isPaidExplicit || false,
        isPaid: isPaidExplicit || isLockedExplicit || false,
        diamondPrice: diamondPrice || 0,
        price: rupeePrice || 0,
        fullFolderPath: test.fullFolderPath || test.folderPath || test.category || ''
      };
    });
  }, [testsDocs, pricingControlDocs]);

  // Check URL query parameters for direct test link: `?testId=XYZ`
  useEffect(() => {
    if (loading || allTests.length === 0) return;
    const urlParams = new URLSearchParams(window.location.search);
    const directTestId = urlParams.get('testId');
    if (directTestId) {
      const found = allTests.find(t => 
        (t.id && t.id.toLowerCase() === directTestId.toLowerCase()) ||
        (t.documentId && t.documentId.toLowerCase() === directTestId.toLowerCase())
      );
      if (found) {
        setActiveTest(found);
      }
    }
  }, [loading, allTests]);

  // Current folder at the top of the stack
  const currentFolder = folderStack.length > 0 ? folderStack[folderStack.length - 1] : null;

  // Filter Child Folders
  const childFolders = useMemo(() => {
    if (!currentFolder) {
      // Root folders: Level 0
      return appDirectoryDocs.filter(d => {
        if (!d.title && !d.name) return false;
        if (d.id === 'makerx_folder_registry' || d.id === 'master_tree' || d.id === 'deleted_folders') return false;
        const norm = normalizeMakerXPath(d.fullPath || d.folderPath || '');
        const depth = d.depth !== undefined ? d.depth : (norm ? norm.split('/').length - 1 : 0);
        
        // Filter by section tab
        if (activeSectionTab === 1 && d.sectionType && !d.sectionType.toLowerCase().includes('comp')) return false;
        if (activeSectionTab === 2 && d.sectionType && !d.sectionType.toLowerCase().includes('subj')) return false;

        return depth === 0;
      });
    }

    // Sub-folders of currentFolder
    const currentNorm = normalizeMakerXPath(currentFolder.fullPath || currentFolder.folderPath || currentFolder.title || '');
    return appDirectoryDocs.filter(d => {
      if (d.id === currentFolder.id) return false;
      const dParent = normalizeMakerXPath(d.parentPath || '');
      const dFull = normalizeMakerXPath(d.fullPath || '');
      return (dParent && dParent === currentNorm) || (dFull.startsWith(currentNorm + '/') && dFull.split('/').length === currentNorm.split('/').length + 1);
    });
  }, [appDirectoryDocs, currentFolder, activeSectionTab]);

  // Filter Tests for Current Folder or Global Search
  const currentTests = useMemo(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return allTests.filter(t => 
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.fullFolderPath && t.fullFolderPath.toLowerCase().includes(q)) ||
        (t.subject && t.subject.toLowerCase().includes(q))
      );
    }

    if (!currentFolder) return [];

    const folderNorm = normalizeMakerXPath(currentFolder.fullPath || currentFolder.folderPath || currentFolder.title || '');
    return allTests.filter(t => {
      const tNorm = normalizeMakerXPath(t.fullFolderPath || '');
      return tNorm === folderNorm || tNorm.startsWith(folderNorm + '/') || t.bundleFolderId === currentFolder.id;
    });
  }, [allTests, currentFolder, searchQuery]);

  // Bookmark handlers
  const bookmarkedIdsSet = useMemo(() => {
    return new Set(bookmarkedQuestions.map(b => b.id));
  }, [bookmarkedQuestions]);

  const handleToggleBookmark = (item) => {
    setBookmarkedQuestions(prev => {
      const exists = prev.some(b => b.id === item.id);
      if (exists) {
        return prev.filter(b => b.id !== item.id);
      } else {
        return [item, ...prev];
      }
    });
  };

  const handleRemoveBookmark = (id) => {
    setBookmarkedQuestions(prev => prev.filter(b => b.id !== id));
  };

  // Unlock test or folder handler
  const handleConfirmUnlock = (item, cost) => {
    if (diamonds < cost) return;
    setDiamonds(prev => prev - cost);
    setUnlockedIds(prev => {
      const next = new Set(prev);
      if (item.id) next.add(item.id);
      if (item.documentId) next.add(item.documentId);
      if (item.fullPath) next.add(item.fullPath);
      return next;
    });
    setUnlockTarget(null);
  };

  const isItemUnlocked = (item) => {
    if (!item) return false;
    return (
      unlockedIds.has(item.id) || 
      unlockedIds.has(item.documentId) || 
      unlockedIds.has(item.fullFolderPath) ||
      unlockedIds.has(item.bundleFolderId)
    );
  };

  // If Test Runner is Active
  if (activeTest) {
    return (
      <MockTestRunner
        test={activeTest}
        initialLang={selectedLang}
        bookmarkedIds={bookmarkedIdsSet}
        onBookmarkToggle={handleToggleBookmark}
        onSubmitTest={(result) => {
          setActiveTest(null);
          setTestResult(result);
        }}
        onExit={() => {
          setActiveTest(null);
          const url = new URL(window.location.href);
          url.searchParams.delete('testId');
          window.history.replaceState({}, '', url.toString());
        }}
      />
    );
  }

  // If Test Result is Active
  if (testResult) {
    return (
      <TestResultView
        result={testResult}
        currentLang={selectedLang}
        bookmarkedIds={bookmarkedIdsSet}
        onBookmarkToggle={handleToggleBookmark}
        onRetake={() => {
          const testToRetake = testResult.test;
          setTestResult(null);
          setActiveTest(testToRetake);
        }}
        onBackToDashboard={() => {
          setTestResult(null);
          const url = new URL(window.location.href);
          url.searchParams.delete('testId');
          window.history.replaceState({}, '', url.toString());
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors">
      {/* 1. Header Navigation */}
      <Header
        diamonds={diamonds}
        onOpenDiamonds={() => setIsDiamondsModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedLang={selectedLang}
        onToggleLang={() => setSelectedLang(prev => prev === 'Hindi' ? 'English' : 'Hindi')}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenFocusTimer={() => setIsFocusTimerOpen(true)}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        bookmarksCount={bookmarkedQuestions.length}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(prev => !prev)}
      />

      {/* 2. Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          folderStack={folderStack}
          onNavigateBack={() => setFolderStack(prev => prev.slice(0, -1))}
          onJumpToLevel={(lvl) => {
            if (lvl === -1) setFolderStack([]);
            else setFolderStack(prev => prev.slice(0, lvl + 1));
          }}
        />

        {/* Section Tabs (Only on Root level when not searching) */}
        {!currentFolder && !searchQuery && (
          <div className="flex items-center gap-2 mb-6 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto no-scrollbar">
            {[
              { id: 0, label: 'All Exams & Series' },
              { id: 1, label: '🏆 Competitive Exams' },
              { id: 2, label: '📚 Subject Wise Study' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSectionTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all shrink-0 cursor-pointer ${
                  activeSectionTab === tab.id
                    ? 'bg-brand-900 dark:bg-brand-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Search Results Heading */}
        {searchQuery && (
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">
              Search Results for <span className="text-brand-600 dark:text-brand-400 font-black">"{searchQuery}"</span>
            </h2>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-brand-600 mb-3" />
            <p className="text-sm font-semibold">Connecting with AceYourExam Live Database...</p>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Sub-Folders Grid */}
            {childFolders.length > 0 && !searchQuery && (
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <h3 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    <span>{currentFolder ? 'Sub-Folders & Papers' : 'Available Series Categories'}</span>
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{childFolders.length} folders</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {childFolders.map(folder => {
                    const fNorm = normalizeMakerXPath(folder.fullPath || '');
                    const matchingTestsCount = allTests.filter(t => {
                      const tNorm = normalizeMakerXPath(t.fullFolderPath || '');
                      return tNorm === fNorm || tNorm.startsWith(fNorm + '/');
                    }).length;

                    return (
                      <FolderCard
                        key={folder.id || folder.fullPath}
                        folder={folder}
                        testCount={matchingTestsCount}
                        onClick={() => setFolderStack(prev => [...prev, folder])}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tests Grid (in Current Folder or Search Mode) */}
            {(currentFolder || searchQuery) && (
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <h3 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Mock Tests ({currentTests.length})</span>
                  </h3>
                </div>

                {currentTests.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-10 text-center text-slate-400">
                    <FolderSearch className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No mock tests found in this folder yet.</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Tests added via Mekar-X or approved in Admin-X will appear here automatically.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentTests.map(test => (
                      <TestCard
                        key={test.id || test.documentId}
                        test={test}
                        isUnlocked={isItemUnlocked(test) || isItemUnlocked(currentFolder)}
                        onStartTest={(t) => setActiveTest(t)}
                        onUnlock={(t) => setUnlockTarget(t)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </main>

      {/* 3. Footer */}
      <footer className="mt-auto bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <p className="font-semibold text-slate-700 dark:text-slate-300">AceYourExam Web Edition — Designed for Apple iOS, Android & Desktop</p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Real-time sync with Google Firebase • Math Equations with KaTeX</p>
      </footer>

      {/* Unlock Series Modal */}
      <UnlockModal
        isOpen={!!unlockTarget}
        targetItem={unlockTarget}
        diamonds={diamonds}
        onClose={() => setUnlockTarget(null)}
        onConfirmUnlock={handleConfirmUnlock}
        onAddFreeBonus={() => {
          setDiamonds(prev => prev + 200);
          alert("🎉 200 Welcome Bonus Diamonds Added to your balance!");
        }}
      />

      {/* Study Focus Timer Modal */}
      <StudyFocusTimerModal
        isOpen={isFocusTimerOpen}
        onClose={() => setIsFocusTimerOpen(false)}
        onRewardDiamonds={(amount) => {
          setDiamonds(prev => prev + amount);
          alert(`🎉 Awesome focus! +${amount} Diamonds added to your balance!`);
        }}
      />

      {/* Revision Bookmarks Modal */}
      <BookmarksModal
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarkedQuestions={bookmarkedQuestions}
        onRemoveBookmark={handleRemoveBookmark}
      />

      {/* Diamonds Top-Up / Info Modal */}
      {isDiamondsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 text-center relative border border-slate-100 dark:border-slate-800 shadow-2xl">
            <button onClick={() => setIsDiamondsModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3 text-3xl">
              💎
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">Diamond Balance</h3>
            <div className="text-3xl font-extrabold text-amber-900 dark:text-amber-400 my-2">{diamonds} 💎</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Use diamonds to unlock paid mock tests and comprehensive test series.
            </p>
            <button
              onClick={() => {
                setDiamonds(prev => prev + 100);
                alert("💎 Claimed +100 Daily Free Diamonds!");
                setIsDiamondsModalOpen(false);
              }}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-extrabold rounded-xl text-sm shadow-md active:scale-95 transition-all cursor-pointer"
            >
              Claim +100 Free Diamonds
            </button>
          </div>
        </div>
      )}

      {/* Student Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 text-center relative border border-slate-100 dark:border-slate-800 shadow-2xl">
            <button onClick={() => setIsProfileModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex items-center justify-center mx-auto mb-3 font-black text-2xl">
              AY
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">AceYourExam Student</h3>
            <p className="text-xs text-slate-400 mb-4">Web Edition User</p>
            
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 text-xs text-left mb-6 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Device / Browser:</span>
                <span className="font-semibold text-slate-800 dark:text-white">Supported (Apple iOS/Web)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Database Sync:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">● Live (Firebase)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Saved Bookmarks:</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">{bookmarkedQuestions.length} Questions</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Unlocked Tests:</span>
                <span className="font-semibold text-brand-600 dark:text-brand-400">{unlockedIds.size}</span>
              </div>
            </div>

            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
