import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Printer,
  Receipt,
  RotateCcw,
  Search,
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { Order } from '../types/pos';
import { formatDateTime, formatOMR } from '../utils/formatters';

type DateFilterMode = 'today' | 'yesterday' | 'week' | 'month' | 'all' | 'custom';

export const SalesLedgerScreen: React.FC = () => {
  const {
    orders,
    refundOrder,
    setLastCompletedOrder,
    setIsReceiptModalOpen,
    branches,
    t,
    language,
    hasPermission,
    currentStaff,
  } = usePOS();

  const [search, setSearch] = useState<string>('');
  const [filterBranch, setFilterBranch] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [dateFilterMode, setDateFilterMode] = useState<DateFilterMode>('today');
  
  // Custom date range state
  const todayStr = new Date().toISOString().slice(0, 10);
  const [customStart, setCustomStart] = useState<string>(todayStr);
  const [customEnd, setCustomEnd] = useState<string>(todayStr);

  const [isPrintReportOpen, setIsPrintReportOpen] = useState<boolean>(false);

  // Helper date calculators
  const getYesterdayStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  };

  const getWeekStartStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  };

  const getMonthStartStr = () => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  };

  const filteredOrders = orders.filter((o) => {
    const matchesBranch = filterBranch === 'all' || o.branchId === filterBranch;
    const matchesPayment = filterPayment === 'all' || o.paymentDetails.method === filterPayment;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      o.invoiceNumber.toLowerCase().includes(q) ||
      o.cashierName.toLowerCase().includes(q) ||
      (o.customerName && o.customerName.toLowerCase().includes(q));

    // Date filtering
    const orderDateStr = o.createdAt.slice(0, 10);
    let matchesDate = true;

    if (dateFilterMode === 'today') {
      matchesDate = orderDateStr === todayStr;
    } else if (dateFilterMode === 'yesterday') {
      matchesDate = orderDateStr === getYesterdayStr();
    } else if (dateFilterMode === 'week') {
      matchesDate = orderDateStr >= getWeekStartStr() && orderDateStr <= todayStr;
    } else if (dateFilterMode === 'month') {
      matchesDate = orderDateStr >= getMonthStartStr() && orderDateStr <= todayStr;
    } else if (dateFilterMode === 'custom') {
      matchesDate = orderDateStr >= customStart && orderDateStr <= customEnd;
    }

    return matchesBranch && matchesPayment && matchesSearch && matchesDate;
  });

  // Period Aggregates
  const totalPeriodRevenue = filteredOrders.reduce((sum, o) => sum + (o.status !== 'refunded' ? o.grandTotal : 0), 0);
  const totalPeriodVat = filteredOrders.reduce((sum, o) => sum + (o.status !== 'refunded' ? o.vatAmount : 0), 0);
  const totalCashPortion = filteredOrders.reduce((sum, o) => {
    if (o.status === 'refunded') return sum;
    if (o.paymentDetails.method === 'cash') return sum + o.grandTotal;
    if (o.paymentDetails.method === 'split') return sum + (o.paymentDetails.splitCash || 0);
    return sum;
  }, 0);
  const totalCardPortion = filteredOrders.reduce((sum, o) => {
    if (o.status === 'refunded') return sum;
    if (o.paymentDetails.method === 'card') return sum + o.grandTotal;
    if (o.paymentDetails.method === 'split') return sum + (o.paymentDetails.splitCard || 0);
    return sum;
  }, 0);

  const exportSalesCsv = () => {
    const headers = [
      'Invoice Number',
      'Date',
      'Branch',
      'Cashier',
      'Customer',
      'Payment Method',
      'Subtotal (OMR)',
      'Discount (OMR)',
      'VAT 5% (OMR)',
      'Grand Total (OMR)',
      'Status',
    ];

    const rows = filteredOrders.map((o) => [
      o.invoiceNumber,
      o.createdAt,
      `"${o.branchName}"`,
      `"${o.cashierName}"`,
      `"${o.customerName || 'Cash'}"`,
      o.paymentDetails.method,
      o.subtotal.toFixed(3),
      o.discount.toFixed(3),
      o.vatAmount.toFixed(3),
      o.grandTotal.toFixed(3),
      o.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sales-report-${dateFilterMode}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReprintReceipt = (order: Order) => {
    setLastCompletedOrder(order);
    setIsReceiptModalOpen(true);
  };

  const getDateFilterLabel = () => {
    if (dateFilterMode === 'today') return language === 'ar' ? 'تقرير مبيعات اليوم' : "Today's Sales Report";
    if (dateFilterMode === 'yesterday') return language === 'ar' ? 'تقرير مبيعات أمس' : "Yesterday's Sales Report";
    if (dateFilterMode === 'week') return language === 'ar' ? 'تقرير مبيعات آخر 7 أيام' : "Last 7 Days Sales Report";
    if (dateFilterMode === 'month') return language === 'ar' ? 'تقرير مبيعات هذا الشهر' : "This Month's Sales Report";
    if (dateFilterMode === 'custom') return `${language === 'ar' ? 'تقرير مخصص من' : 'Custom Report'} ${customStart} -> ${customEnd}`;
    return language === 'ar' ? 'كل المبيعات المسجلة' : 'All Recorded Sales';
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Top Header */}
      <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-white text-base">{t.salesLedger}</h2>
              {currentStaff.role === 'accountant' && (
                <span className="px-2 py-0.5 rounded text-[10px] bg-sky-500/10 text-sky-400 font-bold border border-sky-500/20">
                  {language === 'ar' ? 'صلاحية المحاسب' : 'Accountant Access'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {getDateFilterLabel()} ({filteredOrders.length} {language === 'ar' ? 'فاتورة' : 'invoices'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPrintReportOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>{language === 'ar' ? 'طباعة التقرير' : 'Print Report'}</span>
          </button>

          <button
            onClick={exportSalesCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-colors shadow-sm shadow-amber-500/20"
          >
            <Download className="w-4 h-4" />
            <span>{t.exportCsv}</span>
          </button>
        </div>
      </div>

      {/* Date Filter Bar (اليوم / أمس / مخصص) */}
      <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          <button
            onClick={() => setDateFilterMode('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
              dateFilterMode === 'today'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            {language === 'ar' ? 'اليوم (Today)' : 'Today'}
          </button>

          <button
            onClick={() => setDateFilterMode('yesterday')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
              dateFilterMode === 'yesterday'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            {language === 'ar' ? 'أمس (Yesterday)' : 'Yesterday'}
          </button>

          <button
            onClick={() => setDateFilterMode('week')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
              dateFilterMode === 'week'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            {language === 'ar' ? 'هذا الأسبوع' : 'This Week'}
          </button>

          <button
            onClick={() => setDateFilterMode('month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
              dateFilterMode === 'month'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            {language === 'ar' ? 'هذا الشهر' : 'This Month'}
          </button>

          <button
            onClick={() => setDateFilterMode('custom')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
              dateFilterMode === 'custom'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            {language === 'ar' ? 'تاريخ مخصص (Custom)' : 'Custom Range'}
          </button>

          <button
            onClick={() => setDateFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
              dateFilterMode === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            {language === 'ar' ? 'الكل' : 'All'}
          </button>
        </div>

        {/* Custom Date Pickers */}
        {dateFilterMode === 'custom' && (
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="text-slate-500">{language === 'ar' ? 'من:' : 'From:'}</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs font-mono"
            />
            <span className="text-slate-500">{language === 'ar' ? 'إلى:' : 'To:'}</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs font-mono"
            />
          </div>
        )}
      </div>

      {/* Financial Summary Strip for Selected Period */}
      <div className="px-4 py-3 bg-slate-900/40 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
        <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-medium">
            {language === 'ar' ? 'إجمالي المبيعات بالفترة' : 'Period Total Sales'}:
          </span>
          <span className="font-mono font-bold text-amber-400 text-sm">
            {formatOMR(totalPeriodRevenue, language)}
          </span>
        </div>

        <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-medium">
            {language === 'ar' ? 'ضريبة 5% المحصلة' : 'VAT 5% Collected'}:
          </span>
          <span className="font-mono font-bold text-slate-200 text-sm">
            {formatOMR(totalPeriodVat, language)}
          </span>
        </div>

        <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-medium">
            {language === 'ar' ? 'التحصيل النقدي (Cash)' : 'Cash Collected'}:
          </span>
          <span className="font-mono font-bold text-emerald-400 text-sm">
            {formatOMR(totalCashPortion, language)}
          </span>
        </div>

        <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-medium">
            {language === 'ar' ? 'تحصيل البطاقات (POS Cards)' : 'Card Payments'}:
          </span>
          <span className="font-mono font-bold text-sky-400 text-sm">
            {formatOMR(totalCardPortion, language)}
          </span>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="px-4 py-2.5 bg-slate-900/30 border-b border-slate-800 flex flex-wrap items-center gap-3 shrink-0">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 rtl:right-3.5 rtl:left-auto top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={language === 'ar' ? 'بحث برقم الفاتورة أو اسم العميل أو الكاشير...' : 'Search invoice, customer, cashier...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
          />
        </div>

        {/* Branch select */}
        <select
          value={filterBranch}
          onChange={(e) => setFilterBranch(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-hidden"
        >
          <option value="all">{t.allBranches}</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {language === 'ar' ? b.nameAr : b.nameEn}
            </option>
          ))}
        </select>

        {/* Payment method select */}
        <select
          value={filterPayment}
          onChange={(e) => setFilterPayment(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-hidden"
        >
          <option value="all">{language === 'ar' ? 'كل طرق الدفع' : 'All Payments'}</option>
          <option value="cash">{t.payMethodCash}</option>
          <option value="card">{t.payMethodCard}</option>
          <option value="split">{t.payMethodSplit}</option>
          <option value="credit">{t.payMethodCredit}</option>
        </select>
      </div>

      {/* Invoices Table */}
      <div className="flex-1 overflow-auto p-4">
        {filteredOrders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3 py-16">
            <Receipt className="w-12 h-12 text-slate-800" />
            <p className="text-xs font-medium">
              {language === 'ar' ? 'لا توجد فواتير مسجلة في هذا النطاق الزمني' : 'No sales invoices recorded for this period'}
            </p>
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left rtl:text-right border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold">
                  <th className="py-3 px-4">{t.invoiceNumber}</th>
                  <th className="py-3 px-4">{t.date}</th>
                  <th className="py-3 px-4">{language === 'ar' ? 'الفرع والكاشير' : 'Branch & Cashier'}</th>
                  <th className="py-3 px-4">{t.customerName}</th>
                  <th className="py-3 px-4">{t.paidBy}</th>
                  <th className="py-3 px-4 text-center">{t.itemsCount}</th>
                  <th className="py-3 px-4 text-right rtl:text-left">{t.grandTotal}</th>
                  <th className="py-3 px-4 text-center">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Invoice # */}
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      {ord.invoiceNumber}
                      {ord.status === 'refunded' && (
                        <span className="block text-[10px] text-rose-400 font-sans font-medium">
                          {language === 'ar' ? '(مسترجعة / ملغية)' : '(Refunded)'}
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {formatDateTime(ord.createdAt, language)}
                    </td>

                    {/* Branch & Cashier */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{ord.branchName}</div>
                      <div className="text-[10px] text-slate-400">{ord.cashierName}</div>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4 text-slate-300">
                      {ord.customerName || (language === 'ar' ? 'عميل نقدي' : 'Walk-in')}
                    </td>

                    {/* Payment Method */}
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium text-[11px]">
                        {ord.paymentDetails.method === 'cash'
                          ? t.payMethodCash
                          : ord.paymentDetails.method === 'card'
                          ? t.payMethodCard
                          : ord.paymentDetails.method === 'split'
                          ? t.payMethodSplit
                          : t.payMethodCredit}
                      </span>
                    </td>

                    {/* Items count */}
                    <td className="py-3 px-4 text-center font-mono text-slate-300">
                      {ord.items.reduce((s, i) => s + i.quantity, 0)}
                    </td>

                    {/* Grand Total */}
                    <td className="py-3 px-4 text-right rtl:text-left font-mono font-black text-amber-400 text-sm">
                      {formatOMR(ord.grandTotal, language)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleReprintReceipt(ord)}
                          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title={t.printReceipt}
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {hasPermission('manager') && ord.status !== 'refunded' && (
                          <button
                            onClick={() => {
                              if (window.confirm(language === 'ar' ? 'هل تريد استرجاع الفاتورة وإعادة الكميات للمخزون؟' : 'Refund invoice and restore stock?')) {
                                refundOrder(ord.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title={language === 'ar' ? 'استرجاع الفاتورة' : 'Refund Invoice'}
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Printable Sales Report Modal for Accountant */}
      {isPrintReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl p-6 space-y-4 my-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                {language === 'ar' ? 'تقرير المبيعات المالي للطباعة' : 'Financial Sales Report Preview'}
              </h3>
              <button
                onClick={() => setIsPrintReportOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 bg-white text-slate-900 rounded-xl space-y-4 text-xs font-mono">
              <div className="text-center border-b pb-3 border-slate-300">
                <h2 className="text-base font-bold font-sans">ROGUEBYTE POS — تقرير المبيعات المالي</h2>
                <p className="text-[11px] text-slate-600 mt-1">{getDateFilterLabel()}</p>
                <p className="text-[10px] text-slate-500">تاريخ الإصدار: {new Date().toLocaleString()}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs py-2 border-b border-slate-200">
                <div>
                  <p>عدد الفواتير المصدرة: <strong>{filteredOrders.length}</strong></p>
                  <p>المبيعات النقدية: <strong>{formatOMR(totalCashPortion, 'ar')}</strong></p>
                </div>
                <div>
                  <p>إجمالي المبيعات: <strong>{formatOMR(totalPeriodRevenue, 'ar')}</strong></p>
                  <p>ضريبة 5% المحصلة: <strong>{formatOMR(totalPeriodVat, 'ar')}</strong></p>
                </div>
              </div>

              <div className="pt-2 text-center text-[10px] text-slate-500">
                تم استخراج هذا التقرير آلياً بواسطة نظام RogueByte POS للمحاسبة
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsPrintReportOpen(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                {t.close}
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
              >
                <Printer className="w-4 h-4" />
                <span>{language === 'ar' ? 'أمر الطباعة' : 'Print Now'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
