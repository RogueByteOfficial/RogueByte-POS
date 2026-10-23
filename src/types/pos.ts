export type UserRole = 'cashier' | 'accountant' | 'manager';

export interface Product {
  id: string;
  barcode: string;
  sku: string;
  nameAr: string;
  nameEn: string;
  category: string;
  costPrice: number; // in OMR
  sellingPrice: number; // in OMR
  taxRate: number; // percent e.g. 5 for 5% VAT
  stockQuantity: number;
  minStockLevel: number;
  imageUrl?: string;
  branchId?: string; // specific branch or all
  descriptionAr?: string;
  descriptionEn?: string;
  unit: string; // 'قطعة' | 'حبة' | 'كغ' | 'علبة' | 'pcs'
}

export interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  icon?: string;
}

export interface Branch {
  id: string;
  nameAr: string;
  nameEn: string;
  code: string;
  addressAr: string;
  addressEn: string;
  phone: string;
  crNumber: string; // Commercial Registration
  vatNumber: string; // Tax ID
  isMain: boolean;
  managerName?: string;
}

export interface StaffMember {
  id: string;
  nameAr: string;
  nameEn: string;
  email: string;
  pinCode: string;
  role: UserRole;
  branchId: string;
  isActive: boolean;
  avatarUrl?: string;
  phone?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number; // in OMR
  discount: number; // in OMR
  total: number; // in OMR
}

export type PaymentMethod = 'cash' | 'card' | 'split' | 'credit' | 'mobile_pay';

export interface PaymentDetails {
  method: PaymentMethod;
  cashTendered?: number;
  changeAmount?: number;
  cardType?: string; // 'Visa' | 'MasterCard' | 'Debit'
  cardAuthCode?: string;
  splitCash?: number;
  splitCard?: number;
  creditCustomerName?: string;
  creditCustomerPhone?: string;
  creditDueDate?: string;
  transactionRef?: string;
}

export interface Order {
  id: string;
  invoiceNumber: string;
  orderNumber: number;
  branchId: string;
  branchName: string;
  cashierId: string;
  cashierName: string;
  customerName?: string;
  customerPhone?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  vatAmount: number;
  vatRate: number;
  grandTotal: number;
  paymentDetails: PaymentDetails;
  status: 'completed' | 'refunded' | 'cancelled';
  createdAt: string;
  notes?: string;
}

export interface HeldOrder {
  id: string;
  orderNumber: number;
  createdAt: string;
  cashierName: string;
  items: CartItem[];
  customerName?: string;
  note?: string;
}

export interface Expense {
  id: string;
  titleAr: string;
  titleEn: string;
  amount: number;
  category: 'rent' | 'utilities' | 'supplies' | 'salaries' | 'maintenance' | 'other';
  branchId: string;
  date: string;
  recordedBy: string;
  notes?: string;
}

export interface StockAdjustment {
  id: string;
  productId: string;
  productName: string;
  type: 'add' | 'damage' | 'audit' | 'return';
  quantityChange: number;
  previousStock: number;
  newStock: number;
  reason: string;
  branchId: string;
  staffName: string;
  date: string;
}

export interface SystemSettings {
  companyNameAr: string;
  companyNameEn: string;
  taglineAr: string;
  taglineEn: string;
  logoUrl: string;
  defaultTaxRate: number; // 5% standard in Oman
  currencyCode: string; // 'OMR'
  currencySymbolAr: string; // 'ر.ع.'
  currencySymbolEn: string; // 'OMR'
  crNumber: string;
  vatNumber: string;
  phone: string;
  email: string;
  website: string;
  addressAr: string;
  addressEn: string;
  receiptHeaderNoteAr: string;
  receiptHeaderNoteEn: string;
  receiptFooterNoteAr: string;
  receiptFooterNoteEn: string;
  receiptPaperWidth: '80mm' | '58mm' | 'a4';
  soundEnabled: boolean;
  lowStockThreshold: number;
  defaultBranchId: string;
}
