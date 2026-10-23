import React, { useState } from 'react';
import {
  Building2,
  Check,
  Edit2,
  ExternalLink,
  MapPin,
  Phone,
  Plus,
  ShieldCheck,
  X,
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { Branch } from '../types/pos';

export const BranchManagementScreen: React.FC = () => {
  const {
    branches,
    currentBranch,
    setCurrentBranchId,
    addBranch,
    updateBranch,
    t,
    language,
    hasPermission,
  } = usePOS();

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Form State
  const [nameAr, setNameAr] = useState<string>('');
  const [nameEn, setNameEn] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [addressAr, setAddressAr] = useState<string>('');
  const [addressEn, setAddressEn] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [crNumber, setCrNumber] = useState<string>('');
  const [vatNumber, setVatNumber] = useState<string>('');
  const [managerName, setManagerName] = useState<string>('');

  const handleOpenAdd = () => {
    setEditingBranch(null);
    setNameAr('');
    setNameEn('');
    setCode(`BR-0${branches.length + 1}`);
    setAddressAr('');
    setAddressEn('');
    setPhone('+968 2400 0000');
    setCrNumber(currentBranch.crNumber);
    setVatNumber(currentBranch.vatNumber);
    setManagerName('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setNameAr(branch.nameAr);
    setNameEn(branch.nameEn);
    setCode(branch.code);
    setAddressAr(branch.addressAr);
    setAddressEn(branch.addressEn);
    setPhone(branch.phone);
    setCrNumber(branch.crNumber);
    setVatNumber(branch.vatNumber);
    setManagerName(branch.managerName || '');
    setIsAddModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr.trim()) return;

    if (editingBranch) {
      updateBranch(editingBranch.id, {
        nameAr,
        nameEn: nameEn || nameAr,
        code,
        addressAr,
        addressEn: addressEn || addressAr,
        phone,
        crNumber,
        vatNumber,
        managerName,
      });
    } else {
      addBranch({
        nameAr,
        nameEn: nameEn || nameAr,
        code,
        addressAr,
        addressEn: addressEn || addressAr,
        phone,
        crNumber,
        vatNumber,
        isMain: branches.length === 0,
        managerName,
      });
    }

    setIsAddModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-y-auto">
      {/* Top Header */}
      <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-white text-base">{t.tabBranches}</h2>
            <p className="text-xs text-slate-400">
              {branches.length} {language === 'ar' ? 'فروع مشمولة في النظام' : 'Managed Branches'}
            </p>
          </div>
        </div>

        {hasPermission('manager') && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addBranch}</span>
          </button>
        )}
      </div>

      {/* Branches Grid */}
      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map((branch) => {
            const isCurrent = currentBranch.id === branch.id;

            return (
              <div
                key={branch.id}
                className={`p-5 rounded-2xl border transition-all space-y-4 ${
                  isCurrent
                    ? 'border-amber-500/60 bg-amber-500/5 shadow-lg shadow-amber-500/5'
                    : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
                }`}
              >
                {/* Branch Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-sm">
                        {language === 'ar' ? branch.nameAr : branch.nameEn}
                      </h3>
                      {branch.isMain && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                          {t.mainBranch}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 mt-0.5 block">
                      CODE: {branch.code}
                    </span>
                  </div>

                  {hasPermission('manager') && (
                    <button
                      onClick={() => handleOpenEdit(branch)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-2 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <span className="leading-tight text-slate-300">
                      {language === 'ar' ? branch.addressAr : branch.addressEn}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="font-mono text-slate-300">{branch.phone}</span>
                  </div>
                  {branch.managerName && (
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="text-slate-300">
                        {t.branchManager}: {branch.managerName}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-[11px] font-mono text-slate-500 pt-1">
                    <span>{t.crNumberLabel}: {branch.crNumber}</span>
                    <span>{t.vatNumberLabel}: {branch.vatNumber}</span>
                  </div>
                </div>

                {/* Branch Switch Button */}
                <div className="pt-2">
                  {isCurrent ? (
                    <div className="w-full py-2 bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5">
                      <Check className="w-4 h-4" />
                      <span>{language === 'ar' ? 'الفرع النشط حالياً' : 'Active Branch'}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setCurrentBranchId(branch.id)}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors border border-slate-700"
                    >
                      {t.switchBranch}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit Branch Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4 my-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                {editingBranch ? t.editProduct : t.addBranch}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">{t.branchNameAr} *:</label>
                  <input
                    type="text"
                    required
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    placeholder="مثال: فرع صلالة"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">{t.branchNameEn}:</label>
                  <input
                    type="text"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="e.g. Salalah Branch"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">{t.branchCode} *:</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="SLL-02"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">{t.branchPhone}:</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">{t.branchAddressAr}:</label>
                <input
                  type="text"
                  value={addressAr}
                  onChange={(e) => setAddressAr(e.target.value)}
                  placeholder="شارع السلطان قابوس، صلالة"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">{t.branchManager}:</label>
                <input
                  type="text"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  placeholder="اسم مدير الفرع"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">{t.crNumberLabel}:</label>
                  <input
                    type="text"
                    value={crNumber}
                    onChange={(e) => setCrNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">{t.vatNumberLabel}:</label>
                  <input
                    type="text"
                    value={vatNumber}
                    onChange={(e) => setVatNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
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
