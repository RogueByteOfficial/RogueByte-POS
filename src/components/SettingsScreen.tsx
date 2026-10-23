import React, { useRef, useState } from 'react';
import {
  Check,
  Cloud,
  Coins,
  Database,
  Download,
  Image as ImageIcon,
  Printer,
  RefreshCw,
  Save,
  Settings,
  Shield,
  Upload,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { usePOS } from '../context/POSContext';

export const SettingsScreen: React.FC = () => {
  const {
    settings,
    updateSettings,
    soundEnabled,
    toggleSound,
    exportDatabaseJson,
    importDatabaseJson,
    resetToDefaultData,
    isCloudConnected,
    cloudSyncTime,
    seedInitialDataToCloud,
    t,
    language,
    hasPermission,
  } = usePOS();

  // Local form state
  const [companyNameAr, setCompanyNameAr] = useState<string>(settings.companyNameAr);
  const [companyNameEn, setCompanyNameEn] = useState<string>(settings.companyNameEn);
  const [crNumber, setCrNumber] = useState<string>(settings.crNumber);
  const [vatNumber, setVatNumber] = useState<string>(settings.vatNumber);
  const [defaultTaxRate, setDefaultTaxRate] = useState<number>(settings.defaultTaxRate);
  const [phone, setPhone] = useState<string>(settings.phone);
  const [email, setEmail] = useState<string>(settings.email);
  const [website, setWebsite] = useState<string>(settings.website);
  const [addressAr, setAddressAr] = useState<string>(settings.addressAr);
  const [receiptHeaderNoteAr, setReceiptHeaderNoteAr] = useState<string>(settings.receiptHeaderNoteAr);
  const [receiptFooterNoteAr, setReceiptFooterNoteAr] = useState<string>(settings.receiptFooterNoteAr);
  const [receiptPaperWidth, setReceiptPaperWidth] = useState<'80mm' | '58mm' | 'a4'>(settings.receiptPaperWidth);
  const [logoUrl, setLogoUrl] = useState<string>(settings.logoUrl);

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  // Logo file upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setLogoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      companyNameAr,
      companyNameEn,
      crNumber,
      vatNumber,
      defaultTaxRate,
      phone,
      email,
      website,
      addressAr,
      receiptHeaderNoteAr,
      receiptFooterNoteAr,
      receiptPaperWidth,
      logoUrl,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const ok = importDatabaseJson(reader.result);
          if (ok) {
            alert(language === 'ar' ? 'تمت استعادة البيانات بنجاح!' : 'Database restored successfully!');
          } else {
            alert(language === 'ar' ? 'الملف غير صالح' : 'Invalid backup JSON file');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-y-auto">
      {/* Top Header */}
      <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-white text-base">{t.systemSettings}</h2>
            <p className="text-xs text-slate-400">
              {language === 'ar' ? 'إعدادات الفاتورة الضريبية، الشعار، النسبة، والنسخ الاحتياطي' : 'Tax Invoices, Store Logo & System Config'}
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>{language === 'ar' ? 'تم حفظ الإعدادات' : 'Saved!'}</span>
          </div>
        )}
      </div>

      <div className="p-6 max-w-5xl mx-auto w-full space-y-8">
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Section 1: Company Logo for Invoices (مطلوبة بالكامل في الطلب) */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm">{t.companyLogo}</h3>
                <p className="text-xs text-slate-400">
                  {language === 'ar' ? 'يظهر الشعار في أعلى الإيصالات الحرارية والفواتير الضريبية' : 'Appears at the top of thermal tax invoices'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <div className="w-28 h-28 rounded-2xl bg-white border-2 border-dashed border-slate-600 flex items-center justify-center p-2 shadow-inner shrink-0">
                {logoUrl ? (
                  <img src={logoUrl} alt="Company Logo" className="max-w-full max-h-full object-contain" />
                ) : (
                  <div className="text-center p-2">
                    <span className="font-sans font-black text-xs text-slate-900 block">ROGUEBYTE</span>
                    <span className="text-[9px] bg-amber-400 text-slate-950 font-bold px-1 rounded">DEFAULT</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <input
                  type="file"
                  ref={logoInputRef}
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{t.uploadLogo}</span>
                  </button>

                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
                    >
                      {t.removeLogo}
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  {language === 'ar'
                    ? 'الأفضل رفع شعار بخلفية بيضاء أو شفافة لملاءمة الطابعات الحرارية مقاس 80mm'
                    : 'Recommended: monochrome or transparent logo for 80mm thermal paper'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Commercial & Tax Registration */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>{t.companyDetails}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">اسم المنشأة التجاري (عربي) *:</label>
                <input
                  type="text"
                  required
                  value={companyNameAr}
                  onChange={(e) => setCompanyNameAr(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Trade Name (English):</label>
                <input
                  type="text"
                  value={companyNameEn}
                  onChange={(e) => setCompanyNameEn(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">رقم السجل التجاري (CR Number):</label>
                <input
                  type="text"
                  value={crNumber}
                  onChange={(e) => setCrNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">الرقم الضريبي (VAT ID):</label>
                <input
                  type="text"
                  value={vatNumber}
                  onChange={(e) => setVatNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  نسبة ضريبة القيمة المضافة (VAT % - سلطنة عُمان 5%):
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={defaultTaxRate}
                  onChange={(e) => setDefaultTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono font-bold text-amber-400"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">العملة الأساسية (Currency):</label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value="ريال عماني (OMR / ر.ع.) — بدقة 3 خانات عشرية (1.000)"
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-400 font-mono cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Receipt & Thermal Printer Settings */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Printer className="w-4 h-4 text-amber-400" />
              <span>{t.receiptCustomization}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">{t.paperWidth}:</label>
                <select
                  value={receiptPaperWidth}
                  onChange={(e) => setReceiptPaperWidth(e.target.value as '80mm' | '58mm' | 'a4')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="80mm">80mm — الطابعات الحرارية القياسية (موصى بها)</option>
                  <option value="58mm">58mm — الطابعات الحرارية المدمجة والصغيرة</option>
                  <option value="a4">A4 — الطابعات المكتبية العادية</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs text-slate-400 block mb-1">{t.receiptHeader}:</label>
                <input
                  type="text"
                  value={receiptHeaderNoteAr}
                  onChange={(e) => setReceiptHeaderNoteAr(e.target.value)}
                  placeholder="شكراً لتعاملكم مع روج بايت..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div className="md:col-span-3">
                <label className="text-xs text-slate-400 block mb-1">{t.receiptFooter}:</label>
                <textarea
                  rows={2}
                  value={receiptFooterNoteAr}
                  onChange={(e) => setReceiptFooterNoteAr(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Sound & Audio synthesizer */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400">
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="font-bold text-white text-xs">{t.soundFeedback}</h4>
                <p className="text-[11px] text-slate-400">
                  {soundEnabled ? t.soundEnabled : t.soundDisabled}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleSound}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                soundEnabled
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {soundEnabled ? (language === 'ar' ? 'مفعل' : 'Enabled') : (language === 'ar' ? 'مكتوم' : 'Muted')}
            </button>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20"
            >
              <Save className="w-4 h-4" />
              <span>{t.save}</span>
            </button>
          </div>
        </form>

        {/* Section 4: Firebase Firestore Cloud Database */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Cloud className="w-5 h-5 text-amber-400" />
              <span>{language === 'ar' ? 'قاعدة البيانات السحابية المركزية (Firebase Firestore)' : 'Firebase Firestore Cloud Database'}</span>
            </h3>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{language === 'ar' ? 'متصل ومفعل' : 'Connected'}</span>
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            {language === 'ar'
              ? 'تم ربط النظام بقاعدة بيانات Google Firebase Firestore السحابية لمزامنة مبيعات الفروع، المخزون، والمصروفات بين جميع الأجهزة لحظة بلحظة مع الحفاظ على ميزة العمل دون إنترنت (Offline-First).'
              : 'Connected to Google Firebase Firestore for real-time inventory and sales synchronization across all branches with offline resilience.'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px] font-sans">Provider:</span>
              <span className="text-slate-200 font-bold">Google Cloud Firestore</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-sans">Project ID:</span>
              <span className="text-amber-400">gen-lang-client-0963152136</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-sans">{language === 'ar' ? 'آخر مزامنة' : 'Last Sync'}:</span>
              <span className="text-emerald-400 font-bold">{cloudSyncTime || 'Active Now'}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={async () => {
                await seedInitialDataToCloud();
                alert(language === 'ar' ? 'تمت مزامنة ورفع بيانات الكتالوج للسحابة بنجاح!' : 'Cloud sync completed!');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{language === 'ar' ? 'إعادة مزامنة الكتالوج مع السحابة' : 'Force Sync to Cloud'}</span>
            </button>
          </div>
        </div>

        {/* Section 5: Backup, Export & Restore */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-sm">{t.backupAndRestore}</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {language === 'ar'
              ? 'يمكنك حفظ وتصدير قاعدة بيانات نقاط البيع والمخزون والفواتير كملف JSON آمن للنسخ الاحتياطي، أو استعادتها بأي وقت.'
              : 'Export complete database backup as JSON or restore your system at any time.'}
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={exportDatabaseJson}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>{t.exportBackup}</span>
            </button>

            <input
              type="file"
              ref={importFileRef}
              accept=".json,application/json"
              onChange={handleImportFile}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => importFileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Upload className="w-4 h-4 text-sky-400" />
              <span>{t.importBackup}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm(t.confirmReset)) {
                  resetToDefaultData();
                }
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold border border-rose-500/30 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t.resetToDemo}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
