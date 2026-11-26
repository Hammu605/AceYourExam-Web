import {
  db,
  auth,
  googleProvider,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  signInWithPopup,
  signInWithRedirect
} from '../firebase';

export const DINO_CHARACTERS = [
  { id: 1, name: 'Razz', img: './assets/dino_char1_main.png', diamondPrice: 100, desc: 'Energetic Speed-Runner' },
  { id: 2, name: 'Hammu', img: './assets/dino_char2_main.png', diamondPrice: 200, desc: 'Wise Strategy Master' },
  { id: 3, name: 'Ladki', img: './assets/dino_char3_main.png', diamondPrice: 300, desc: 'Accuracy Queen' },
  { id: 4, name: 'Dino Champ', img: './assets/dino_char4_main.png', diamondPrice: 400, desc: 'Top Ranker Legend' }
];

export function getDinoById(id) {
  return DINO_CHARACTERS.find(d => d.id === Number(id)) || DINO_CHARACTERS[0];
}

export function getTodayDateKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export async function signInWithGoogleiOSFriendly() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    const code = err?.code || '';
    if (
      code === 'auth/popup-blocked' ||
      code === 'auth/operation-not-supported-in-this-environment' ||
      code === 'auth/cancelled-popup-request'
    ) {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    throw err;
  }
}

export async function resolveOrCreateUserDoc(firebaseUser) {
  if (!firebaseUser) return null;
  const rawEmail = (firebaseUser.email || '').trim();
  const lowercaseEmail = rawEmail.toLowerCase();
  const authUid = firebaseUser.uid;
  const displayName = firebaseUser.displayName || (rawEmail ? rawEmail.split('@')[0] : 'Student');
  const photoUrl = firebaseUser.photoURL || '';

  let matchedUid = null;
  let existingData = null;

  // 1. Match by lowercaseEmail
  if (lowercaseEmail) {
    const qEmail = query(collection(db, 'users'), where('lowercaseEmail', '==', lowercaseEmail));
    const snapEmail = await getDocs(qEmail);
    if (!snapEmail.empty) {
      matchedUid = snapEmail.docs[0].id;
      existingData = snapEmail.docs[0].data();
    } else {
      const qRawEmail = query(collection(db, 'users'), where('email', '==', rawEmail));
      const snapRaw = await getDocs(qRawEmail);
      if (!snapRaw.empty) {
        matchedUid = snapRaw.docs[0].id;
        existingData = snapRaw.docs[0].data();
      }
    }
  }

  // 2. Match by authUid
  if (!matchedUid) {
    const qAuth = query(collection(db, 'users'), where('authUid', '==', authUid));
    const snapAuth = await getDocs(qAuth);
    if (!snapAuth.empty) {
      matchedUid = snapAuth.docs[0].id;
      existingData = snapAuth.docs[0].data();
    }
  }

  // 3. Assign sequential numeric UID if brand new (matches Android AppRepository)
  if (!matchedUid) {
    try {
      const allUsersSnap = await getDocs(collection(db, 'users'));
      let maxId = 0;
      allUsersSnap.docs.forEach(d => {
        const n = parseInt(d.id, 10);
        if (!Number.isNaN(n) && n > maxId && n < 999999) {
          maxId = n;
        }
      });
      matchedUid = String(maxId + 1);
    } catch (_) {
      matchedUid = String(Math.floor(100000 + Math.random() * 899999));
    }
  }

  const baseProfile = existingData
    ? {
        authUid,
        uid: matchedUid,
        email: rawEmail || existingData.email || '',
        lowercaseEmail: lowercaseEmail || existingData.lowercaseEmail || '',
        displayName: existingData.displayName || displayName,
        name: existingData.name || displayName,
        photoUrl: photoUrl || existingData.photoUrl || '',
        aceYourExamLoggedIn: true,
        isLoggedIn: true,
        loggedInApps: arrayUnion('AceYourExam'),
        lastLoginAt: serverTimestamp(),
        updatedAt: Date.now()
      }
    : {
        uid: matchedUid,
        authUid,
        email: rawEmail,
        lowercaseEmail,
        displayName,
        name: displayName,
        handle: `@${displayName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12) || 'student'}${matchedUid}`,
        handleLower: `@${displayName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12) || 'student'}${matchedUid}`,
        photoUrl,
        diamonds: 100,
        streak: 0,
        streakProtectors: 1,
        selectedDinoId: 1,
        unlockedDinos: [1],
        unlockedIds: [],
        totalStudySeconds: 0,
        dailyTargetMinutes: 60,
        xp: 0,
        appName: 'AceYourExam',
        isAceYourExamRegistered: true,
        aceYourExamRegistered: true,
        aceYourExamLoggedIn: true,
        isLoggedIn: true,
        registeredApps: arrayUnion('AceYourExam'),
        loggedInApps: arrayUnion('AceYourExam'),
        lastLoginAt: serverTimestamp(),
        updatedAt: Date.now()
      };

  await setDoc(doc(db, 'users', matchedUid), baseProfile, { merge: true });

  if (lowercaseEmail) {
    try {
      await setDoc(
        doc(db, 'user_access_control', lowercaseEmail),
        {
          uid: matchedUid,
          email: rawEmail,
          lowercaseEmail,
          name: baseProfile.name,
          displayName: baseProfile.displayName,
          photoUrl: baseProfile.photoUrl,
          aceYourExamLoggedIn: true,
          isLoggedIn: true,
          lastLoginAt: serverTimestamp(),
          updatedAt: Date.now()
        },
        { merge: true }
      );
    } catch (_) {}
  }

  return { uid: matchedUid, data: { ...(existingData || {}), ...baseProfile } };
}

export async function syncLogoutToFirestore(uid, email) {
  const lowercaseEmail = (email || '').trim().toLowerCase();
  const payload = {
    aceYourExamLoggedIn: false,
    isLoggedIn: false,
    loggedInApps: arrayRemove('AceYourExam'),
    lastLogoutAt: serverTimestamp()
  };
  try {
    if (uid) await setDoc(doc(db, 'users', uid), payload, { merge: true });
    if (lowercaseEmail) await setDoc(doc(db, 'user_access_control', lowercaseEmail), payload, { merge: true });
  } catch (_) {}
}

export function subscribeAccessControl(email, uid, onChange) {
  const unsubs = [];
  const state = { uac: null, banned: null, user: null };
  const evaluate = () => {
    const merged = { ...state.user, ...state.uac, ...state.banned };
    const isBanned = Boolean(merged.isBanned || merged.banned || merged.status === 'banned' || state.banned?.exists);
    const isSuspended = Boolean(merged.isSuspended || merged.suspended || merged.status === 'suspended');
    const reason = merged.banReason || merged.suspendReason || merged.reason || 'Access restricted by administrator.';
    onChange({ isBanned, isSuspended, reason });
  };

  const lower = (email || '').trim().toLowerCase();
  if (lower) {
    unsubs.push(
      onSnapshot(doc(db, 'user_access_control', lower), (snap) => {
        state.uac = snap.exists() ? snap.data() : null;
        evaluate();
      }, () => {})
    );
    unsubs.push(
      onSnapshot(doc(db, 'banned_users', lower), (snap) => {
        state.banned = snap.exists() ? { exists: true, ...snap.data() } : null;
        evaluate();
      }, () => {})
    );
  }
  if (uid) {
    unsubs.push(
      onSnapshot(doc(db, 'users', uid), (snap) => {
        state.user = snap.exists() ? snap.data() : null;
        evaluate();
      }, () => {})
    );
  }

  return () => unsubs.forEach(u => u());
}

export async function pushTestAttemptToFirestore(uid, attemptRecord) {
  if (!uid || !attemptRecord?.attemptId) return;
  const payload = {
    ...attemptRecord,
    userId: uid,
    timestamp: Date.now(),
    updatedAt: serverTimestamp()
  };
  try {
    await Promise.allSettled([
      setDoc(doc(db, 'users', uid, 'test_attempts', attemptRecord.attemptId), payload, { merge: true }),
      setDoc(doc(db, 'user_attempts', attemptRecord.attemptId), payload, { merge: true }),
      setDoc(doc(db, 'leaderboard', attemptRecord.attemptId), payload, { merge: true }),
      updateDoc(doc(db, 'users', uid), {
        xp: increment(Math.max(10, Math.round((attemptRecord.score || 0) * 5))),
        testsAttempted: increment(1),
        updatedAt: Date.now()
      })
    ]);
  } catch (err) {
    console.warn('pushTestAttemptToFirestore error:', err);
  }
}

export async function recordStudySessionToFirestore(uid, seconds, diamondsEarned = 0) {
  if (!uid || seconds <= 0) return;
  const dateKey = getTodayDateKey();
  try {
    await Promise.allSettled([
      setDoc(
        doc(db, 'users', uid, 'daily_study', dateKey),
        {
          date: dateKey,
          seconds: increment(seconds),
          sessions: increment(1),
          diamondsEarned: increment(diamondsEarned),
          updatedAt: Date.now()
        },
        { merge: true }
      ),
      setDoc(
        doc(db, 'users', uid),
        {
          totalStudySeconds: increment(seconds),
          diamonds: increment(diamondsEarned),
          xp: increment(Math.max(5, Math.round(seconds / 60) * 2)),
          lastStudyDate: dateKey,
          updatedAt: Date.now()
        },
        { merge: true }
      )
    ]);
  } catch (err) {
    console.warn('recordStudySessionToFirestore error:', err);
  }
}
