import React, { useState } from 'react';
import {
  Banknote,
  CheckCircle,
  CreditCard,
  DollarSign,
  Layers,
  Printer,
  QrCode,
  Smartphone,
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
  const [cardType, setCardType] = useState<string>('Debit (عُمان)');
  
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

  const handleConfirm = (openReceipt: boolean = true) => {
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
    } else if (method === 'mobile_pay') {
      details.transactionRef = `MB-${Math.floor(100000 + Math.random() * 900000)}`;
    }

    completePayment(details, customerName, customerPhone, notes, openReceipt);
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
        <div className="p-6 space-y-5">
          {/* Step guidance banner */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-center justify-between text-xs text-amber-300">
            <span className="font-medium">{t.selectPaymentMethodFirst}</span>
            <span className="font-mono font-bold bg-amber-500/20 px-2.5 py-0.5 rounded text-[11px]">
              {method === 'cash'
                ? t.payMethodCash
                : method === 'card'
                ? t.payMethodCard
                : method === 'split'
                ? t.payMethodSplit
                : method === 'credit'
                ? t.payMethodCredit
                : t.payMethodMobile}
            </span>
          </div>

          {/* Payment Method Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <button
              type="button"
              onClick={() => setMethod('cash')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
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
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
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
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
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
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                method === 'credit'
                  ? 'border-amber-500 bg-amber-500/15 text-amber-300 font-bold shadow-sm'
                  : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Users className="w-5 h-5 mb-1.5" />
              <span className="text-xs truncate">{t.payMethodCredit}</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod('mobile_pay')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                method === 'mobile_pay'
                  ? 'border-amber-500 bg-amber-500/15 text-amber-300 font-bold shadow-sm'
                  : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Smartphone className="w-5 h-5 mb-1.5" />
              <span className="text-xs truncate">{t.payMethodMobile}</span>
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
                      className="py-2 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
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
                {['Debit (عُمان)', 'Visa', 'MasterCard'].map((card) => (
                  <button
                    key={card}
                    type="button"
                    onClick={() => setCardType(card)}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      cardType === card
                        ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800'
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

          {/* Method 5: Mobile / QR Transfer */}
          {method === 'mobile_pay' && (
            <div className="space-y-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-white font-bold mb-1">
                  {language === 'ar' ? 'دفع عبر التحويل البنكي الفوري أو المحفظة الإلكترونية' : 'Instant Mobile Banking / QR Wallet Payment'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {language === 'ar' ? 'يدعم ثواني (Thawani)، بنك مسقط، وبنك ظفار والمحافظ المعتمدة' : 'Supports Thawani Pay, Bank Muscat, Meethaq & national mobile wallets'}
                </p>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs text-slate-300 font-mono">
                {language === 'ar' ? 'مرجع التحويل:' : 'Transfer Ref:'} TXN-{Math.floor(100000 + Math.random() * 900000)}
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

        {/* Footer with Distinct Print vs No-Print Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            {t.cancel}
          </button>
          
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {/* Complete Sale ONLY (without printing) */}
            <button
              type="button"
              onClick={() => handleConfirm(false)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer"
              title={t.confirmWithoutPrint}
            >
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{t.confirmWithoutPrint}</span>
            </button>

            {/* Complete Sale & PRINT Receipt */}
            <button
              type="button"
              onClick={() => handleConfirm(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-colors shadow-lg shadow-amber-500/20 cursor-pointer"
              title={t.confirmAndPrint}
            >
              <Printer className="w-4 h-4" />
              <span>{t.confirmAndPrint}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
