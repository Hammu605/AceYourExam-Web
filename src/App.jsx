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
import SignInScreen, { AccessBlockedScreen } from './components/SignInScreen';
import AttemptedTestsScreen from './components/AttemptedTestsScreen';
import {
  NoticeBoardModal,
  SetTargetModal,
  StreakCalendarModal,
  VideoSessionsModal,
  PdfViewerModal
} from './components/AuxiliaryModals';
import {
  db,
  auth,
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  arrayUnion,
  increment,
  onAuthStateChanged,
  getRedirectResult,
  signOut
} from './firebase';
import {
  resolveOrCreateUserDoc,
  syncLogoutToFirestore,
  subscribeAccessControl,
  pushTestAttemptToFirestore,
  recordStudySessionToFirestore,
  getTodayDateKey
} from './services/userSync';
import { RefreshCw, X, Search } from 'lucide-react';

export default function App() {
  // Auth & Sync State
  const [authReady, setAuthReady] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem('ace_guest_mode') === 'true');
  const [showSignInOverlay, setShowSignInOverlay] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [accessBlock, setAccessBlock] = useState({ isBanned: false, isSuspended: false, reason: '' });

  // Navigation & Tab State
  const [currentTab, setCurrentTab] = useState(APP_TABS.HOME);
  const [activeExam, setActiveExam] = useState(null);
  const [showAttemptedScreen, setShowAttemptedScreen] = useState(false);
  const [preExamTarget, setPreExamTarget] = useState(null);
  const [activeTest, setActiveTest] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [directChatTarget, setDirectChatTarget] = useState(null);

  // App Shell Modals
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDiamondsModalOpen, setIsDiamondsModalOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isNoticeBoardOpen, setIsNoticeBoardOpen] = useState(false);
  const [isSetTargetOpen, setIsSetTargetOpen] = useState(false);
  const [isStreakCalendarOpen, setIsStreakCalendarOpen] = useState(false);
  const [isVideoSessionsOpen, setIsVideoSessionsOpen] = useState(false);
  const [activePdf, setActivePdf] = useState(null);
  const [unlockTarget, setUnlockTarget] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Local fallback persistent state (synced with Firestore when logged in)
  const [diamonds, setDiamonds] = useState(() => {
    const saved = localStorage.getItem('user_diamonds');
    return saved ? parseInt(saved, 10) : 100;
  });
  const [streakCount, setStreakCount] = useState(1);
  const [selectedDinoId, setSelectedDinoId] = useState(1);
  const [unlockedDinos, setUnlockedDinos] = useState([1]);

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
  const [homeBanners, setHomeBanners] = useState([]);
  const [attemptedTests, setAttemptedTests] = useState([]);
  const [dailyStudyMap, setDailyStudyMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Sync local storage
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

  // Firebase Auth listener + iOS Safari Redirect handling
  useEffect(() => {
    getRedirectResult(auth).catch(() => {});
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        setIsGuest(false);
        setShowSignInOverlay(false);
        localStorage.removeItem('ace_guest_mode');
        try {
          const resolved = await resolveOrCreateUserDoc(user);
          if (resolved) {
            setUserProfile({ uid: resolved.uid, ...resolved.data });
          }
        } catch (err) {
          console.warn('resolveOrCreateUserDoc error:', err);
        }
      } else {
        setUserProfile(null);
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // Realtime user profile + subcollections + ban check when signed in
  useEffect(() => {
    const uid = userProfile?.uid;
    if (!uid) return;

    const unsubUser = onSnapshot(doc(db, 'users', uid), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setUserProfile(prev => ({ ...prev, ...d, uid }));
        if (typeof d.diamonds === 'number') setDiamonds(d.diamonds);
        if (typeof d.streak === 'number') setStreakCount(d.streak);
        if (d.selectedDinoId) setSelectedDinoId(d.selectedDinoId);
        if (Array.isArray(d.unlockedDinos)) setUnlockedDinos(d.unlockedDinos);
        if (Array.isArray(d.unlockedIds)) {
          setUnlockedIds(prev => new Set([...Array.from(prev), ...d.unlockedIds]));
        }
      }
    }, () => {});

    const unsubAttempts = onSnapshot(collection(db, 'users', uid, 'test_attempts'), (snap) => {
      const list = snap.docs
        .map(d => ({ attemptId: d.id, ...d.data() }))
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setAttemptedTests(list);
    }, () => {});

    const unsubDaily = onSnapshot(collection(db, 'users', uid, 'daily_study'), (snap) => {
      const map = {};
      snap.docs.forEach(d => { map[d.id] = d.data(); });
      setDailyStudyMap(map);
    }, () => {});

    const unsubAccess = subscribeAccessControl(userProfile?.email || firebaseUser?.email, uid, setAccessBlock);

    return () => {
      unsubUser();
      unsubAttempts();
      unsubDaily();
      unsubAccess();
    };
  }, [userProfile?.uid, firebaseUser?.email]);

  // Realtime Catalog Listeners
  useEffect(() => {
    setLoading(true);
    const unsubAppDir = onSnapshot(collection(db, 'app_directory'), (snap) => {
      setAppDirectoryDocs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});

    const unsubTests = onSnapshot(collection(db, 'tests'), (snap) => {
      setTestsDocs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));

    const unsubPricing = onSnapshot(collection(db, 'test_pricing_control'), (snap) => {
      setPricingControlDocs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});

    const unsubBanners = onSnapshot(collection(db, 'home_banners'), (snap) => {
      setHomeBanners(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});

    return () => {
      unsubAppDir();
      unsubTests();
      unsubPricing();
      unsubBanners();
    };
  }, []);

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

  // Deep link `?testId=XYZ`
  useEffect(() => {
    if (loading || allTests.length === 0) return;
    const urlParams = new URLSearchParams(window.location.search);
    const directTestId = urlParams.get('testId');
    if (directTestId) {
      const found = allTests.find(t =>
        (t.id && t.id.toLowerCase() === directTestId.toLowerCase()) ||
        (t.documentId && t.documentId.toLowerCase() === directTestId.toLowerCase())
      );
      if (found) setPreExamTarget(found);
    }
  }, [loading, allTests]);

  const bookmarkedIdsSet = useMemo(() => new Set(bookmarkedQuestions.map(b => b.id)), [bookmarkedQuestions]);

  const handleToggleBookmark = (item) => {
    setBookmarkedQuestions(prev => {
      const exists = prev.some(b => b.id === item.id);
      return exists ? prev.filter(b => b.id !== item.id) : [item, ...prev];
    });
  };

  const syncDiamondsDelta = async (delta) => {
    setDiamonds(prev => prev + delta);
    if (userProfile?.uid) {
      try {
        await updateDoc(doc(db, 'users', userProfile.uid), { diamonds: increment(delta), updatedAt: Date.now() });
      } catch (_) {}
    }
  };

  const handleConfirmUnlock = async (item, cost) => {
    if (diamonds < cost) return;
    await syncDiamondsDelta(-cost);
    const newIds = [item.id, item.documentId, item.fullPath].filter(Boolean);
    setUnlockedIds(prev => {
      const next = new Set(prev);
      newIds.forEach(id => next.add(id));
      return next;
    });
    if (userProfile?.uid && newIds.length > 0) {
      try {
        await updateDoc(doc(db, 'users', userProfile.uid), { unlockedIds: arrayUnion(...newIds) });
      } catch (_) {}
    }
    setUnlockTarget(null);
  };

  const handleSelectOrBuyDino = async (dino) => {
    const isUnlocked = unlockedDinos.includes(dino.id) || dino.id === 1;
    if (isUnlocked) {
      setSelectedDinoId(dino.id);
      if (userProfile?.uid) {
        updateDoc(doc(db, 'users', userProfile.uid), { selectedDinoId: dino.id }).catch(() => {});
      }
      return;
    }
    if (diamonds < dino.diamondPrice) {
      alert(`Need 💎${dino.diamondPrice} Diamonds to unlock ${dino.name}! Earn free diamonds in the Focus tab.`);
      return;
    }
    await syncDiamondsDelta(-dino.diamondPrice);
    setUnlockedDinos(prev => [...new Set([...prev, dino.id])]);
    setSelectedDinoId(dino.id);
    if (userProfile?.uid) {
      updateDoc(doc(db, 'users', userProfile.uid), {
        unlockedDinos: arrayUnion(dino.id),
        selectedDinoId: dino.id
      }).catch(() => {});
    }
  };

  const handleSignOut = async () => {
    try {
      if (userProfile?.uid) {
        await syncLogoutToFirestore(userProfile.uid, userProfile.email || firebaseUser?.email);
      }
      await signOut(auth);
      localStorage.removeItem('ace_guest_mode');
      setIsGuest(false);
      setShowSignInOverlay(true);
    } catch (err) {
      console.warn('Sign out error:', err);
    }
  };

  const handleQuickAction = (actionId) => {
    if (actionId === 'notice_board') setIsNoticeBoardOpen(true);
    else if (actionId === 'focus') setCurrentTab(APP_TABS.FOCUS);
    else if (actionId === 'attempted_tests') setShowAttemptedScreen(true);
    else if (actionId === 'set_target') setIsSetTargetOpen(true);
    else if (actionId === 'video_sessions') setIsVideoSessionsOpen(true);
    else if (actionId === 'bookmarks') setIsBookmarksOpen(true);
  };

  // Show Splash while checking Auth
  if (!authReady) {
    return (
      <div className="min-h-screen bg-ace-bg dark:bg-slate-950 flex flex-col items-center justify-center p-6">
        <img src="./assets/dino_char1_main.png" alt="AceYourExam" className="w-24 h-24 object-contain animate-bounce mb-4" />
        <h1 className="font-pixelTitle text-sm text-ace-green">AceYourExam</h1>
      </div>
    );
  }

  // Enforce Admin Ban / Suspension
  if (accessBlock.isBanned || accessBlock.isSuspended) {
    return (
      <AccessBlockedScreen
        isBanned={accessBlock.isBanned}
        reason={accessBlock.reason}
        onSignOut={handleSignOut}
      />
    );
  }

  // Show Sign-In Screen if neither logged in nor guest
  if ((!firebaseUser && !isGuest) || showSignInOverlay) {
    return (
      <SignInScreen
        onContinueAsGuest={() => {
          localStorage.setItem('ace_guest_mode', 'true');
          setIsGuest(true);
          setShowSignInOverlay(false);
        }}
        onSignedIn={() => setShowSignInOverlay(false)}
      />
    );
  }

  // Active Mock Test Runner
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
          const attemptId = `att_${Date.now()}`;
          const record = {
            attemptId,
            testId: activeTest.id || '',
            testTitle: activeTest.title || activeTest.name || 'Mock Test',
            subject: activeTest.subject || activeTest.category || 'General',
            score: result.score ?? 0,
            maxMarks: result.maxMarks ?? result.totalQuestions ?? 0,
            totalQuestions: result.totalQuestions ?? 0,
            correctCount: result.correctCount ?? 0,
            wrongCount: result.wrongCount ?? 0,
            accuracy: result.accuracy ?? 0,
            timeTakenSeconds: result.timeTakenSeconds ?? 0,
            dateFormatted: new Date().toLocaleString()
          };
          if (userProfile?.uid) {
            pushTestAttemptToFirestore(userProfile.uid, record);
          }
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

  // Active Test Result View
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

  // Attempted Tests Screen
  if (showAttemptedScreen) {
    return (
      <AttemptedTestsScreen
        attempts={attemptedTests}
        allTests={allTests}
        onBack={() => setShowAttemptedScreen(false)}
        onReviewAttempt={(_, testObj) => {
          setShowAttemptedScreen(false);
          if (testObj) setPreExamTarget(testObj);
        }}
      />
    );
  }

  const todayStudySeconds = dailyStudyMap[getTodayDateKey()]?.seconds || 0;
  const searchResults = globalSearchQuery.trim()
    ? allTests.filter(t => (t.title || t.name || '').toLowerCase().includes(globalSearchQuery.toLowerCase())).slice(0, 15)
    : [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors select-none">
      <TopAppBar
        onMenuClick={() => setIsDrawerOpen(true)}
        streakCount={streakCount}
        diamonds={diamonds}
        onDiamondsClick={() => setIsDiamondsModalOpen(true)}
        onStreakClick={() => setIsStreakCalendarOpen(true)}
        onSearchClick={() => setIsSearching(prev => !prev)}
        isSearching={isSearching}
      />

      {/* Global Search Bar */}
      {isSearching && (
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                placeholder="Search any Mock Test, PYQ, or Subject..."
                className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ace-green"
              />
              {globalSearchQuery && (
                <button onClick={() => setGlobalSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {searchResults.length > 0 && (
              <div className="mt-2 max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                {searchResults.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setIsSearching(false);
                      setGlobalSearchQuery('');
                      setPreExamTarget(t);
                    }}
                    className="w-full px-3.5 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between"
                  >
                    <span className="text-xs font-bold text-slate-800 dark:text-white truncate">{t.title || t.name}</span>
                    <span className="text-[10px] font-extrabold text-ace-green ml-2 shrink-0">Start →</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <AppDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        diamonds={diamonds}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(prev => !prev)}
        onOpenDiamonds={() => setIsDiamondsModalOpen(true)}
        onOpenStudyTarget={() => setIsSetTargetOpen(true)}
      />

      <main className="flex-1 w-full">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-[#16A34A] mb-3" />
            <p className="text-sm font-semibold">Connecting to AceYourExam Cloud...</p>
          </div>
        ) : activeExam ? (
          <ExamTestsListScreen
            exam={activeExam}
            onBack={() => setActiveExam(null)}
            allFolders={appDirectoryDocs}
            allTests={allTests}
            unlockedIds={unlockedIds}
            onStartTestPreExam={(t) => setPreExamTarget(t)}
            onUnlockItem={(item) => setUnlockTarget(item)}
            onOpenPdf={(pdf) => setActivePdf(pdf)}
          />
        ) : (
          <>
            {currentTab === APP_TABS.HOME && (
              <HomeScreen
                allFolders={appDirectoryDocs}
                allTests={allTests}
                homeBanners={homeBanners}
                diamonds={diamonds}
                onSelectExam={(exam) => setActiveExam(exam)}
                onQuickAction={handleQuickAction}
              />
            )}

            {currentTab === APP_TABS.FOCUS && (
              <FocusScreen
                diamonds={diamonds}
                onRewardDiamonds={(amt) => {
                  syncDiamondsDelta(amt);
                  if (userProfile?.uid) {
                    recordStudySessionToFirestore(userProfile.uid, 1500, amt);
                  }
                }}
                studyStreak={streakCount}
              />
            )}

            {currentTab === APP_TABS.WORLD && (
              <WorldScreen
                currentUid={userProfile?.uid}
                onStartDirectChat={(peer) => {
                  setDirectChatTarget(peer);
                  setCurrentTab(APP_TABS.CHAT);
                }}
              />
            )}

            {currentTab === APP_TABS.CHAT && (
              <ChatScreen
                currentUid={userProfile?.uid}
                currentUserName={userProfile?.displayName || userProfile?.name || 'Scholar'}
                initialDirectTarget={directChatTarget}
                onClearDirectTarget={() => setDirectChatTarget(null)}
              />
            )}

            {currentTab === APP_TABS.YOU && (
              <YouScreen
                userProfile={userProfile}
                isGuest={isGuest || !firebaseUser}
                diamonds={diamonds}
                onOpenDiamonds={() => setIsDiamondsModalOpen(true)}
                streakCount={streakCount}
                unlockedCount={unlockedIds.size}
                bookmarkedCount={bookmarkedQuestions.length}
                attemptedCount={attemptedTests.length}
                selectedDinoId={selectedDinoId}
                unlockedDinos={unlockedDinos}
                onSelectOrBuyDino={handleSelectOrBuyDino}
                onOpenBookmarks={() => setIsBookmarksOpen(true)}
                onOpenAttemptedTests={() => setShowAttemptedScreen(true)}
                onOpenSetTarget={() => setIsSetTargetOpen(true)}
                onOpenStreakCalendar={() => setIsStreakCalendarOpen(true)}
                onSignIn={() => setShowSignInOverlay(true)}
                onSignOut={handleSignOut}
                isDarkMode={isDarkMode}
                onToggleDarkMode={() => setIsDarkMode(prev => !prev)}
              />
            )}
          </>
        )}
      </main>

      {!activeTest && !testResult && (
        <BottomNavBar
          activeTab={currentTab}
          onTabSelect={(tab) => {
            setActiveExam(null);
            setCurrentTab(tab);
          }}
        />
      )}

      <PreExamInstructionsModal
        isOpen={!!preExamTarget}
        test={preExamTarget}
        onClose={() => setPreExamTarget(null)}
        onConfirmStart={(t, lang) => {
          setPreExamTarget(null);
          setActiveTest({ ...t, selectedLang: lang });
        }}
      />

      <UnlockModal
        isOpen={!!unlockTarget}
        targetItem={unlockTarget}
        diamonds={diamonds}
        onClose={() => setUnlockTarget(null)}
        onConfirmUnlock={handleConfirmUnlock}
        onAddFreeBonus={() => {
          syncDiamondsDelta(200);
          alert('200 Welcome Bonus Diamonds Added to your balance!');
        }}
      />

      <BookmarksModal
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarkedQuestions={bookmarkedQuestions}
        onRemoveBookmark={(id) => setBookmarkedQuestions(prev => prev.filter(b => b.id !== id))}
      />

      <NoticeBoardModal isOpen={isNoticeBoardOpen} onClose={() => setIsNoticeBoardOpen(false)} />

      <SetTargetModal
        isOpen={isSetTargetOpen}
        onClose={() => setIsSetTargetOpen(false)}
        dailyTargetMinutes={userProfile?.dailyTargetMinutes || 60}
        todayStudySeconds={todayStudySeconds}
        onSaveTarget={(mins) => {
          setUserProfile(prev => (prev ? { ...prev, dailyTargetMinutes: mins } : prev));
          if (userProfile?.uid) {
            updateDoc(doc(db, 'users', userProfile.uid), { dailyTargetMinutes: mins }).catch(() => {});
          }
        }}
      />

      <StreakCalendarModal
        isOpen={isStreakCalendarOpen}
        onClose={() => setIsStreakCalendarOpen(false)}
        streak={streakCount}
        streakProtectors={userProfile?.streakProtectors || 0}
        dailyStudyMap={dailyStudyMap}
      />

      <VideoSessionsModal isOpen={isVideoSessionsOpen} onClose={() => setIsVideoSessionsOpen(false)} />

      <PdfViewerModal pdfItem={activePdf} onClose={() => setActivePdf(null)} />

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
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Diamonds bought on Android sync automatically when signed in with Google. On iPhone, earn free Diamonds via the Focus Timer!
            </p>
            <button
              onClick={() => {
                setIsDiamondsModalOpen(false);
                setCurrentTab(APP_TABS.FOCUS);
              }}
              className="w-full py-3 bg-gradient-to-r from-[#0F4739] to-[#16A34A] text-white font-extrabold rounded-xl text-sm shadow-md active:scale-95 transition-all cursor-pointer"
            >
              Earn Diamonds in Focus Timer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
