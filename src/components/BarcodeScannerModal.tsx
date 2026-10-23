import React, { useEffect, useRef, useState } from 'react';
import { Camera, Check, QrCode, ScanLine, X } from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { formatOMR } from '../utils/formatters';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({ isOpen, onClose }) => {
  const { products, addToCart, t, language } = usePOS();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [manualCode, setManualCode] = useState<string>('');
  const [scanStatus, setScanStatus] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isOpen) {
      // Attempt camera access
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: { facingMode: 'environment' } })
          .then((s) => {
            stream = s;
            if (videoRef.current) {
              videoRef.current.srcObject = s;
              setCameraActive(true);
            }
          })
          .catch(() => {
            setCameraActive(false);
          });
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setCameraActive(false);
      setScanStatus(null);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleScanCode = (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;

    const matchedProduct = products.find(
      (p) => p.barcode === trimmed || p.sku.toLowerCase() === trimmed.toLowerCase()
    );

    if (matchedProduct) {
      addToCart(matchedProduct, 1);
      setScanStatus(
        `${language === 'ar' ? 'تمت إضافة' : 'Added'}: ${
          language === 'ar' ? matchedProduct.nameAr : matchedProduct.nameEn
        }`
      );
      setManualCode('');
      setTimeout(() => {
        setScanStatus(null);
        onClose();
      }, 700);
    } else {
      setScanStatus(language === 'ar' ? 'الرمز غير مسجل في المخزون' : 'Barcode not found');
      setTimeout(() => setScanStatus(null), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">{t.scanBarcode}</h3>
              <p className="text-xs text-slate-400">
                {language === 'ar' ? 'مسح باركود 1D / 2D و QR Code' : 'Scan 1D/2D Barcodes & QR codes'}
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

        {/* Camera Viewport & Laser overlay */}
        <div className="p-6 space-y-5">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-800 flex items-center justify-center">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-6 space-y-2">
                <Camera className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">
                  {language === 'ar' ? 'كاميرا الجهاز غير متاحة أو بانتظار الإذن' : 'Camera not accessible or permission required'}
                </p>
                <p className="text-[11px] text-amber-400/80">
                  {language === 'ar' ? 'يمكنك استخدام المسح السريع أو القارئ اللاسلكي USB أدناه' : 'You can use quick simulator or USB scanner below'}
                </p>
              </div>
            )}

            {/* Target Reticle / Laser effect */}
            <div className="absolute inset-x-12 inset-y-8 border-2 border-dashed border-amber-500/70 rounded-xl pointer-events-none flex flex-col justify-between p-2">
              <div className="flex justify-between">
                <span className="w-3 h-3 border-t-2 border-l-2 border-amber-400" />
                <span className="w-3 h-3 border-t-2 border-r-2 border-amber-400" />
              </div>
              <div className="w-full h-0.5 bg-rose-500/80 shadow-md shadow-rose-500 animate-pulse my-auto" />
              <div className="flex justify-between">
                <span className="w-3 h-3 border-b-2 border-l-2 border-amber-400" />
                <span className="w-3 h-3 border-b-2 border-r-2 border-amber-400" />
              </div>
            </div>

            {scanStatus && (
              <div className="absolute bottom-3 inset-x-4 bg-slate-900/90 text-white text-xs font-bold py-2 px-3 rounded-lg text-center backdrop-blur-sm border border-slate-700 animate-in fade-in">
                {scanStatus}
              </div>
            )}
          </div>

          {/* Manual Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleScanCode(manualCode);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder={t.searchProductPlaceholder}
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 font-mono"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shrink-0"
            >
              {language === 'ar' ? 'إدخال' : 'Submit'}
            </button>
          </form>

          {/* Quick Simulation Barcode Buttons */}
          <div className="space-y-2">
            <span className="text-[11px] text-slate-400 block font-medium">
              {language === 'ar' ? 'محاكاة مسح باركود لأصناف الكتالوج:' : 'Simulate Scanning Catalog Items:'}
            </span>
            <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
              {products.slice(0, 6).map((prod) => (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => handleScanCode(prod.barcode)}
                  className="p-2 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-left rtl:text-right transition-colors"
                >
                  <p className="text-xs font-semibold text-slate-200 truncate">
                    {language === 'ar' ? prod.nameAr : prod.nameEn}
                  </p>
                  <div className="flex justify-between items-center mt-1 text-[10px]">
                    <span className="font-mono text-slate-500">{prod.barcode}</span>
                    <span className="font-mono font-bold text-amber-400">
                      {formatOMR(prod.sellingPrice, language)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
