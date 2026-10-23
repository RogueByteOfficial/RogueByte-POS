import React, { useState } from 'react';
import { Delete, KeyRound, Lock, ShieldCheck, UserCheck, X } from 'lucide-react';
import { usePOS } from '../context/POSContext';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PinModal: React.FC<PinModalProps> = ({ isOpen, onClose }) => {
  const { t, switchStaffByPin, staffList, currentStaff, language } = usePOS();
  const [pin, setPin] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setErrorMessage('');
      // Auto-submit if 4 digits
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  const handleClear = () => {
    setPin('');
    setErrorMessage('');
  };

  const verifyPin = (pinToTest: string) => {
    const success = switchStaffByPin(pinToTest);
    if (success) {
      setPin('');
      setErrorMessage('');
      onClose();
    } else {
      setErrorMessage(t.invalidPin);
      setPin('');
    }
  };

  const handleQuickSelect = (pinCode: string) => {
    verifyPin(pinCode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">{t.switchUser}</h3>
              <p className="text-xs text-slate-400">{t.enterPin}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Active User Info */}
          <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400">{currentStaff.role === 'manager' ? t.manager : currentStaff.role === 'accountant' ? t.accountant : t.cashier}:</span>
            <span className="font-semibold text-amber-400">{language === 'ar' ? currentStaff.nameAr : currentStaff.nameEn}</span>
          </div>

          {/* PIN Input Dots */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-3">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full border-2 transition-all ${
                    pin.length > index
                      ? 'bg-amber-400 border-amber-400 scale-110 shadow-sm shadow-amber-500/50'
                      : 'border-slate-700 bg-slate-800/50'
                  }`}
                />
              ))}
            </div>
            {errorMessage && (
              <p className="text-rose-400 text-xs font-medium animate-pulse">{errorMessage}</p>
            )}
          </div>

          {/* Quick Staff Select Badges (For Fast Testing) */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">
              {language === 'ar' ? 'المستخدمون المتاحون (انقر للدخول المباشر):' : 'Available Staff (Click to Switch):'}
            </span>
            <div className="grid grid-cols-2 gap-2">
              {staffList.map((staff) => (
                <button
                  key={staff.id}
                  type="button"
                  onClick={() => handleQuickSelect(staff.pinCode)}
                  className={`flex flex-col p-2.5 rounded-xl border text-left rtl:text-right transition-all ${
                    currentStaff.id === staff.id
                      ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                      : 'border-slate-800 bg-slate-950/40 hover:bg-slate-800/80 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs truncate">
                      {language === 'ar' ? staff.nameAr : staff.nameEn}
                    </span>
                    {currentStaff.id === staff.id && <UserCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                    <span>
                      {staff.role === 'manager'
                        ? t.manager
                        : staff.role === 'accountant'
                        ? t.accountant
                        : t.cashier}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">PIN: {staff.pinCode}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Virtual Numpad */}
          <div className="grid grid-cols-3 gap-2 max-w-[260px] mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleDigit(digit)}
                className="h-12 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:bg-amber-600 text-white font-mono text-xl font-bold transition-colors border border-slate-700/50 shadow-sm"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="h-12 rounded-xl bg-slate-950/60 hover:bg-slate-800 text-slate-400 text-xs font-semibold transition-colors border border-slate-800"
            >
              C
            </button>
            <button
              type="button"
              onClick={() => handleDigit('0')}
              className="h-12 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:bg-amber-600 text-white font-mono text-xl font-bold transition-colors border border-slate-700/50 shadow-sm"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="h-12 rounded-xl bg-slate-950/60 hover:bg-slate-800 text-slate-400 flex items-center justify-center transition-colors border border-slate-800"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
