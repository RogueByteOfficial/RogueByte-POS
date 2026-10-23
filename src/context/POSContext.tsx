import React, { createContext, useContext, useEffect, useState } from 'react';
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
  adjustStock: (productId: string, type: 'add' | 'damage' | 'audit' | 'return', quantityChange: number, reason: string) => void;

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
  completePayment: (paymentDetails: PaymentDetails, customerName?: string, customerPhone?: string, notes?: string) => Order;
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

  // 3. Branches
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

  // 4. Staff members
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
    if (requiredRole === 'cashier') return true; // all staff can act as cashier
    return false;
  };

  // 5. Products & Categories
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const categories = INITIAL_CATEGORIES;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(branches));
  }, [branches]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staffList));
  }, [staffList]);

  // 6. Settings
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
      return updated;
    });
  };

  // 7. Orders & Expenses
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return saved ? JSON.parse(saved) : [
        {
          id: 'exp-01',
          titleAr: 'فاتورة الكهرباء والإنارة لشهر أكتوبر',
          titleEn: 'Electricity bill for October',
          amount: 45.500,
          category: 'utilities',
          branchId: 'branch-muscat',
          date: new Date(Date.now() - 86400000 * 2).toISOString(),
          recordedBy: 'مهدي عادل (Adel Mouahdi)',
        },
        {
          id: 'exp-02',
          titleAr: 'شراء كراتين ورق حراري وأكياس تغليف',
          titleEn: 'Thermal paper and packaging bags',
          amount: 18.000,
          category: 'supplies',
          branchId: 'branch-muscat',
          date: new Date(Date.now() - 86400000 * 5).toISOString(),
          recordedBy: 'مهدي عادل (Adel Mouahdi)',
        }
      ];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  // 8. Held Orders
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HELD_ORDERS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HELD_ORDERS, JSON.stringify(heldOrders));
  }, [heldOrders]);

  // 9. Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartDiscount, setCartDiscount] = useState<number>(0);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);

  const cartSubtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const effectiveSubtotalAfterDiscount = Math.max(0, cartSubtotal - cartDiscount);
  // Default tax rate (5% in Oman)
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

  // Complete Payment & Sale
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

    // Deduct stock
    setProducts((prev) =>
      prev.map((prod) => {
        const cartItem = cart.find((c) => c.product.id === prod.id);
        if (cartItem) {
          const newQty = Math.max(0, prod.stockQuantity - cartItem.quantity);
          return { ...prod, stockQuantity: newQty };
        }
        return prod;
      })
    );

    // Save order
    setOrders((prev) => [newOrder, ...prev]);
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
                return { ...prod, stockQuantity: prod.stockQuantity + item.quantity };
              }
              return prod;
            })
          );
          return { ...ord, status: 'refunded' };
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
    return newProd;
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...productData } : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
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
          return { ...p, stockQuantity: nextQty };
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
  };

  const updateStaffMember = (id: string, member: Partial<StaffMember>) => {
    setStaffList((prev) => prev.map((s) => (s.id === id ? { ...s, ...member } : s)));
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
  };

  const updateBranch = (id: string, branchData: Partial<Branch>) => {
    setBranches((prev) => prev.map((b) => (b.id === id ? { ...b, ...branchData } : b)));
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
      }
      if (data.branches && Array.isArray(data.branches)) {
        setBranches(data.branches);
      }
      if (data.staffList && Array.isArray(data.staffList)) {
        setStaffList(data.staffList);
      }
      if (data.settings) {
        setSettings(data.settings);
      }
      if (data.orders && Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
      if (data.expenses && Array.isArray(data.expenses)) {
        setExpenses(data.expenses);
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
  };

  return (
    <POSContext.Provider
      value={{
        language,
        setLanguage,
        t,
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
