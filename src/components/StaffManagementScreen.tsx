import React, { useState } from 'react';
import {
  Check,
  Edit2,
  KeyRound,
  Lock,
  Plus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { StaffMember, UserRole } from '../types/pos';

export const StaffManagementScreen: React.FC = () => {
  const {
    staffList,
    branches,
    currentStaff,
    addStaffMember,
    updateStaffMember,
    deleteStaffMember,
    t,
    language,
    hasPermission,
  } = usePOS();

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  // Form fields
  const [nameAr, setNameAr] = useState<string>('');
  const [nameEn, setNameEn] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [pinCode, setPinCode] = useState<string>('');
  const [role, setRole] = useState<UserRole>('cashier');
  const [branchId, setBranchId] = useState<string>(branches[0]?.id || 'branch-muscat');
  const [isActive, setIsActive] = useState<boolean>(true);

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setNameAr('');
    setNameEn('');
    setEmail('');
    setPhone('+968 9');
    setPinCode(`${Math.floor(1000 + Math.random() * 9000)}`);
    setRole('cashier');
    setBranchId(branches[0]?.id || 'branch-muscat');
    setIsActive(true);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (staff: StaffMember) => {
    setEditingStaff(staff);
    setNameAr(staff.nameAr);
    setNameEn(staff.nameEn);
    setEmail(staff.email);
    setPhone(staff.phone || '');
    setPinCode(staff.pinCode);
    setRole(staff.role);
    setBranchId(staff.branchId);
    setIsActive(staff.isActive);
    setIsAddModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr.trim() || !pinCode.trim()) return;

    if (editingStaff) {
      updateStaffMember(editingStaff.id, {
        nameAr,
        nameEn: nameEn || nameAr,
        email,
        phone,
        pinCode,
        role,
        branchId,
        isActive,
      });
    } else {
      addStaffMember({
        nameAr,
        nameEn: nameEn || nameAr,
        email: email || `${pinCode}@roguebyte.online`,
        phone,
        pinCode,
        role,
        branchId,
        isActive,
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
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-white text-base">{t.tabStaff}</h2>
            <p className="text-xs text-slate-400">{t.rolePermissionsInfo}</p>
          </div>
        </div>

        {hasPermission('manager') && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-amber-500/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.addStaff}</span>
          </button>
        )}
      </div>

      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Roles & Permissions Reference Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Cashier */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-sky-400">
              <Shield className="w-4 h-4" />
              <h4 className="font-bold text-xs text-white uppercase tracking-wider">{t.cashier} (Cashier)</h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {language === 'ar'
                ? 'إجراء عمليات البيع المباشرة، مسح الباركود، استلام النقد والبطاقات، إصدار الفواتير الحرارية، وتعليق الطلبات.'
                : 'Operate sales terminal, barcode scanning, cash/card collection, print thermal receipts, and hold orders.'}
            </p>
          </div>

          {/* Accountant */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400">
              <ShieldCheck className="w-4 h-4" />
              <h4 className="font-bold text-xs text-white uppercase tracking-wider">{t.accountant} (Accountant)</h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {language === 'ar'
                ? 'مراجعة سجل الفواتير والمبيعات، تقارير الأرباح والخسائر، ضريبة 5% المحصلة، وإدارة المصروفات التشغيلية.'
                : 'Review sales invoices, P&L reports, 5% VAT declarations, operational expenses, and shift audits.'}
            </p>
          </div>

          {/* Manager / System Admin */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-rose-400">
              <ShieldAlert className="w-4 h-4" />
              <h4 className="font-bold text-xs text-white uppercase tracking-wider">{t.manager} (System Admin)</h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {language === 'ar'
                ? 'صلاحية كاملة غير مقيدة: تسعير المنتجات، تعديل المخزون، إدارة الأفرع والموظفين، إعدادات الفاتورة والمدير.'
                : 'Full unrestricted access: product pricing, inventory overrides, branch & staff management, and system settings.'}
            </p>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left rtl:text-right border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold">
                <th className="py-3 px-4">{t.staffName}</th>
                <th className="py-3 px-4">{t.staffRole}</th>
                <th className="py-3 px-4">{t.staffBranch}</th>
                <th className="py-3 px-4">{t.staffPin}</th>
                <th className="py-3 px-4 text-center">{t.staffStatus}</th>
                <th className="py-3 px-4 text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {staffList.map((staff) => {
                const isCurrent = currentStaff.id === staff.id;
                const branchObj = branches.find((b) => b.id === staff.branchId);

                return (
                  <tr key={staff.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-amber-400 shrink-0">
                          {staff.nameAr[0]}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{language === 'ar' ? staff.nameAr : staff.nameEn}</span>
                            {isCurrent && (
                              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.2 rounded border border-amber-500/30">
                                {language === 'ar' ? 'أنت' : 'You'}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">{staff.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold ${
                          staff.role === 'manager'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : staff.role === 'accountant'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                        }`}
                      >
                        {staff.role === 'manager'
                          ? t.manager
                          : staff.role === 'accountant'
                          ? t.accountant
                          : t.cashier}
                      </span>
                    </td>

                    {/* Branch */}
                    <td className="py-3 px-4 text-slate-300">
                      {branchObj ? (language === 'ar' ? branchObj.nameAr : branchObj.nameEn) : '—'}
                    </td>

                    {/* PIN */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-300">
                      {hasPermission('manager') || staff.id === currentStaff.id ? `•••• (${staff.pinCode})` : '••••'}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          staff.isActive
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {staff.isActive ? t.active : t.inactive}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      {hasPermission('manager') && (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(staff)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {staff.id !== currentStaff.id && (
                            <button
                              onClick={() => {
                                if (window.confirm(language === 'ar' ? 'هل تريد حذف هذا الموظف؟' : 'Delete staff member?')) {
                                  deleteStaffMember(staff.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4 my-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                {editingStaff ? t.editProduct : t.addStaff}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">{t.staffName} (عربي) *:</label>
                <input
                  type="text"
                  required
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder="مثال: سالم الحارثي"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">{t.staffName} (English):</label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="e.g. Salim Al-Harthy"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">{t.staffRole} *:</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                  >
                    <option value="cashier">{t.cashier}</option>
                    <option value="accountant">{t.accountant}</option>
                    <option value="manager">{t.manager}</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">{t.staffPin} *:</label>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder="4 أرقام"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono font-bold tracking-widest text-center"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">{t.staffBranch}:</label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {language === 'ar' ? b.nameAr : b.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">{t.staffEmail}:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="salim@roguebyte.online"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">{t.staffPhone}:</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="staffActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-0"
                />
                <label htmlFor="staffActive" className="text-xs text-slate-300">
                  {t.active} ({language === 'ar' ? 'الموظف نشط ويمكنه الدخول للنظام' : 'Active and allowed to login'})
                </label>
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
