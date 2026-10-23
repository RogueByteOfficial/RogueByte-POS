import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  collection,
  doc,
  getDocFromServer,
  getDocs,
  getFirestore,
  onSnapshot,
  setDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Branch, Expense, Order, Product, StaffMember, SystemSettings } from '../types/pos';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'settings', 'connection_test'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or connecting...');
      return false;
    }
    // Connected even if doc not found
    return true;
  }
}

// Collections listeners
export function subscribeToProducts(
  onData: (products: Product[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, 'products');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: Product[] = [];
      snapshot.forEach((d) => {
        items.push({ ...(d.data() as Product), id: d.id });
      });
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'products');
      onError?.(error);
    }
  );
}

export function subscribeToOrders(
  onData: (orders: Order[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, 'orders');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: Order[] = [];
      snapshot.forEach((d) => {
        items.push({ ...(d.data() as Order), id: d.id });
      });
      // Sort newest first
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'orders');
      onError?.(error);
    }
  );
}

export function subscribeToExpenses(
  onData: (expenses: Expense[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, 'expenses');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: Expense[] = [];
      snapshot.forEach((d) => {
        items.push({ ...(d.data() as Expense), id: d.id });
      });
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'expenses');
      onError?.(error);
    }
  );
}

export function subscribeToBranches(
  onData: (branches: Branch[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, 'branches');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: Branch[] = [];
      snapshot.forEach((d) => {
        items.push({ ...(d.data() as Branch), id: d.id });
      });
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'branches');
      onError?.(error);
    }
  );
}

export function subscribeToStaff(
  onData: (staff: StaffMember[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, 'staff');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: StaffMember[] = [];
      snapshot.forEach((d) => {
        items.push({ ...(d.data() as StaffMember), id: d.id });
      });
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'staff');
      onError?.(error);
    }
  );
}

// Writers
export async function syncProductToFirestore(product: Product) {
  const path = `products/${product.id}`;
  try {
    await setDoc(doc(db, 'products', product.id), product);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteProductFromFirestore(productId: string) {
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function syncOrderToFirestore(order: Order) {
  const path = `orders/${order.id}`;
  try {
    await setDoc(doc(db, 'orders', order.id), order);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncExpenseToFirestore(expense: Expense) {
  const path = `expenses/${expense.id}`;
  try {
    await setDoc(doc(db, 'expenses', expense.id), expense);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncBranchToFirestore(branch: Branch) {
  const path = `branches/${branch.id}`;
  try {
    await setDoc(doc(db, 'branches', branch.id), branch);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncStaffToFirestore(staff: StaffMember) {
  const path = `staff/${staff.id}`;
  try {
    await setDoc(doc(db, 'staff', staff.id), staff);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncSettingsToFirestore(settings: SystemSettings) {
  const path = `settings/global_config`;
  try {
    await setDoc(doc(db, 'settings', 'global_config'), settings);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
