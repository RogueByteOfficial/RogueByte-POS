/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AboutScreen } from './components/AboutScreen';
import { AccountingScreen } from './components/AccountingScreen';
import { BranchManagementScreen } from './components/BranchManagementScreen';
import { InventoryScreen } from './components/InventoryScreen';
import { ActiveTab, Navbar } from './components/Navbar';
import { POSTerminal } from './components/POSTerminal';
import { ReceiptModal } from './components/ReceiptModal';
import { SalesLedgerScreen } from './components/SalesLedgerScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { StaffManagementScreen } from './components/StaffManagementScreen';
import { POSProvider, usePOS } from './context/POSContext';

const POSContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('pos');
  const { isReceiptModalOpen, setIsReceiptModalOpen, language } = usePOS();

  return (
    <div
      className={`min-h-screen h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden ${
        language === 'ar' ? 'font-sans' : 'font-sans'
      }`}
    >
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Viewport Content */}
      <main className="flex-1 flex overflow-hidden relative">
        {activeTab === 'pos' && <POSTerminal />}
        {activeTab === 'inventory' && <InventoryScreen />}
        {activeTab === 'sales' && <SalesLedgerScreen />}
        {activeTab === 'accounting' && <AccountingScreen />}
        {activeTab === 'branches' && <BranchManagementScreen />}
        {activeTab === 'staff' && <StaffManagementScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
        {activeTab === 'about' && <AboutScreen />}
      </main>

      {/* Global Thermal Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <POSProvider>
      <POSContent />
    </POSProvider>
  );
}
