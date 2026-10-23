import React, { useEffect, useState } from 'react';
import {
  Building2,
  Cloud,
  Globe,
  KeyRound,
  LayoutGrid,
  Lock,
  Package,
  Receipt,
  Scale,
  Settings,
  Sparkles,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { PinModal } from './PinModal';

export type ActiveTab =
  | 'pos'
  | 'inventory'
  | 'sales'
  | 'accounting'
  | 'branches'
  | 'staff'
  | 'settings'
  | 'about';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const {
    currentStaff,
    currentBranch,
    branches,
    setCurrentBranchId,
    language,
    setLanguage,
    soundEnabled,
    toggleSound,
    isCloudConnected,
    t,
  } = usePOS();

  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState<boolean>(false);

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  useEffect(() => {
    if (currentStaff.role === 'cashier' && activeTab !== 'pos') {
      setActiveTab('pos');
    } else if (
      currentStaff.role === 'accountant' &&
      (activeTab === 'inventory' || activeTab === 'settings')
    ) {
      setActiveTab('sales');
    }
  }, [currentStaff.role, activeTab, setActiveTab]);

  const allNavItems: { id: ActiveTab; label: string; icon: React.ReactNode; allowedRoles: ('cashier' | 'accountant' | 'manager')[] }[] = [
    { id: 'pos', label: t.tabPOS, icon: <LayoutGrid className="w-4 h-4" />, allowedRoles: ['cashier', 'accountant', 'manager'] },
    { id: 'sales', label: t.tabSales, icon: <Receipt className="w-4 h-4" />, allowedRoles: ['accountant', 'manager'] },
    { id: 'accounting', label: t.tabAccounting, icon: <Scale className="w-4 h-4" />, allowedRoles: ['accountant', 'manager'] },
    { id: 'inventory', label: t.tabInventory, icon: <Package className="w-4 h-4" />, allowedRoles: ['manager'] },
    { id: 'branches', label: t.tabBranches, icon: <Building2 className="w-4 h-4" />, allowedRoles: ['accountant', 'manager'] },
    { id: 'staff', label: t.tabStaff, icon: <Users className="w-4 h-4" />, allowedRoles: ['accountant', 'manager'] },
    { id: 'settings', label: t.tabSettings, icon: <Settings className="w-4 h-4" />, allowedRoles: ['manager'] },
    { id: 'about', label: t.tabAbout, icon: <Sparkles className="w-4 h-4" />, allowedRoles: ['accountant', 'manager'] },
  ];

  const visibleNavItems = allNavItems.filter((item) => item.allowedRoles.includes(currentStaff.role));

  return (
    <>
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between gap-4 shrink-0 select-none z-30">
        {/* Zone 1: Single text element wordmark with RogueByte brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 font-black flex items-center justify-center font-mono text-base shadow-sm shadow-amber-500/20">
            RB
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-white text-base tracking-tight font-sans">
                ROGUEBYTE
              </span>
              <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded font-black tracking-wider">
                POS
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
              {currentBranch.code} • {language === 'ar' ? currentBranch.nameAr : currentBranch.nameEn}
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Single-line controls) */}
        <nav className="hidden lg:flex items-center gap-1 overflow-x-auto">
          {visibleNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Quick Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Cloud Database Status */}
          {isCloudConnected && (
            <div
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium"
              title="Firebase Firestore Cloud Connected"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>Firebase Cloud</span>
            </div>
          )}

          {/* Branch Switcher Pill */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="max-w-[120px] truncate">
                {language === 'ar' ? currentBranch.nameAr : currentBranch.nameEn}
              </span>
            </button>

            {isBranchDropdownOpen && (
              <div className="absolute right-0 rtl:left-0 rtl:right-auto top-full mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-xl py-1 z-50 animate-in fade-in zoom-in-95">
                <span className="px-3 py-1.5 text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                  {t.switchBranch}
                </span>
                {branches.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setCurrentBranchId(b.id);
                      setIsBranchDropdownOpen(false);
                    }}
                    className={`w-full text-left rtl:text-right px-3 py-2 text-xs transition-colors flex items-center justify-between ${
                      currentBranch.id === b.id
                        ? 'bg-amber-500/10 text-amber-300 font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate">{language === 'ar' ? b.nameAr : b.nameEn}</span>
                    <span className="font-mono text-[10px] text-slate-500">{b.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User PIN Switcher */}
          <button
            onClick={() => setIsPinModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-xs transition-all"
            title={t.switchUser}
          >
            <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold">
              {currentStaff.nameAr[0]}
            </div>
            <div className="text-left rtl:text-right">
              <span className="text-white font-bold max-w-[80px] sm:max-w-[110px] truncate block leading-tight">
                {language === 'ar' ? currentStaff.nameAr : currentStaff.nameEn}
              </span>
              <span className="text-[9px] text-slate-400 block leading-none">
                {currentStaff.role === 'manager'
                  ? t.manager
                  : currentStaff.role === 'accountant'
                  ? t.accountant
                  : t.cashier}
              </span>
            </div>
            <Lock className="w-3 h-3 text-slate-500 ml-1 rtl:mr-1 rtl:ml-0" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title={soundEnabled ? t.soundEnabled : t.soundDisabled}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Language Toggle: AR / EN */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-slate-200 text-xs font-bold font-mono transition-colors"
            title="Switch Language / تبديل اللغة"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'ar' ? 'EN' : 'عربي'}</span>
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Hidden for Cashier to maximize sales viewport) */}
      {visibleNavItems.length > 1 && (
        <div className="lg:hidden flex items-center justify-around bg-slate-900 border-t border-slate-800 py-2 px-1 shrink-0 overflow-x-auto z-20">
          {visibleNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                activeTab === item.id ? 'text-amber-400 font-bold' : 'text-slate-400'
              }`}
            >
              {item.icon}
              <span className="truncate max-w-[65px]">{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* PIN Switch Modal */}
      <PinModal isOpen={isPinModalOpen} onClose={() => setIsPinModalOpen(false)} />
    </>
  );
};
