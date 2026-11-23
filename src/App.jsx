import React, { useState, useEffect, useMemo } from 'react';
import TopAppBar from './components/TopAppBar';
import AppDrawer from './components/AppDrawer';
import BottomNavBar, { APP_TABS } from './components/BottomNavBar';
import HomeScreen from './components/HomeScreen';
import ExamTestsListScreen from './components/ExamTestsListScreen';
import FocusScreen from './components/FocusScreen';
import WorldScreen from './components/WorldScreen';
import ChatScreen from './components/ChatScreen';
import YouScreen from './components/YouScreen';
import PreExamInstructionsModal from './components/PreExamInstructionsModal';
import MockTestRunner from './components/MockTestRunner';
import TestResultView from './components/TestResultView';
import UnlockModal from './components/UnlockModal';
import BookmarksModal from './components/BookmarksModal';
import { db, collection, onSnapshot } from './firebase';
import { normalizeMakerXPath } from './utils';
import { RefreshCw, X } from 'lucide-react';

export default function App() {
  // Navigation & Tab State
  const [currentTab, setCurrentTab] = useState(APP_TABS.HOME);
  const [activeExam, setActiveExam] = useState(null);
  const [preExamTarget, setPreExamTarget] = useState(null);
  const [activeTest, setActiveTest] = useState(null);
  const [testResult, setTestResult] = useState(null);

  // App Shell Modals
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDiamondsModalOpen, setIsDiamondsModalOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [unlockTarget, setUnlockTarget] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // User persistent state
  const [diamonds, setDiamonds] = useState(() => {
    const saved = localStorage.getItem('user_diamonds');
    return saved ? parseInt(saved, 10) : 100;
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

  // Firestore Data
  const [appDirectoryDocs, setAppDirectoryDocs] = useState([]);
  const [testsDocs, setTestsDocs] = useState([]);
  const [pricingControlDocs, setPricingControlDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('user_diamonds', diamonds.toString());
  }, [diamonds]);

  useEffect(() => {
    localStorage.setItem('unlocked_ids', JSON.stringify(Array.from(unlockedIds)));
  }, [unlockedIds]);

  useEffect(() => {
    localStorage.setItem('bookmarked_questions', JSON.stringify(bookmarkedQuestions));
  }, [bookmarkedQuestions]);

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

    const unsubAppDir = onSnapshot(collection(db, 'app_directory'), (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAppDirectoryDocs(docs);
    }, (err) => console.warn("app_directory:", err));

    const unsubTests = onSnapshot(collection(db, 'tests'), (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTestsDocs(docs);
      setLoading(false);
    }, (err) => console.warn("tests:", err));

    const unsubPricing = onSnapshot(collection(db, 'test_pricing_control'), (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPricingControlDocs(docs);
    }, (err) => console.warn("pricing:", err));

    return () => {
      unsubAppDir();
      unsubTests();
      unsubPricing();
    };
  }, []);

  // Merge tests with live pricing controls
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
        setPreExamTarget(found);
      }
    }
  }, [loading, allTests]);

  // Bookmark actions
  const bookmarkedIdsSet = useMemo(() => {
    return new Set(bookmarkedQuestions.map(b => b.id));
  }, [bookmarkedQuestions]);

  const handleToggleBookmark = (item) => {
    setBookmarkedQuestions(prev => {
      const exists = prev.some(b => b.id === item.id);
      return exists ? prev.filter(b => b.id !== item.id) : [item, ...prev];
    });
  };

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

  // If Test Runner is Active
  if (activeTest) {
    return (
      <MockTestRunner
        test={activeTest}
        initialLang={activeTest.selectedLang || 'English'}
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
        currentLang="English"
        bookmarkedIds={bookmarkedIdsSet}
        onBookmarkToggle={handleToggleBookmark}
        onRetake={() => {
          const toRetake = testResult.test;
          setTestResult(null);
          setPreExamTarget(toRetake);
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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors select-none">
      
      {/* 1. Top App Bar (Matching Android MainAppScreen.kt) */}
      <TopAppBar
        onMenuClick={() => setIsDrawerOpen(true)}
        streakCount={1}
        diamonds={diamonds}
        onDiamondsClick={() => setIsDiamondsModalOpen(true)}
        onSearchClick={() => setIsSearching(prev => !prev)}
        isSearching={isSearching}
      />

      {/* 2. Side Navigation Drawer */}
      <AppDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        diamonds={diamonds}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(prev => !prev)}
        onOpenDiamonds={() => setIsDiamondsModalOpen(true)}
        onOpenStudyTarget={() => setCurrentTab(APP_TABS.FOCUS)}
      />

      {/* 3. Main Views Area */}
      <main className="flex-1 w-full">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-[#16A34A] mb-3" />
            <p className="text-sm font-semibold">Connecting to AceYourExam Cloud...</p>
          </div>
        ) : (
          <>
            {/* If Exam is Selected -> Show ExamTestsListScreen */}
            {activeExam ? (
              <ExamTestsListScreen
                exam={activeExam}
                onBack={() => setActiveExam(null)}
                allFolders={appDirectoryDocs}
                allTests={allTests}
                unlockedIds={unlockedIds}
                onStartTestPreExam={(t) => setPreExamTarget(t)}
                onUnlockItem={(item) => setUnlockTarget(item)}
              />
            ) : (
              <>
                {/* 5 Main Bottom Tabs */}
                {currentTab === APP_TABS.HOME && (
                  <HomeScreen
                    allFolders={appDirectoryDocs}
                    allTests={allTests}
                    diamonds={diamonds}
                    onSelectExam={(exam) => setActiveExam(exam)}
                  />
                )}

                {currentTab === APP_TABS.FOCUS && (
                  <FocusScreen
                    diamonds={diamonds}
                    onRewardDiamonds={(amt) => setDiamonds(prev => prev + amt)}
                    studyStreak={1}
                  />
                )}

                {currentTab === APP_TABS.WORLD && (
                  <WorldScreen />
                )}

                {currentTab === APP_TABS.CHAT && (
                  <ChatScreen />
                )}

                {currentTab === APP_TABS.YOU && (
                  <YouScreen
                    diamonds={diamonds}
                    onOpenDiamonds={() => setIsDiamondsModalOpen(true)}
                    streakCount={1}
                    unlockedCount={unlockedIds.size}
                    bookmarkedCount={bookmarkedQuestions.length}
                    onOpenBookmarks={() => setIsBookmarksOpen(true)}
                    isDarkMode={isDarkMode}
                    onToggleDarkMode={() => setIsDarkMode(prev => !prev)}
                  />
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* 4. Bottom Navigation Bar (Fixed 5 Tabs) */}
      {!activeTest && !testResult && (
        <BottomNavBar
          activeTab={currentTab}
          onTabSelect={(tab) => {
            setActiveExam(null); // Return to root when switching tabs
            setCurrentTab(tab);
          }}
        />
      )}

      {/* Pre-Exam Instructions Modal */}
      <PreExamInstructionsModal
        isOpen={!!preExamTarget}
        test={preExamTarget}
        onClose={() => setPreExamTarget(null)}
        onConfirmStart={(t, lang) => {
          setPreExamTarget(null);
          setActiveTest({ ...t, selectedLang: lang });
        }}
      />

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

      {/* Revision Bookmarks Modal */}
      <BookmarksModal
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarkedQuestions={bookmarkedQuestions}
        onRemoveBookmark={(id) => setBookmarkedQuestions(prev => prev.filter(b => b.id !== id))}
      />

      {/* Diamond Store Modal */}
      {isDiamondsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 text-center relative border border-slate-100 dark:border-slate-800 shadow-2xl">
            <button 
              onClick={() => setIsDiamondsModalOpen(false)} 
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3 text-3xl">
              💎
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">Diamond Store</h3>
            <div className="text-3xl font-black text-amber-900 dark:text-amber-400 my-2">{diamonds} 💎</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Use diamonds to unlock paid mock tests and comprehensive test series.
            </p>
            <button
              onClick={() => {
                setDiamonds(prev => prev + 100);
                alert("💎 Claimed +100 Daily Free Diamonds!");
                setIsDiamondsModalOpen(false);
              }}
              className="w-full py-3 bg-gradient-to-r from-[#0F4739] to-[#16A34A] text-white font-extrabold rounded-xl text-sm shadow-md active:scale-95 transition-all cursor-pointer"
            >
              Claim +100 Daily Free Diamonds
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
