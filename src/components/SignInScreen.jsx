import React, { useState } from 'react';
import { Sparkles, ShieldAlert, LogIn, UserCheck, Smartphone, Loader2 } from 'lucide-react';
import { signInWithGoogleiOSFriendly } from '../services/userSync';

export function AccessBlockedScreen({ reason, isBanned, onSignOut }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-red-500/20 border-2 border-red-500 flex items-center justify-center mb-5">
        <ShieldAlert className="w-10 h-10 text-red-400" />
      </div>
      <h1 className="font-pixelTitle text-base text-red-400 mb-3">
        {isBanned ? 'ACCOUNT BANNED' : 'ACCOUNT SUSPENDED'}
      </h1>
      <p className="text-sm text-slate-300 max-w-sm leading-relaxed mb-6">
        {reason || 'Your account access has been restricted by AceYourExam Admin.'}
      </p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <a
          href="./faqs.html"
          className="py-3 px-4 rounded-2xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 hover:bg-slate-700"
        >
          Contact Support / FAQs
        </a>
        <button
          onClick={onSignOut}
          className="py-3 px-4 rounded-2xl bg-red-600 text-xs font-bold text-white hover:bg-red-700"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default function SignInScreen({ onContinueAsGuest, onSignedIn }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const user = await signInWithGoogleiOSFriendly();
      if (user && onSignedIn) {
        onSignedIn(user);
      }
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Google Sign-In failed. Please try again or continue as Guest.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-ace-green-light via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col items-center justify-between p-6 pt-safe pb-safe">
      <div className="w-full max-w-md flex flex-col items-center pt-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ace-green/10 border border-ace-green/25 text-ace-green text-[11px] font-extrabold uppercase tracking-wider mb-5">
          <Sparkles className="w-3.5 h-3.5" />
          iOS & Web Edition
        </div>

        <div className="relative w-36 h-36 rounded-[32px] bg-white dark:bg-slate-800 border-2 border-ace-green/30 shadow-xl flex items-center justify-center p-3 mb-5">
          <img
            src="./assets/dino_char1_main.png"
            alt="AceYourExam Dino"
            className="w-full h-full object-contain drop-shadow-md"
          />
          <img
            src="./assets/ic_aye_stamp.png"
            alt="AYE"
            className="w-10 h-10 object-contain absolute -bottom-3 -right-3 rotate-12"
          />
        </div>

        <h1 className="font-pixelTitle text-lg text-slate-900 dark:text-white tracking-tight text-center mb-2">
          AceYourExam
        </h1>
        <p className="font-pixel text-xl text-ace-green text-center mb-2">
          LEVEL UP YOUR EXAM PREP
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-xs leading-relaxed">
          Sign in with your Google account to sync your Diamonds, Streaks, Dino Mascots, and Test Progress across Android & iPhone.
        </p>
      </div>

      <div className="w-full max-w-md space-y-3 my-6">
        {error && (
          <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-xs font-semibold text-red-600 dark:text-red-300 text-center">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="bouncy-tap w-full py-3.5 px-5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-md hover:border-ace-green flex items-center justify-center gap-3 text-sm font-extrabold text-slate-800 dark:text-white disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-ace-green" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z" />
              <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z" />
            </svg>
          )}
          <span>{loading ? 'Connecting to Google...' : 'Continue with Google'}</span>
        </button>

        <button
          onClick={onContinueAsGuest}
          disabled={loading}
          className="bouncy-tap w-full py-3.5 px-5 rounded-2xl bg-ace-green hover:bg-green-700 text-white font-extrabold text-sm shadow-lg shadow-ace-green/25 flex items-center justify-center gap-2"
        >
          <UserCheck className="w-4 h-4" />
          <span>Continue as Guest</span>
        </button>

        <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800/60 flex items-start gap-3">
          <Smartphone className="w-5 h-5 text-ace-sky shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            <strong className="text-slate-800 dark:text-white">iPhone Tip:</strong> Safari mein <strong>Share → Add to Home Screen</strong> tap karein taaki yeh bilkul native iOS app ki tarah full-screen chale!
          </p>
        </div>
      </div>

      <div className="text-[11px] text-slate-400 flex items-center gap-3 pb-2">
        <a href="./privacy-policy.html" className="hover:text-ace-green underline">Privacy Policy</a>
        <span>•</span>
        <a href="./terms.html" className="hover:text-ace-green underline">Terms</a>
        <span>•</span>
        <a href="./faqs.html" className="hover:text-ace-green underline">FAQs</a>
      </div>
    </div>
  );
}
