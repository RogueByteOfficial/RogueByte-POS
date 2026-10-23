import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Barcode,
  Camera,
  Check,
  Clock,
  Minus,
  Percent,
  Plus,
  RotateCcw,
  Search,
  ShoppingCart,
  Trash2,
  Wallet,
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { Product } from '../types/pos';
import { formatOMR } from '../utils/formatters';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { PaymentModal } from './PaymentModal';

export const POSTerminal: React.FC = () => {
  const {
    products,
    categories,
    cart,
    cartSubtotal,
    cartVat,
    cartTotal,
    cartDiscount,
    setCartDiscount,
    addToCart,
    updateCartItemQty,
    removeFromCart,
    clearCart,
    heldOrders,
    holdCurrentCart,
    recallHeldOrder,
    deleteHeldOrder,
    t,
    language,
    currentStaff,
  } = usePOS();

  const [selectedCategory, setSelectedCategory] = useState<string>('cat-all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);
  const [isHeldModalOpen, setIsHeldModalOpen] = useState<boolean>(false);
  const [discountInput, setDiscountInput] = useState<string>('');
  const [showDiscountModal, setShowDiscountModal] = useState<boolean>(false);

  // USB Barcode Scanner hardware listener (buffers fast keystrokes ending with Enter)
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is actively typing in a normal text input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      const now = Date.now();
      if (now - lastKeyTime > 150) {
        buffer = '';
      }
      lastKeyTime = now;

      if (e.key === 'Enter') {
        if (buffer.length >= 3) {
          const code = buffer.trim();
          const matched = products.find(
            (p) => p.barcode === code || p.sku.toLowerCase() === code.toLowerCase()
          );
          if (matched) {
            addToCart(matched, 1);
          }
          buffer = '';
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products, addToCart]);

  // Filter products by category and search query
  const filteredProducts = products.filter((prod) => {
    const matchesCategory =
      selectedCategory === 'cat-all' || prod.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      prod.nameAr.toLowerCase().includes(q) ||
      prod.nameEn.toLowerCase().includes(q) ||
      prod.barcode.toLowerCase().includes(q) ||
      prod.sku.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  const handleApplyDiscount = () => {
    const val = parseFloat(discountInput) || 0;
    setCartDiscount(Math.min(cartSubtotal, Math.max(0, val)));
    setShowDiscountModal(false);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-slate-950">
      {/* LEFT / MAIN: Catalog & Products Section */}
      <div className="flex-1 flex flex-col h-full min-w-0 border-r border-slate-800 rtl:border-r-0 rtl:border-l">
        {/* Top Control Bar: Search & Scanner Button */}
        <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex items-center gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 rtl:right-3.5 rtl:left-auto top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.searchProductPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 rtl:left-3 rtl:right-auto top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-xl text-xs font-semibold transition-all shrink-0 shadow-sm"
            title={t.scanBarcode}
          >
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">{t.scanBarcode}</span>
          </button>
        </div>

        {/* Category Horizontal Pills */}
        <div className="px-4 py-2.5 bg-slate-900/30 border-b border-slate-800/80 overflow-x-auto flex items-center gap-2 scrollbar-none shrink-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/20'
                  : 'bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {language === 'ar' ? cat.nameAr : cat.nameEn}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3 py-12">
              <Search className="w-12 h-12 text-slate-700" />
              <p className="text-sm font-medium">
                {language === 'ar' ? 'لم يتم العثور على منتجات مطابقة' : 'No matching products found'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
              {filteredProducts.map((product) => {
                const isOutOfStock = product.stockQuantity <= 0;
                const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= product.minStockLevel;

                return (
                  <div
                    key={product.id}
                    onClick={() => !isOutOfStock && addToCart(product, 1)}
                    className={`group relative rounded-xl border p-3 flex flex-col justify-between transition-all duration-150 cursor-pointer select-none ${
                      isOutOfStock
                        ? 'opacity-50 border-slate-800/60 bg-slate-950 cursor-not-allowed'
                        : 'border-slate-800/90 bg-slate-900/70 hover:bg-slate-850 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/5 active:scale-[0.98]'
                    }`}
                  >
                    {/* Image / Thumbnail Container */}
                    <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-slate-950 mb-2.5 flex items-center justify-center">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={language === 'ar' ? product.nameAr : product.nameEn}
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-600 font-bold text-xs">
                          {product.sku}
                        </div>
                      )}

                      {/* Stock Level Badge */}
                      <div className="absolute top-1.5 left-1.5 rtl:right-1.5 rtl:left-auto">
                        {isOutOfStock ? (
                          <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                            {t.outOfStock}
                          </span>
                        ) : isLowStock ? (
                          <span className="bg-amber-500/90 text-slate-950 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                            {product.stockQuantity} {language === 'ar' ? 'متبقي' : 'left'}
                          </span>
                        ) : (
                          <span className="bg-slate-900/80 backdrop-blur-sm text-slate-300 text-[10px] font-mono px-1.5 py-0.5 rounded border border-slate-700/50">
                            {product.stockQuantity}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Product Name & SKU */}
                    <div className="space-y-1 mb-2">
                      <h4 className="text-xs font-semibold text-white line-clamp-2 leading-snug group-hover:text-amber-400 transition-colors">
                        {language === 'ar' ? product.nameAr : product.nameEn}
                      </h4>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>{product.sku}</span>
                        <span>{product.unit}</span>
                      </div>
                    </div>

                    {/* Price & Add Indicator */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {formatOMR(product.sellingPrice, language)}
                      </span>
                      <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center text-xs group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                        +
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT / SIDEBAR: Active Shopping Cart */}
      <div className="w-full lg:w-[380px] xl:w-[420px] bg-slate-900/90 flex flex-col h-full border-t lg:border-t-0 border-slate-800 shrink-0">
        {/* Cart Top Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                {language === 'ar' ? 'سلة المشتريات' : 'Shopping Cart'}
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                {cart.length} {t.itemsCount}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {heldOrders.length > 0 && (
              <button
                onClick={() => setIsHeldModalOpen(true)}
                className="relative px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-xs font-medium border border-slate-700 flex items-center gap-1 transition-colors"
                title={t.recallOrder}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{heldOrders.length}</span>
              </button>
            )}

            {cart.length > 0 && (
              <>
                <button
                  onClick={() => holdCurrentCart()}
                  className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                  title={t.holdOrder}
                >
                  <Clock className="w-4 h-4" />
                </button>
                <button
                  onClick={clearCart}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                  title={t.clearCart}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
              <ShoppingCart className="w-12 h-12 text-slate-800 mb-2" />
              <p className="text-xs font-semibold text-slate-400">{t.cartEmptyTitle}</p>
              <p className="text-[11px] text-slate-400 leading-relaxed max-w-[220px]">
                {t.cartEmptyDesc}
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-semibold text-slate-200 truncate">
                      {language === 'ar' ? item.product.nameAr : item.product.nameEn}
                    </h5>
                    <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                      <span>{formatOMR(item.unitPrice, language)}</span>
                      <span>×</span>
                      <span>{item.quantity}</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400 shrink-0">
                    {formatOMR(item.total, language)}
                  </span>
                </div>

                {/* Quantity Stepper */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                    <button
                      onClick={() => updateCartItemQty(item.product.id, item.quantity - 1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-mono text-xs font-bold text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartItemQty(item.product.id, item.quantity + 1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Totals & Checkout Panel */}
        {cart.length > 0 && (
          <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
            {/* Calculation Lines */}
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>{t.subtotal}</span>
                <span>{formatOMR(cartSubtotal, language)}</span>
              </div>

              {/* Discount Row */}
              <div className="flex justify-between items-center text-slate-400">
                <button
                  type="button"
                  onClick={() => setShowDiscountModal(true)}
                  className="text-amber-400/90 hover:text-amber-300 flex items-center gap-1 font-sans text-xs underline cursor-pointer"
                >
                  <Percent className="w-3 h-3" />
                  <span>{t.discount}</span>
                </button>
                <span className={cartDiscount > 0 ? 'text-emerald-400 font-bold' : ''}>
                  {cartDiscount > 0 ? `-${formatOMR(cartDiscount, language)}` : '0.000'}
                </span>
              </div>

              {/* VAT Row */}
              <div className="flex justify-between text-slate-400">
                <span>{t.vatTax}</span>
                <span>{formatOMR(cartVat, language)}</span>
              </div>

              {/* Grand Total */}
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-base font-black text-white">
                <span className="font-sans">{t.grandTotal}</span>
                <span className="text-xl font-mono text-amber-400">
                  {formatOMR(cartTotal, language)}
                </span>
              </div>
            </div>

            {/* Big Checkout Button */}
            <button
              onClick={() => setIsPaymentOpen(true)}
              className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 text-sm font-black rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Wallet className="w-5 h-5" />
              <span>{t.proceedToPayment}</span>
            </button>
          </div>
        )}
      </div>

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />

      {/* Payment Processing Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
      />

      {/* Held Orders Recall Modal */}
      {isHeldModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">{t.heldOrdersList}</h3>
              <button
                onClick={() => setIsHeldModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {heldOrders.map((held) => (
                <div
                  key={held.id}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-white">
                      #{held.orderNumber} — {held.items.length} {t.itemsCount}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {new Date(held.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        recallHeldOrder(held.id);
                        setIsHeldModalOpen(false);
                      }}
                      className="px-3 py-1 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-amber-400"
                    >
                      {t.recallOrder}
                    </button>
                    <button
                      onClick={() => deleteHeldOrder(held.id)}
                      className="p-1 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xs overflow-hidden shadow-2xl p-5 space-y-4">
            <h4 className="font-bold text-white text-sm">{t.discount} (OMR)</h4>
            <div>
              <label className="text-xs text-slate-400 block mb-1">
                {language === 'ar' ? 'قيمة الخصم بالريال العماني' : 'Discount amount in OMR'}:
              </label>
              <input
                type="number"
                step="0.100"
                placeholder="0.000"
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono text-sm font-bold"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDiscountModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleApplyDiscount}
                className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-amber-400"
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
