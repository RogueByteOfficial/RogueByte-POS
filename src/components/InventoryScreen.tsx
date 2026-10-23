import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpDown,
  Barcode as BarcodeIcon,
  Check,
  Edit2,
  Filter,
  Image as ImageIcon,
  Layers,
  Package,
  PackagePlus,
  Plus,
  Printer,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { Product } from '../types/pos';
import { formatOMR, generateBarcodeSvg } from '../utils/formatters';

export const InventoryScreen: React.FC = () => {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    t,
    language,
    hasPermission,
  } = usePOS();

  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low' | 'out'>('all');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [barcodePrintProduct, setBarcodePrintProduct] = useState<Product | null>(null);

  // Form state for add/edit product
  const [nameAr, setNameAr] = useState<string>('');
  const [nameEn, setNameEn] = useState<string>('');
  const [barcode, setBarcode] = useState<string>('');
  const [sku, setSku] = useState<string>('');
  const [category, setCategory] = useState<string>('cat-sweets');
  const [costPrice, setCostPrice] = useState<number>(1.0);
  const [sellingPrice, setSellingPrice] = useState<number>(2.0);
  const [stockQuantity, setStockQuantity] = useState<number>(50);
  const [minStockLevel, setMinStockLevel] = useState<number>(10);
  const [unit, setUnit] = useState<string>('حبة / قطعة');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [descriptionAr, setDescriptionAr] = useState<string>('');

  // Stock Adjustment Form
  const [adjustType, setAdjustType] = useState<'add' | 'damage' | 'audit'>('add');
  const [adjustQty, setAdjustQty] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image upload from user device (FileReader to Data URL)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenAddModal = () => {
    setNameAr('');
    setNameEn('');
    setBarcode(`6084001${Math.floor(10000 + Math.random() * 90000)}`);
    setSku(`RGB-${Math.floor(100 + Math.random() * 900)}`);
    setCategory(categories[1]?.id || 'cat-sweets');
    setCostPrice(1.0);
    setSellingPrice(2.0);
    setStockQuantity(50);
    setMinStockLevel(10);
    setUnit('قطعة');
    setImageUrl('');
    setDescriptionAr('');
    setEditingProduct(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setNameAr(prod.nameAr);
    setNameEn(prod.nameEn);
    setBarcode(prod.barcode);
    setSku(prod.sku);
    setCategory(prod.category);
    setCostPrice(prod.costPrice);
    setSellingPrice(prod.sellingPrice);
    setStockQuantity(prod.stockQuantity);
    setMinStockLevel(prod.minStockLevel);
    setUnit(prod.unit);
    setImageUrl(prod.imageUrl || '');
    setDescriptionAr(prod.descriptionAr || '');
    setIsAddModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr.trim() || !barcode.trim()) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        nameAr,
        nameEn: nameEn || nameAr,
        barcode,
        sku,
        category,
        costPrice,
        sellingPrice,
        stockQuantity,
        minStockLevel,
        unit,
        imageUrl,
        descriptionAr,
      });
    } else {
      addProduct({
        nameAr,
        nameEn: nameEn || nameAr,
        barcode,
        sku,
        category,
        costPrice,
        sellingPrice,
        taxRate: 5,
        stockQuantity,
        minStockLevel,
        unit,
        imageUrl,
        descriptionAr,
      });
    }

    setIsAddModalOpen(false);
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;
    adjustStock(adjustingProduct.id, adjustType, adjustQty, adjustReason);
    setAdjustingProduct(null);
    setAdjustReason('');
  };

  // Filter products
  const filteredList = products.filter((p) => {
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesSearch =
      !search ||
      p.nameAr.toLowerCase().includes(search.toLowerCase()) ||
      p.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());

    const matchesStock =
      stockStatusFilter === 'all' ||
      (stockStatusFilter === 'low' && p.stockQuantity <= p.minStockLevel && p.stockQuantity > 0) ||
      (stockStatusFilter === 'out' && p.stockQuantity <= 0);

    return matchesCat && matchesSearch && matchesStock;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Top Header & Action Bar */}
      <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-white text-base">{t.tabInventory}</h2>
            <p className="text-xs text-slate-400">
              {products.length} {language === 'ar' ? 'منتج مسجل بالمخزون' : 'Registered Products'}
            </p>
          </div>
        </div>

        {hasPermission('manager') && (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addProduct}</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="px-4 py-3 bg-slate-900/40 border-b border-slate-800 flex flex-wrap items-center gap-3 shrink-0">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 rtl:right-3.5 rtl:left-auto top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.searchProductPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
          />
        </div>

        {/* Category dropdown */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-hidden"
        >
          <option value="all">{t.allCategories}</option>
          {categories.filter((c) => c.id !== 'cat-all').map((c) => (
            <option key={c.id} value={c.id}>
              {language === 'ar' ? c.nameAr : c.nameEn}
            </option>
          ))}
        </select>

        {/* Stock status filter */}
        <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl p-1">
          <button
            onClick={() => setStockStatusFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              stockStatusFilter === 'all'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {language === 'ar' ? 'الكل' : 'All'}
          </button>
          <button
            onClick={() => setStockStatusFilter('low')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              stockStatusFilter === 'low'
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.lowStockBadge}
          </button>
          <button
            onClick={() => setStockStatusFilter('out')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              stockStatusFilter === 'out'
                ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.outOfStock}
          </button>
        </div>
      </div>

      {/* Products Table View */}
      <div className="flex-1 overflow-auto p-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left rtl:text-right border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold">
                <th className="py-3 px-4">{t.productImage}</th>
                <th className="py-3 px-4">{language === 'ar' ? 'اسم المنتج والتصنيف' : 'Product & Category'}</th>
                <th className="py-3 px-4">{t.barcode} / SKU</th>
                <th className="py-3 px-4 text-center">{t.costPrice}</th>
                <th className="py-3 px-4 text-center">{t.sellingPrice}</th>
                <th className="py-3 px-4 text-center">{t.profitMargin}</th>
                <th className="py-3 px-4 text-center">{t.stockQuantity}</th>
                <th className="py-3 px-4 text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredList.map((prod) => {
                const marginOMR = prod.sellingPrice - prod.costPrice;
                const marginPercent = prod.costPrice > 0 ? (marginOMR / prod.costPrice) * 100 : 100;
                const isOutOfStock = prod.stockQuantity <= 0;
                const isLowStock = prod.stockQuantity > 0 && prod.stockQuantity <= prod.minStockLevel;

                return (
                  <tr
                    key={prod.id}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Thumbnail */}
                    <td className="py-2.5 px-4">
                      <div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                        {prod.imageUrl ? (
                          <img
                            src={prod.imageUrl}
                            alt={prod.nameAr}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-5 h-5 text-slate-700" />
                        )}
                      </div>
                    </td>

                    {/* Name & Category */}
                    <td className="py-2.5 px-4">
                      <div className="font-bold text-white text-xs">
                        {language === 'ar' ? prod.nameAr : prod.nameEn}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="text-amber-400/90">
                          {categories.find((c) => c.id === prod.category)?.[
                            language === 'ar' ? 'nameAr' : 'nameEn'
                          ] || prod.category}
                        </span>
                        <span>•</span>
                        <span>{prod.unit}</span>
                      </div>
                    </td>

                    {/* Barcode & SKU */}
                    <td className="py-2.5 px-4 font-mono text-[11px]">
                      <div className="text-slate-300 font-bold">{prod.barcode}</div>
                      <div className="text-slate-500 text-[10px]">{prod.sku}</div>
                    </td>

                    {/* Cost Price */}
                    <td className="py-2.5 px-4 text-center font-mono text-slate-400">
                      {formatOMR(prod.costPrice, language)}
                    </td>

                    {/* Selling Price */}
                    <td className="py-2.5 px-4 text-center font-mono font-bold text-amber-400">
                      {formatOMR(prod.sellingPrice, language)}
                    </td>

                    {/* Margin */}
                    <td className="py-2.5 px-4 text-center font-mono">
                      <span className="text-emerald-400 font-bold">
                        +{marginPercent.toFixed(0)}%
                      </span>
                      <span className="block text-[10px] text-slate-500">
                        ({marginOMR.toFixed(3)} {t.currency})
                      </span>
                    </td>

                    {/* Stock level */}
                    <td className="py-2.5 px-4 text-center font-mono">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                          isOutOfStock
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : isLowStock
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400'
                        }`}
                      >
                        {prod.stockQuantity}
                      </span>
                      {isLowStock && (
                        <span className="block text-[9px] text-amber-400/80 mt-0.5">
                          {t.lowStockBadge} (&le;{prod.minStockLevel})
                        </span>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="py-2.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setBarcodePrintProduct(prod)}
                          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title={t.printBarcodes}
                        >
                          <BarcodeIcon className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setAdjustingProduct(prod);
                            setAdjustQty(10);
                          }}
                          className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title={t.stockAdjustment}
                        >
                          <ArrowUpDown className="w-4 h-4" />
                        </button>

                        {hasPermission('manager') && (
                          <>
                            <button
                              onClick={() => handleOpenEditModal(prod)}
                              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                              title={t.editProduct}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                if (window.confirm(t.confirmDelete)) {
                                  deleteProduct(prod.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                              title={t.delete}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal with Real Image Upload */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
              <h3 className="font-bold text-white text-base">
                {editingProduct ? t.editProduct : t.addProduct}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Product Image Upload Section */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <label className="block text-xs font-bold text-slate-300">
                  {t.productImage} ({language === 'ar' ? 'ارفع صورة المنتج' : 'Upload Image'}):
                </label>

                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-900 border-2 border-dashed border-slate-700 flex items-center justify-center shrink-0">
                    {imageUrl ? (
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-600" />
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{t.uploadImage}</span>
                      </button>
                      {imageUrl && (
                        <button
                          type="button"
                          onClick={() => setImageUrl('')}
                          className="px-2.5 py-1.5 text-rose-400 hover:bg-slate-800 rounded-lg text-xs transition-colors"
                        >
                          {t.removeImage}
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {language === 'ar'
                        ? 'يدعم صور JPG, PNG, WebP مباشرة من هاتفك أو حاسوبك'
                        : 'Supports JPG, PNG, WebP directly from your device'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">{t.productNameAr} *:</label>
                  <input
                    type="text"
                    required
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    placeholder="مثال: لبان حوجري عماني"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">{t.productNameEn}:</label>
                  <input
                    type="text"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="e.g. Royal Green Frankincense"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Barcode & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">{t.barcode} *:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setBarcode(`6084001${Math.floor(10000 + Math.random() * 90000)}`)}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-xs font-semibold shrink-0"
                    >
                      توليد
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">{t.sku}:</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Category & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">{t.category}:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {categories.filter((c) => c.id !== 'cat-all').map((c) => (
                      <option key={c.id} value={c.id}>
                        {language === 'ar' ? c.nameAr : c.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">{t.unit}:</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="قطعة / كغ / عبوة"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Prices in OMR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">{t.costPrice} (OMR):</label>
                  <input
                    type="number"
                    step="0.050"
                    required
                    value={costPrice}
                    onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">{t.sellingPrice} (OMR):</label>
                  <input
                    type="number"
                    step="0.050"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold text-amber-400"
                  />
                </div>
              </div>

              {/* Stock Quantities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">{t.stockQuantity}:</label>
                  <input
                    type="number"
                    required
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">{t.minStockAlert}:</label>
                  <input
                    type="number"
                    value={minStockLevel}
                    onChange={(e) => setMinStockLevel(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-sm">{t.stockAdjustment}</h3>
                <p className="text-xs text-amber-400 mt-0.5">
                  {language === 'ar' ? adjustingProduct.nameAr : adjustingProduct.nameEn}
                </p>
              </div>
              <button
                onClick={() => setAdjustingProduct(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {language === 'ar' ? 'نوع التعديل' : 'Adjustment Type'}:
                </label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value as 'add' | 'damage' | 'audit')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="add">{t.reasonAdd}</option>
                  <option value="damage">{t.reasonDamage}</option>
                  <option value="audit">{t.reasonAudit}</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {adjustType === 'audit'
                    ? language === 'ar'
                      ? 'الكمية الفعلية بعد الجرد'
                      : 'Actual Audited Count'
                    : language === 'ar'
                    ? 'الكمية المراد تعديلها'
                    : 'Quantity'}:
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {language === 'ar' ? 'السبب أو رقم سند الاستلام' : 'Reason / Note'}:
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: شحنة جديدة من المورد' : 'e.g. New supplier batch'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
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

      {/* Barcode Print Label Modal */}
      {barcodePrintProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">{t.printBarcodes}</h3>
              <button
                onClick={() => setBarcodePrintProduct(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Printable Barcode Label Card */}
            <div className="p-4 bg-white text-slate-900 rounded-xl border border-slate-300 text-center space-y-2 shadow-sm">
              <p className="text-[10px] font-bold tracking-wider text-slate-600 uppercase">
                ROGUEBYTE POS
              </p>
              <h4 className="text-xs font-black line-clamp-1">
                {language === 'ar' ? barcodePrintProduct.nameAr : barcodePrintProduct.nameEn}
              </h4>
              <div
                className="flex justify-center max-w-[200px] mx-auto overflow-hidden py-1"
                dangerouslySetInnerHTML={{
                  __html: generateBarcodeSvg(barcodePrintProduct.barcode, 200, 48),
                }}
              />
              <div className="flex justify-between items-center px-2 pt-1 border-t border-dashed border-slate-300 font-mono text-xs">
                <span className="font-bold">{barcodePrintProduct.sku}</span>
                <span className="font-black text-sm text-slate-900">
                  {formatOMR(barcodePrintProduct.sellingPrice, language)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBarcodePrintProduct(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                {t.close}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'طباعة الملصق' : 'Print Label'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
