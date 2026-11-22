import React from 'react';
import { Lock, Sparkles, Check, AlertCircle, X, ShieldCheck } from 'lucide-react';

export default function UnlockModal({ isOpen, onClose, targetItem, diamonds, onConfirmUnlock, onAddFreeBonus }) {
  if (!isOpen || !targetItem) return null;

  const cost = targetItem.diamondPrice || targetItem.diamondsRequired || 100;
  const rupeeCost = targetItem.price || targetItem.priceInr || 199;
  const hasEnoughDiamonds = diamonds >= cost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-extrabold text-slate-900 text-center mb-1">
          Unlock Test Series
        </h3>
        <p className="text-xs text-slate-500 text-center mb-6">
          {targetItem.title || targetItem.name}
        </p>

        {/* Pricing Box */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-900">Unlock Fee:</span>
            <span className="text-lg font-black text-amber-900 flex items-center gap-1">
              <span>💎</span> {cost} Diamonds
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-amber-200/60 text-xs">
            <span className="text-slate-600">Your Current Balance:</span>
            <span className={`font-bold flex items-center gap-1 ${hasEnoughDiamonds ? 'text-emerald-700' : 'text-rose-600'}`}>
              <span>💎</span> {diamonds} Diamonds
            </span>
          </div>
        </div>

        {/* Action Button */}
        {hasEnoughDiamonds ? (
          <button
            onClick={() => onConfirmUnlock(targetItem, cost)}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl text-sm font-extrabold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-amber-300 text-amber-300" />
            <span>Confirm & Unlock Instantly</span>
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>You need {cost - diamonds} more diamonds to unlock this series.</span>
            </div>

            <button
              onClick={onAddFreeBonus}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🎁 Claim +200 Welcome Bonus Diamonds</span>
            </button>
          </div>
        )}

        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700"
          >
            Cancel and Return
          </button>
        </div>

      </div>
    </div>
  );
}
