import React from 'react';
import { CheckCircle2, Download, Printer, Share2, Sparkles, X } from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { formatDateTime, formatOMR, generateBarcodeSvg, generateQRCodeSvg } from '../utils/formatters';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose }) => {
  const { lastCompletedOrder, settings, currentBranch, language, t } = usePOS();

  if (!isOpen || !lastCompletedOrder) return null;

  const order = lastCompletedOrder;
  const [autoPrintEnabled, setAutoPrintEnabled] = React.useState<boolean>(true);

  const handlePrint = React.useCallback(() => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }, []);

  // Keyboard shortcut listener (Enter = print, Escape = close / new sale)
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handlePrint();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Auto-trigger print dialog if auto-print is enabled
    let timer: NodeJS.Timeout | null = null;
    if (autoPrintEnabled) {
      timer = setTimeout(() => {
        handlePrint();
      }, 350);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timer) clearTimeout(timer);
    };
  }, [isOpen, handlePrint, onClose, autoPrintEnabled]);

  // QR Code payload for invoice verification
  const qrData = `Seller: ${settings.companyNameEn || 'RogueByte'}\nVAT: ${settings.vatNumber}\nInv: ${order.invoiceNumber}\nTime: ${order.createdAt}\nTotal: ${order.grandTotal.toFixed(3)} OMR\nTax: ${order.vatAmount.toFixed(3)} OMR`;
  const qrSvg = generateQRCodeSvg(qrData, 110);
  const barcodeSvg = generateBarcodeSvg(order.invoiceNumber, 240, 50);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <h3 className="font-semibold text-white text-sm">
              {t.paymentSuccess}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors shadow-sm shadow-amber-500/20"
            >
              <Printer className="w-4 h-4" />
              <span>{t.printReceipt}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Thermal Receipt Paper Layout */}
        <div className="p-6 bg-slate-950/50 flex justify-center">
          <div
            id="printable-receipt-area"
            className={`receipt-paper bg-white text-slate-900 rounded-lg p-6 shadow-md border border-slate-200 text-xs ${
              settings.receiptPaperWidth === '58mm' ? 'max-w-[260px]' : 'max-w-[340px] w-full'
            }`}
            style={{ fontFamily: "'Courier New', Courier, monospace" }}
          >
            {/* Header: Company Logo & Brand */}
            <div className="text-center pb-4 border-b border-dashed border-slate-400 space-y-1.5">
              {settings.logoUrl ? (
                <div className="flex justify-center mb-2">
                  <img
                    src={settings.logoUrl}
                    alt={settings.companyNameAr}
                    className="max-h-16 max-w-[180px] object-contain"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center mb-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-amber-400 rounded font-sans font-black tracking-wider text-sm mb-1">
                    <span>ROGUEBYTE</span>
                    <span className="text-[10px] bg-amber-400 text-slate-950 px-1 rounded font-bold">POS</span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-700">
                    {language === 'ar' ? settings.companyNameAr : settings.companyNameEn}
                  </p>
                </div>
              )}

              <p className="text-[11px] font-bold tracking-tight text-slate-800">
                {t.taxInvoice}
              </p>
              <p className="text-[10px] text-slate-600">
                {language === 'ar' ? currentBranch.addressAr : currentBranch.addressEn}
              </p>
              <div className="text-[10px] text-slate-600 flex justify-between px-2 pt-1 font-mono">
                <span>{t.crNumberLabel}: {settings.crNumber}</span>
                <span>{t.vatNumberLabel}: {settings.vatNumber}</span>
              </div>
              <p className="text-[10px] text-slate-600">{currentBranch.phone}</p>
            </div>

            {/* Invoice Meta */}
            <div className="py-2.5 border-b border-dashed border-slate-400 space-y-1 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-600">{t.invoiceNumber}:</span>
                <span className="font-bold text-slate-900">{order.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">{t.orderNumber}:</span>
                <span className="text-slate-900">#{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">{t.date}:</span>
                <span className="text-slate-900">{formatDateTime(order.createdAt, language)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">{t.cashier}:</span>
                <span className="text-slate-900">{order.cashierName}</span>
              </div>
              {order.customerName && (
                <div className="flex justify-between">
                  <span className="text-slate-600">{t.customerName}:</span>
                  <span className="text-slate-900 font-semibold">{order.customerName}</span>
                </div>
              )}
            </div>

            {/* Line Items Table */}
            <div className="py-2.5 border-b border-dashed border-slate-400">
              <table className="w-full text-left rtl:text-right text-[11px]">
                <thead>
                  <tr className="border-b border-slate-300 text-slate-600 font-bold">
                    <th className="py-1">{t.item}</th>
                    <th className="py-1 text-center">{t.qty}</th>
                    <th className="py-1 text-center">{t.price}</th>
                    <th className="py-1 text-right rtl:text-left">{t.total}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="py-1">
                      <td className="py-1.5 font-medium max-w-[120px] truncate">
                        {language === 'ar' ? item.product.nameAr : item.product.nameEn}
                      </td>
                      <td className="py-1.5 text-center font-mono">{item.quantity}</td>
                      <td className="py-1.5 text-center font-mono">{item.unitPrice.toFixed(3)}</td>
                      <td className="py-1.5 text-right rtl:text-left font-mono font-bold">
                        {item.total.toFixed(3)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals & VAT Breakdown */}
            <div className="py-2.5 border-b border-dashed border-slate-400 space-y-1 font-mono text-[11px]">
              <div className="flex justify-between text-slate-700">
                <span>{t.subtotal}:</span>
                <span>{order.subtotal.toFixed(3)} {t.currency}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>{t.discount}:</span>
                  <span>-{order.discount.toFixed(3)} {t.currency}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-700">
                <span>{t.vatTax}:</span>
                <span>{order.vatAmount.toFixed(3)} {t.currency}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-1.5 border-t border-slate-300">
                <span>{t.grandTotal}:</span>
                <span className="text-base font-mono">{order.grandTotal.toFixed(3)} {t.currency}</span>
              </div>
            </div>

            {/* Payment Method Details */}
            <div className="py-2.5 border-b border-dashed border-slate-400 text-[11px] font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-600">{t.paidBy}:</span>
                <span className="font-bold text-slate-900">
                  {order.paymentDetails.method === 'cash'
                    ? t.payMethodCash
                    : order.paymentDetails.method === 'card'
                    ? t.payMethodCard
                    : order.paymentDetails.method === 'split'
                    ? t.payMethodSplit
                    : order.paymentDetails.method === 'credit'
                    ? t.payMethodCredit
                    : t.payMethodMobile}
                </span>
              </div>
              {order.paymentDetails.method === 'cash' && order.paymentDetails.cashTendered !== undefined && (
                <>
                  <div className="flex justify-between text-slate-600">
                    <span>{t.cashTendered}:</span>
                    <span>{order.paymentDetails.cashTendered.toFixed(3)} {t.currency}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{t.changeDue}:</span>
                    <span>{(order.paymentDetails.changeAmount || 0).toFixed(3)} {t.currency}</span>
                  </div>
                </>
              )}
              {order.paymentDetails.method === 'split' && (
                <>
                  <div className="flex justify-between text-slate-600">
                    <span>{t.splitCashAmount}:</span>
                    <span>{(order.paymentDetails.splitCash || 0).toFixed(3)} {t.currency}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>{t.splitCardAmount}:</span>
                    <span>{(order.paymentDetails.splitCard || 0).toFixed(3)} {t.currency}</span>
                  </div>
                </>
              )}
            </div>

            {/* QR Code & Barcode */}
            <div className="py-4 text-center space-y-3">
              <div className="flex justify-center">
                <div
                  className="w-24 h-24 p-1 bg-white border border-slate-300 rounded shadow-xs"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
              </div>
              <div
                className="flex justify-center max-w-[220px] mx-auto overflow-hidden"
                dangerouslySetInnerHTML={{ __html: barcodeSvg }}
              />
            </div>

            {/* Header & Footer Custom Notes */}
            <div className="text-center pt-2 space-y-1.5 text-[10px] text-slate-600">
              <p className="font-medium text-slate-800">
                {language === 'ar' ? settings.receiptHeaderNoteAr : settings.receiptHeaderNoteEn}
              </p>
              <p className="text-[9px] leading-tight text-slate-500">
                {language === 'ar' ? settings.receiptFooterNoteAr : settings.receiptFooterNoteEn}
              </p>
              <p className="pt-2 text-[8px] text-slate-400 font-mono tracking-wider">
                POWERED BY ROGUEBYTE POS • ROGUEBYTE.ONLINE
              </p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              <span>{t.newSale}</span>
              <kbd className="ml-1.5 rtl:mr-1.5 rtl:ml-0 px-1.5 py-0.5 text-[10px] bg-slate-900 border border-slate-700 rounded font-mono text-slate-400">Esc</kbd>
            </button>

            <label className="flex items-center gap-1.5 text-xs text-slate-400 select-none cursor-pointer">
              <input
                type="checkbox"
                checked={autoPrintEnabled}
                onChange={(e) => setAutoPrintEnabled(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
              />
              <span className="text-[11px]">{language === 'ar' ? 'طباعة تلقائية' : 'Auto-Print'}</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98]"
            >
              <Printer className="w-4 h-4" />
              <span>{t.printReceipt}</span>
              <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-950/20 rounded font-mono font-bold text-slate-900">Enter ↵</kbd>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
