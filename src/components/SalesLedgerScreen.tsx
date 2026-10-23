import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle,
  Download,
  Eye,
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
  } = usePOS();

  const [search, setSearch] = useState<string>('');
  const [filterBranch, setFilterBranch] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((o) => {
    const matchesBranch = filterBranch === 'all' || o.branchId === filterBranch;
    const matchesPayment = filterPayment === 'all' || o.paymentDetails.method === filterPayment;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      o.invoiceNumber.toLowerCase().includes(q) ||
      o.cashierName.toLowerCase().includes(q) ||
      (o.customerName && o.customerName.toLowerCase().includes(q));

    return matchesBranch && matchesPayment && matchesSearch;
  });

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
    link.download = `roguebyte-sales-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReprintReceipt = (order: Order) => {
    setLastCompletedOrder(order);
    setIsReceiptModalOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-white text-base">{t.salesLedger}</h2>
            <p className="text-xs text-slate-400">
              {filteredOrders.length} {language === 'ar' ? 'فاتورة مسجلة' : 'Recorded Invoices'}
            </p>
          </div>
        </div>

        <button
          onClick={exportSalesCsv}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors"
        >
          <Download className="w-4 h-4 text-amber-400" />
          <span>{t.exportCsv}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="px-4 py-3 bg-slate-900/40 border-b border-slate-800 flex flex-wrap items-center gap-3 shrink-0">
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
              {language === 'ar' ? 'لا توجد فواتير مسجلة مطابقة حتى الآن' : 'No matching sales invoices found'}
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
    </div>
  );
};
