import React, { useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Building,
  Calendar,
  DollarSign,
  FileSpreadsheet,
  PieChart,
  Plus,
  Receipt,
  Scale,
  Trash2,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { Expense } from '../types/pos';
import { formatDateTime, formatOMR } from '../utils/formatters';

export const AccountingScreen: React.FC = () => {
  const {
    orders,
    expenses,
    addExpense,
    deleteExpense,
    currentBranch,
    branches,
    t,
    language,
    currentStaff,
    hasPermission,
  } = usePOS();

  // Add Expense Modal
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState<boolean>(false);
  const [expTitleAr, setExpTitleAr] = useState<string>('');
  const [expAmount, setExpAmount] = useState<number>(10.0);
  const [expCategory, setExpCategory] = useState<Expense['category']>('utilities');
  const [expNotes, setExpNotes] = useState<string>('');

  // Financial Calculations
  const completedOrders = orders.filter((o) => o.status === 'completed');

  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.grandTotal, 0);
  const totalSubtotal = completedOrders.reduce((sum, o) => sum + o.subtotal - o.discount, 0);
  const totalVatCollected = completedOrders.reduce((sum, o) => sum + o.vatAmount, 0);

  // Total COGS (Cost of goods sold)
  const totalCogs = completedOrders.reduce((sum, o) => {
    const orderCost = o.items.reduce((s, i) => s + (i.product.costPrice || 0) * i.quantity, 0);
    return sum + orderCost;
  }, 0);

  // Total Expenses
  const totalExpensesAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Net Profit = (Subtotal - COGS) - Expenses
  const grossProfit = totalSubtotal - totalCogs;
  const netProfit = grossProfit - totalExpensesAmount;

  // Cash in drawer (Cash sales portion)
  const cashSales = completedOrders.reduce((sum, o) => {
    if (o.paymentDetails.method === 'cash') return sum + o.grandTotal;
    if (o.paymentDetails.method === 'split') return sum + (o.paymentDetails.splitCash || 0);
    return sum;
  }, 0);

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitleAr.trim()) return;

    addExpense({
      titleAr: expTitleAr,
      titleEn: expTitleAr,
      amount: expAmount,
      category: expCategory,
      branchId: currentBranch.id,
      date: new Date().toISOString(),
      recordedBy: language === 'ar' ? currentStaff.nameAr : currentStaff.nameEn,
      notes: expNotes,
    });

    setExpTitleAr('');
    setExpAmount(10.0);
    setExpNotes('');
    setIsExpenseModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-y-auto">
      {/* Top Header */}
      <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-white text-base">{t.tabAccounting}</h2>
            <p className="text-xs text-slate-400">
              {language === 'ar' ? 'القوائم المالية والضريبية وسجل المصروفات النثرية' : 'Financial Statements, VAT & Expenses'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpenseModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addExpense}</span>
        </button>
      </div>

      <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* KPI Financial Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>{t.totalSales}</span>
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-mono font-black text-white">
              {formatOMR(totalRevenue, language)}
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              {completedOrders.length} {language === 'ar' ? 'عملية بيع مكتملة' : 'completed orders'}
            </p>
          </div>

          {/* Net Profit */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>{t.netProfit}</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div
              className={`text-xl font-mono font-black ${
                netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatOMR(netProfit, language)}
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              {language === 'ar' ? 'بعد خصم التكلفة والمصروفات' : 'After COGS & Expenses'}
            </p>
          </div>

          {/* 5% VAT Collected */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>{t.totalVatCollected}</span>
              <Receipt className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-mono font-black text-amber-400">
              {formatOMR(totalVatCollected, language)}
            </div>
            <p className="text-[10px] text-slate-400">
              {language === 'ar' ? 'مستحقة الإقرار لجهاز الضرائب' : 'Tax Authority Due'}
            </p>
          </div>

          {/* Cash In Drawer */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>{t.cashInDrawer}</span>
              <Wallet className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-xl font-mono font-black text-sky-400">
              {formatOMR(cashSales, language)}
            </div>
            <p className="text-[10px] text-slate-400">
              {language === 'ar' ? 'السيولة النقدية في الدرج' : 'Cash on Hand in Drawer'}
            </p>
          </div>
        </div>

        {/* Profit & Loss Breakdown Strip */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <PieChart className="w-4 h-4 text-amber-400" />
            <span>{language === 'ar' ? 'قائمة الأرباح والخسائر التقديرية (P&L Summary)' : 'P&L Statement'}</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block mb-1 text-[11px] font-sans">
                {language === 'ar' ? 'المبيعات قبل الضريبة' : 'Net Sales (Excl. Tax)'}:
              </span>
              <span className="font-bold text-white text-sm">{formatOMR(totalSubtotal, language)}</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block mb-1 text-[11px] font-sans">
                {t.cogs}:
              </span>
              <span className="font-bold text-rose-400 text-sm">-{formatOMR(totalCogs, language)}</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block mb-1 text-[11px] font-sans">
                {t.totalExpenses}:
              </span>
              <span className="font-bold text-rose-400 text-sm">-{formatOMR(totalExpensesAmount, language)}</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
              <span className="text-emerald-400 block mb-1 text-[11px] font-sans font-bold">
                {t.netProfit}:
              </span>
              <span className="font-bold text-emerald-400 text-sm font-black">{formatOMR(netProfit, language)}</span>
            </div>
          </div>
        </div>

        {/* Operational Expenses Ledger Table */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">{t.expensesLedger}</h3>
            <span className="text-xs text-slate-400 font-mono">
              {expenses.length} {language === 'ar' ? 'بند مصروف' : 'items'}
            </span>
          </div>

          <table className="w-full text-left rtl:text-right border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold">
                <th className="py-3 px-4">{t.expenseTitle}</th>
                <th className="py-3 px-4">{t.expenseCategory}</th>
                <th className="py-3 px-4">{t.date}</th>
                <th className="py-3 px-4">{language === 'ar' ? 'سُجل بواسطة' : 'Recorded By'}</th>
                <th className="py-3 px-4 text-right rtl:text-left">{t.expenseAmount}</th>
                <th className="py-3 px-4 text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">
                    {language === 'ar' ? exp.titleAr : exp.titleEn}
                    {exp.notes && (
                      <span className="block text-[10px] text-slate-400 font-normal">
                        {exp.notes}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    <span className="inline-block px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[11px]">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                    {formatDateTime(exp.date, language)}
                  </td>
                  <td className="py-3 px-4 text-slate-300">{exp.recordedBy}</td>
                  <td className="py-3 px-4 text-right rtl:text-left font-mono font-bold text-rose-400">
                    -{formatOMR(exp.amount, language)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => deleteExpense(exp.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">{t.addExpense}</h3>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {t.expenseTitle} *:
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'ar' ? 'مثال: فاتورة المياه أو شراء مستلزمات' : 'e.g. Utility bill or packaging'}
                  value={expTitleAr}
                  onChange={(e) => setExpTitleAr(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {t.expenseAmount} (OMR) *:
                </label>
                <input
                  type="number"
                  step="0.050"
                  required
                  value={expAmount}
                  onChange={(e) => setExpAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {t.expenseCategory}:
                </label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as Expense['category'])}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="utilities">{language === 'ar' ? 'فواتير ومرافق (كهرباء / ماء / إنترنت)' : 'Utilities'}</option>
                  <option value="supplies">{language === 'ar' ? 'مستلزمات ومطبوعات وأكياس' : 'Supplies'}</option>
                  <option value="rent">{language === 'ar' ? 'إيجار المحل أو المخزن' : 'Rent'}</option>
                  <option value="salaries">{language === 'ar' ? 'رواتب وحوافز' : 'Salaries'}</option>
                  <option value="maintenance">{language === 'ar' ? 'صيانة ونظافة' : 'Maintenance'}</option>
                  <option value="other">{language === 'ar' ? 'مصاريف أخرى' : 'Other'}</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {language === 'ar' ? 'ملاحظات إضافية' : 'Notes'}:
                </label>
                <input
                  type="text"
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  placeholder={language === 'ar' ? 'رقم الإيصال أو اسم المورد...' : 'Receipt # or vendor...'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
