import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  deleteProductFromFirestore,
  subscribeToBranches,
  subscribeToExpenses,
  subscribeToOrders,
  subscribeToProducts,
  subscribeToStaff,
  syncBranchToFirestore,
  syncExpenseToFirestore,
  syncOrderToFirestore,
  syncProductToFirestore,
  syncSettingsToFirestore,
  syncStaffToFirestore,
  testConnection,
} from '../services/firebase';
import {
  Branch,
  CartItem,
  Category,
  Expense,
  HeldOrder,
  Order,
  PaymentDetails,
  Product,
  StaffMember,
  StockAdjustment,
  SystemSettings,
  UserRole,
} from '../types/pos';
import { posAudio } from '../utils/audio';
import {
  INITIAL_BRANCHES,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS,
  INITIAL_STAFF,
} from '../utils/sampleData';
import { Language, translations } from '../utils/translations';

interface POSContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['ar'];

  // Cloud Status
  isCloudConnected: boolean;
  cloudSyncTime: string | null;
  seedInitialDataToCloud: () => Promise<void>;

  // Auth & Branch
  currentStaff: StaffMember;
  currentBranch: Branch;
  staffList: StaffMember[];
  branches: Branch[];
  switchStaffByPin: (pin: string) => boolean;
  setCurrentBranchId: (branchId: string) => void;
  hasPermission: (requiredRole: UserRole) => boolean;

  // Products & Categories
  products: Product[];
  categories: Category[];
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (
    productId: string,
    type: 'add' | 'damage' | 'audit' | 'return',
    quantityChange: number,
    reason: string
  ) => void;

  // Cart & POS Terminal
  cart: CartItem[];
  cartSubtotal: number;
  cartVat: number;
  cartTotal: number;
  cartDiscount: number;
  setCartDiscount: (discount: number) => void;
  addToCart: (product: Product, quantity?: number) => void;
  updateCartItemQty: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;

  // Held Orders
  heldOrders: HeldOrder[];
  holdCurrentCart: (customerName?: string, note?: string) => boolean;
  recallHeldOrder: (heldOrderId: string) => void;
  deleteHeldOrder: (heldOrderId: string) => void;

  // Payments & Orders
  completePayment: (
    paymentDetails: PaymentDetails,
    customerName?: string,
    customerPhone?: string,
    notes?: string
  ) => Order;
  orders: Order[];
  refundOrder: (orderId: string) => void;

  // Expenses & Accounting
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;

  // Staff & Branch Management
  addStaffMember: (member: Omit<StaffMember, 'id'>) => void;
  updateStaffMember: (id: string, member: Partial<StaffMember>) => void;
  deleteStaffMember: (id: string) => void;
  addBranch: (branch: Omit<Branch, 'id'>) => void;
  updateBranch: (id: string, branch: Partial<Branch>) => void;

  // System Settings & Backup
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  exportDatabaseJson: () => void;
  importDatabaseJson: (jsonString: string) => boolean;
  resetToDefaultData: () => void;

  // Quick View modals state
  lastCompletedOrder: Order | null;
  setLastCompletedOrder: (order: Order | null) => void;
  isReceiptModalOpen: boolean;
  setIsReceiptModalOpen: (open: boolean) => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

const STORAGE_KEYS = {
  LANG: 'roguebyte_pos_lang',
  PRODUCTS: 'roguebyte_pos_products',
  BRANCHES: 'roguebyte_pos_branches',
  STAFF: 'roguebyte_pos_staff',
  CURRENT_STAFF_ID: 'roguebyte_pos_current_staff_id',
  CURRENT_BRANCH_ID: 'roguebyte_pos_current_branch_id',
  ORDERS: 'roguebyte_pos_orders',
  EXPENSES: 'roguebyte_pos_expenses',
  HELD_ORDERS: 'roguebyte_pos_held_orders',
  SETTINGS: 'roguebyte_pos_settings',
  SOUND: 'roguebyte_pos_sound',
};

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Language state
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LANG);
    return saved === 'en' ? 'en' : 'ar';
  });

  const t = translations[language];

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEYS.LANG, lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    }
  }, [language]);

  // 2. Sound state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SOUND);
    return saved !== null ? saved === 'true' : true;
  });

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    posAudio.setEnabled(next);
    localStorage.setItem(STORAGE_KEYS.SOUND, String(next));
  };

  // 3. Cloud Connection State (Firebase Firestore)
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(true);
  const [cloudSyncTime, setCloudSyncTime] = useState<string | null>(null);

  // 4. Branches
  const [branches, setBranches] = useState<Branch[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BRANCHES);
      return saved ? JSON.parse(saved) : INITIAL_BRANCHES;
    } catch {
      return INITIAL_BRANCHES;
    }
  });

  const [currentBranchId, setCurrentBranchIdState] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_BRANCH_ID);
    return saved || INITIAL_BRANCHES[0].id;
  });

  const currentBranch = branches.find((b) => b.id === currentBranchId) || branches[0] || INITIAL_BRANCHES[0];

  const setCurrentBranchId = (branchId: string) => {
    setCurrentBranchIdState(branchId);
    localStorage.setItem(STORAGE_KEYS.CURRENT_BRANCH_ID, branchId);
  };

  // 5. Staff members
  const [staffList, setStaffList] = useState<StaffMember[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STAFF);
      return saved ? JSON.parse(saved) : INITIAL_STAFF;
    } catch {
      return INITIAL_STAFF;
    }
  });

  const [currentStaffId, setCurrentStaffId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_STAFF_ID);
    return saved || INITIAL_STAFF[0].id;
  });

  const currentStaff = staffList.find((s) => s.id === currentStaffId) || staffList[0] || INITIAL_STAFF[0];

  const switchStaffByPin = (pin: string): boolean => {
    const matched = staffList.find((s) => s.pinCode === pin.trim() && s.isActive);
    if (matched) {
      setCurrentStaffId(matched.id);
      localStorage.setItem(STORAGE_KEYS.CURRENT_STAFF_ID, matched.id);
      posAudio.playScanBeep();
      return true;
    }
    posAudio.playError();
    return false;
  };

  const hasPermission = (requiredRole: UserRole): boolean => {
    if (currentStaff.role === 'manager') return true;
    if (requiredRole === 'accountant') return currentStaff.role === 'accountant';
    if (requiredRole === 'cashier') return true;
    return false;
  };

  // 6. Products & Categories
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const categories = INITIAL_CATEGORIES;

  // 7. Settings
  const [settings, setSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
      syncSettingsToFirestore(updated).catch(() => {});
      return updated;
    });
  };

  // 8. Orders & Expenses
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 9. Held Orders
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HELD_ORDERS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 10. Firebase Real-Time Firestore Sync Listeners
  useEffect(() => {
    let unsubProducts = () => {};
    let unsubOrders = () => {};
    let unsubExpenses = () => {};
    let unsubBranches = () => {};
    let unsubStaff = () => {};

    // Test Firestore connection on boot
    testConnection().then((connected) => {
      setIsCloudConnected(connected);
      if (connected) {
        setCloudSyncTime(new Date().toLocaleTimeString());
      }
    });

    try {
      unsubProducts = subscribeToProducts((cloudProds) => {
        if (cloudProds.length > 0) {
          setProducts(cloudProds);
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(cloudProds));
          setCloudSyncTime(new Date().toLocaleTimeString());
        } else {
          // If Firestore collection is empty, seed initial products
          seedInitialDataToCloud();
        }
      });

      unsubOrders = subscribeToOrders((cloudOrders) => {
        if (cloudOrders.length > 0) {
          setOrders(cloudOrders);
          localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(cloudOrders));
          setCloudSyncTime(new Date().toLocaleTimeString());
        }
      });

      unsubExpenses = subscribeToExpenses((cloudExpenses) => {
        if (cloudExpenses.length > 0) {
          setExpenses(cloudExpenses);
          localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(cloudExpenses));
        }
      });

      unsubBranches = subscribeToBranches((cloudBranches) => {
        if (cloudBranches.length > 0) {
          setBranches(cloudBranches);
          localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(cloudBranches));
        }
      });

      unsubStaff = subscribeToStaff((cloudStaff) => {
        if (cloudStaff.length > 0) {
          setStaffList(cloudStaff);
          localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(cloudStaff));
        }
      });
    } catch {
      // Offline fallback
    }

    return () => {
      unsubProducts();
      unsubOrders();
      unsubExpenses();
      unsubBranches();
      unsubStaff();
    };
  }, []);

  // Seed sample data to Firestore if cloud is empty
  const seedInitialDataToCloud = async () => {
    try {
      for (const prod of INITIAL_PRODUCTS) {
        await syncProductToFirestore(prod);
      }
      for (const branch of INITIAL_BRANCHES) {
        await syncBranchToFirestore(branch);
      }
      for (const staff of INITIAL_STAFF) {
        await syncStaffToFirestore(staff);
      }
      await syncSettingsToFirestore(INITIAL_SETTINGS);
      setCloudSyncTime(new Date().toLocaleTimeString());
    } catch (e) {
      console.warn('Initial cloud seed finished or skipped:', e);
    }
  };

  // Local storage synchronization guards
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(branches));
  }, [branches]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staffList));
  }, [staffList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HELD_ORDERS, JSON.stringify(heldOrders));
  }, [heldOrders]);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartDiscount, setCartDiscount] = useState<number>(0);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);

  const cartSubtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const effectiveSubtotalAfterDiscount = Math.max(0, cartSubtotal - cartDiscount);
  const cartVat = Number(((effectiveSubtotalAfterDiscount * (settings.defaultTaxRate || 5)) / 100).toFixed(3));
  const cartTotal = Number((effectiveSubtotalAfterDiscount + cartVat).toFixed(3));

  const addToCart = (product: Product, quantity: number = 1) => {
    if (product.stockQuantity <= 0) {
      posAudio.playError();
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const nextQty = existing.quantity + quantity;
        return prev.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: nextQty,
                total: Number((item.unitPrice * nextQty).toFixed(3)),
              }
            : item
        );
      } else {
        return [
          ...prev,
          {
            product,
            quantity,
            unitPrice: product.sellingPrice,
            discount: 0,
            total: Number((product.sellingPrice * quantity).toFixed(3)),
          },
        ];
      }
    });

    posAudio.playScanBeep();
  };

  const updateCartItemQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const prod = products.find((p) => p.id === productId);
    if (prod && quantity > prod.stockQuantity) {
      posAudio.playError();
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity,
              total: Number((item.unitPrice * quantity).toFixed(3)),
            }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setCartDiscount(0);
  };

  // Hold / Recall cart
  const holdCurrentCart = (customerName?: string, note?: string): boolean => {
    if (cart.length === 0) return false;
    const newHeld: HeldOrder = {
      id: `held-${Date.now()}`,
      orderNumber: heldOrders.length + 1,
      createdAt: new Date().toISOString(),
      cashierName: currentStaff.nameAr,
      items: [...cart],
      customerName,
      note,
    };
    setHeldOrders((prev) => [newHeld, ...prev]);
    clearCart();
    posAudio.playScanBeep();
    return true;
  };

  const recallHeldOrder = (heldOrderId: string) => {
    const held = heldOrders.find((h) => h.id === heldOrderId);
    if (held) {
      setCart(held.items);
      setHeldOrders((prev) => prev.filter((h) => h.id !== heldOrderId));
      posAudio.playScanBeep();
    }
  };

  const deleteHeldOrder = (heldOrderId: string) => {
    setHeldOrders((prev) => prev.filter((h) => h.id !== heldOrderId));
  };

  // Complete Payment & Sale (Saves to state and pushes to Firestore)
  const completePayment = (
    paymentDetails: PaymentDetails,
    customerName?: string,
    customerPhone?: string,
    notes?: string
  ): Order => {
    const invoiceNum = `INV-${Date.now().toString().slice(-6)}`;
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      invoiceNumber: invoiceNum,
      orderNumber: orders.length + 1,
      branchId: currentBranch.id,
      branchName: language === 'ar' ? currentBranch.nameAr : currentBranch.nameEn,
      cashierId: currentStaff.id,
      cashierName: language === 'ar' ? currentStaff.nameAr : currentStaff.nameEn,
      customerName: customerName?.trim() || undefined,
      customerPhone: customerPhone?.trim() || undefined,
      items: [...cart],
      subtotal: cartSubtotal,
      discount: cartDiscount,
      vatAmount: cartVat,
      vatRate: settings.defaultTaxRate || 5,
      grandTotal: cartTotal,
      paymentDetails,
      status: 'completed',
      createdAt: new Date().toISOString(),
      notes,
    };

    // Deduct stock in state & cloud
    setProducts((prev) =>
      prev.map((prod) => {
        const cartItem = cart.find((c) => c.product.id === prod.id);
        if (cartItem) {
          const newQty = Math.max(0, prod.stockQuantity - cartItem.quantity);
          const updatedProd = { ...prod, stockQuantity: newQty };
          syncProductToFirestore(updatedProd).catch(() => {});
          return updatedProd;
        }
        return prod;
      })
    );

    // Save order locally and sync to Firebase Firestore
    setOrders((prev) => [newOrder, ...prev]);
    syncOrderToFirestore(newOrder).catch(() => {});

    setLastCompletedOrder(newOrder);
    setIsReceiptModalOpen(true);
    clearCart();
    posAudio.playSuccessChime();

    return newOrder;
  };

  const refundOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId && ord.status !== 'refunded') {
          // Restore stock
          setProducts((prodList) =>
            prodList.map((prod) => {
              const item = ord.items.find((i) => i.product.id === prod.id);
              if (item) {
                const updated = { ...prod, stockQuantity: prod.stockQuantity + item.quantity };
                syncProductToFirestore(updated).catch(() => {});
                return updated;
              }
              return prod;
            })
          );
          const refundedOrder: Order = { ...ord, status: 'refunded' };
          syncOrderToFirestore(refundedOrder).catch(() => {});
          return refundedOrder;
        }
        return ord;
      })
    );
  };

  // Product CRUD
  const addProduct = (productData: Omit<Product, 'id'>): Product => {
    const newProd: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [newProd, ...prev]);
    syncProductToFirestore(newProd).catch(() => {});
    return newProd;
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...productData };
          syncProductToFirestore(updated).catch(() => {});
          return updated;
        }
        return p;
      })
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    deleteProductFromFirestore(id).catch(() => {});
  };

  const adjustStock = (
    productId: string,
    type: 'add' | 'damage' | 'audit' | 'return',
    quantityChange: number,
    reason: string
  ) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          let nextQty = p.stockQuantity;
          if (type === 'add' || type === 'return') nextQty += quantityChange;
          if (type === 'damage') nextQty = Math.max(0, nextQty - Math.abs(quantityChange));
          if (type === 'audit') nextQty = Math.max(0, quantityChange);
          const updated = { ...p, stockQuantity: nextQty };
          syncProductToFirestore(updated).catch(() => {});
          return updated;
        }
        return p;
      })
    );
  };

  // Expenses CRUD
  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExp: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
    };
    setExpenses((prev) => [newExp, ...prev]);
    syncExpenseToFirestore(newExp).catch(() => {});
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Staff CRUD
  const addStaffMember = (member: Omit<StaffMember, 'id'>) => {
    const newMember: StaffMember = {
      ...member,
      id: `staff-${Date.now()}`,
    };
    setStaffList((prev) => [...prev, newMember]);
    syncStaffToFirestore(newMember).catch(() => {});
  };

  const updateStaffMember = (id: string, member: Partial<StaffMember>) => {
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updated = { ...s, ...member };
          syncStaffToFirestore(updated).catch(() => {});
          return updated;
        }
        return s;
      })
    );
  };

  const deleteStaffMember = (id: string) => {
    setStaffList((prev) => prev.filter((s) => s.id !== id));
  };

  // Branch CRUD
  const addBranch = (branchData: Omit<Branch, 'id'>) => {
    const newBranch: Branch = {
      ...branchData,
      id: `branch-${Date.now()}`,
    };
    setBranches((prev) => [...prev, newBranch]);
    syncBranchToFirestore(newBranch).catch(() => {});
  };

  const updateBranch = (id: string, branchData: Partial<Branch>) => {
    setBranches((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const updated = { ...b, ...branchData };
          syncBranchToFirestore(updated).catch(() => {});
          return updated;
        }
        return b;
      })
    );
  };

  // Export JSON Backup
  const exportDatabaseJson = () => {
    const dump = {
      version: '1.0.0',
      system: 'RogueByte POS',
      exportDate: new Date().toISOString(),
      products,
      branches,
      staffList,
      settings,
      orders,
      expenses,
      heldOrders,
    };
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roguebyte-pos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON Backup
  const importDatabaseJson = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
        data.products.forEach((p: Product) => syncProductToFirestore(p).catch(() => {}));
      }
      if (data.branches && Array.isArray(data.branches)) {
        setBranches(data.branches);
        data.branches.forEach((b: Branch) => syncBranchToFirestore(b).catch(() => {}));
      }
      if (data.staffList && Array.isArray(data.staffList)) {
        setStaffList(data.staffList);
        data.staffList.forEach((s: StaffMember) => syncStaffToFirestore(s).catch(() => {}));
      }
      if (data.settings) {
        setSettings(data.settings);
        syncSettingsToFirestore(data.settings).catch(() => {});
      }
      if (data.orders && Array.isArray(data.orders)) {
        setOrders(data.orders);
        data.orders.forEach((o: Order) => syncOrderToFirestore(o).catch(() => {}));
      }
      if (data.expenses && Array.isArray(data.expenses)) {
        setExpenses(data.expenses);
        data.expenses.forEach((e: Expense) => syncExpenseToFirestore(e).catch(() => {}));
      }
      return true;
    } catch {
      return false;
    }
  };

  // Reset to Default Demo
  const resetToDefaultData = () => {
    setProducts(INITIAL_PRODUCTS);
    setBranches(INITIAL_BRANCHES);
    setStaffList(INITIAL_STAFF);
    setSettings(INITIAL_SETTINGS);
    setOrders([]);
    setExpenses([]);
    setHeldOrders([]);
    clearCart();
    localStorage.clear();
    seedInitialDataToCloud();
  };

  return (
    <POSContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isCloudConnected,
        cloudSyncTime,
        seedInitialDataToCloud,
        currentStaff,
        currentBranch,
        staffList,
        branches,
        switchStaffByPin,
        setCurrentBranchId,
        hasPermission,
        products,
        categories,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
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
        completePayment,
        orders,
        refundOrder,
        expenses,
        addExpense,
        deleteExpense,
        addStaffMember,
        updateStaffMember,
        deleteStaffMember,
        addBranch,
        updateBranch,
        settings,
        updateSettings,
        soundEnabled,
        toggleSound,
        exportDatabaseJson,
        importDatabaseJson,
        resetToDefaultData,
        lastCompletedOrder,
        setLastCompletedOrder,
        isReceiptModalOpen,
        setIsReceiptModalOpen,
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = (): POSContextType => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};
