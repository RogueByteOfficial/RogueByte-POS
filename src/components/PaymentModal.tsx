import React, { useState } from 'react';
import {
  Banknote,
  CheckCircle,
  CreditCard,
  DollarSign,
  Layers,
  QrCode,
  User,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { PaymentDetails, PaymentMethod } from '../types/pos';
import { formatOMR } from '../utils/formatters';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
  const { cartTotal, completePayment, t, language } = usePOS();

  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [cashTendered, setCashTendered] = useState<number>(cartTotal);
  const [cardType, setCardType] = useState<string>('Visa');
  
  // Split payment state
  const [splitCash, setSplitCash] = useState<number>(Number((cartTotal / 2).toFixed(3)));
  const [splitCard, setSplitCard] = useState<number>(Number((cartTotal - cartTotal / 2).toFixed(3)));

  // Customer & notes
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [creditDueDate, setCreditDueDate] = useState<string>(
    new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  // Change calculation
  const changeDue = Math.max(0, Number((cashTendered - cartTotal).toFixed(3)));

  // Preset quick cash denominations for Oman
  const quickCashOptions = [
    { label: t.exactAmount, value: cartTotal },
    { label: '1.000 ر.ع.', value: 1.0 },
    { label: '5.000 ر.ع.', value: 5.0 },
    { label: '10.000 ر.ع.', value: 10.0 },
    { label: '20.000 ر.ع.', value: 20.0 },
    { label: '50.000 ر.ع.', value: 50.0 },
  ];

  const handleSplitCashChange = (val: number) => {
    const cashVal = Math.max(0, val);
    setSplitCash(cashVal);
    setSplitCard(Number(Math.max(0, cartTotal - cashVal).toFixed(3)));
  };

  const handleConfirm = () => {
    const details: PaymentDetails = {
      method,
      transactionRef: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    if (method === 'cash') {
      details.cashTendered = cashTendered;
      details.changeAmount = changeDue;
    } else if (method === 'card') {
      details.cardType = cardType;
      details.cardAuthCode = `AUTH-${Math.floor(1000 + Math.random() * 9000)}`;
    } else if (method === 'split') {
      details.splitCash = splitCash;
      details.splitCard = splitCard;
    } else if (method === 'credit') {
      details.creditCustomerName = customerName;
      details.creditCustomerPhone = customerPhone;
      details.creditDueDate = creditDueDate;
    }

    completePayment(details, customerName, customerPhone, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">{t.paymentTitle}</h3>
              <p className="text-xs text-slate-400">
                {t.grandTotal}: <span className="font-mono font-bold text-amber-400 text-sm">{formatOMR(cartTotal, language)}</span>
              </p>
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
          {/* Payment Method Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setMethod('cash')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                method === 'cash'
                  ? 'border-amber-500 bg-amber-500/15 text-amber-300 font-bold shadow-sm'
                  : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Banknote className="w-5 h-5 mb-1.5" />
              <span className="text-xs truncate">{t.payMethodCash}</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod('card')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                method === 'card'
                  ? 'border-amber-500 bg-amber-500/15 text-amber-300 font-bold shadow-sm'
                  : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <CreditCard className="w-5 h-5 mb-1.5" />
              <span className="text-xs truncate">{t.payMethodCard}</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod('split')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                method === 'split'
                  ? 'border-amber-500 bg-amber-500/15 text-amber-300 font-bold shadow-sm'
                  : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Layers className="w-5 h-5 mb-1.5" />
              <span className="text-xs truncate">{t.payMethodSplit}</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod('credit')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                method === 'credit'
                  ? 'border-amber-500 bg-amber-500/15 text-amber-300 font-bold shadow-sm'
                  : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Users className="w-5 h-5 mb-1.5" />
              <span className="text-xs truncate">{t.payMethodCredit}</span>
            </button>
          </div>

          {/* Method 1: Cash Details */}
          {method === 'cash' && (
            <div className="space-y-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  {t.cashTendered} ({t.currency}):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.050"
                    min={cartTotal}
                    value={cashTendered}
                    onChange={(e) => setCashTendered(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-lg font-bold focus:outline-hidden focus:border-amber-500"
                  />
                  <span className="absolute right-4 rtl:left-4 rtl:right-auto top-1/2 -translate-y-1/2 text-xs text-slate-500 font-bold">
                    {t.currency}
                  </span>
                </div>
              </div>

              {/* Quick Cash Buttons */}
              <div>
                <span className="block text-[11px] text-slate-400 mb-1.5 font-medium">
                  {t.quickCash}:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {quickCashOptions.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCashTendered(opt.value)}
                      className="py-2 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-semibold border border-slate-700 transition-colors"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Change calculation box */}
              <div className="flex items-center justify-between p-3.5 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-xs font-medium text-slate-400">{t.changeDue}:</span>
                <span className="font-mono text-base font-black text-emerald-400">
                  {formatOMR(changeDue, language)}
                </span>
              </div>
            </div>
          )}

          {/* Method 2: Card Details */}
          {method === 'card' && (
            <div className="space-y-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-center py-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2">
                  <CreditCard className="w-6 h-6" />
                </div>
                <p className="text-xs text-slate-300 font-semibold">
                  {language === 'ar' ? 'جاهز لاستقبال البطاقة عبر جهاز نقاط البيع POS' : 'Ready for POS Card Swipe/Tap'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {language === 'ar' ? 'يدعم بطاقات الخصم المباشر وفيزا وماستركارد ومحافظ الدفع الإلكتروني' : 'Supports debit cards, Visa, MasterCard & Apple Pay'}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2">
                {['Visa', 'MasterCard', 'Debit (عُمان)'].map((card) => (
                  <button
                    key={card}
                    type="button"
                    onClick={() => setCardType(card)}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      cardType === card
                        ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    {card}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Method 3: Split Payment */}
          {method === 'split' && (
            <div className="space-y-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    {t.splitCashAmount}:
                  </label>
                  <input
                    type="number"
                    step="0.050"
                    value={splitCash}
                    onChange={(e) => handleSplitCashChange(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    {t.splitCardAmount}:
                  </label>
                  <input
                    type="number"
                    step="0.050"
                    value={splitCard}
                    onChange={(e) => setSplitCard(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-sm font-bold"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center text-xs p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-400">{t.remainingToPay}:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {formatOMR(Math.max(0, cartTotal - (splitCash + splitCard)), language)}
                </span>
              </div>
            </div>
          )}

          {/* Method 4: Credit / On-Account */}
          {method === 'credit' && (
            <div className="space-y-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    {t.customerName} <span className="text-amber-400">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={language === 'ar' ? 'مثال: محمد العمري' : 'e.g. Mohammed'}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    {t.customerPhone}:
                  </label>
                  <input
                    type="tel"
                    placeholder="+968 9123 4567"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  {t.creditDueDate}:
                </label>
                <input
                  type="date"
                  value={creditDueDate}
                  onChange={(e) => setCreditDueDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono"
                />
              </div>
            </div>
          )}

          {/* Optional Customer Info & Notes */}
          {method !== 'credit' && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  {t.customerName}:
                </label>
                <input
                  type="text"
                  placeholder={language === 'ar' ? 'عميل نقدي' : 'Cash Customer'}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  {t.orderNotes}:
                </label>
                <input
                  type="text"
                  placeholder={language === 'ar' ? 'ملاحظة خاصة...' : 'Order notes...'}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors"
          >
            {t.cancel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-lg shadow-amber-500/20"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{t.confirmPayment}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
