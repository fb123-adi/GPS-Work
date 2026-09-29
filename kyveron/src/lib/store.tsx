import React, { createContext, useContext, useReducer, useCallback, useEffect, useMemo, ReactNode } from 'react';
import { CartItem, Cart, User, Order, Currency, formatPrice } from './types';
import { useDynamic, CATALOGUE_STORAGE_KEY } from './dynamicStore';

// ===== State Types =====
interface AppState {
  cartItems: CartItem[];
  couponCode?: string;
  user: User | null;
  isAuthenticated: boolean;
  wishlist: string[];
  currency: Currency;
  orders: Order[];
  toasts: Toast[];
  cookieConsent: CookieConsent;
  cookieSettingsOpen: boolean;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface CookieConsent {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  hasConsented: boolean;
  updatedAt?: string;
}

type Action =
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: { variantId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { variantId: string; quantity: number } }
  | { type: 'APPLY_COUPON'; payload: string }
  | { type: 'REMOVE_COUPON' }
  | { type: 'CLEAR_CART' }
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'TOGGLE_WISHLIST'; payload: string }
  | { type: 'SET_CURRENCY'; payload: Currency }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'ADD_TOAST'; payload: Toast }
  | { type: 'REMOVE_TOAST'; payload: string }
  | { type: 'SET_COOKIE_CONSENT'; payload: CookieConsent }
  | { type: 'SET_COOKIE_SETTINGS_OPEN'; payload: boolean }
  | { type: 'RESET' };

// ===== Browser storage =====
// The only personal-data-adjacent item this preview keeps in the browser is the cookie choice.
// Cart, orders, account and wishlist live in memory and disappear when the tab closes.
const CONSENT_KEY = 'kyveron_consent';
export const MAX_QUANTITY = 10;

const noConsent: CookieConsent = { necessary: true, analytics: false, marketing: false, hasConsented: false };

function loadConsent(): CookieConsent {
  try {
    const saved = localStorage.getItem(CONSENT_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { necessary: true, analytics: parsed.analytics === true, marketing: parsed.marketing === true, hasConsented: true, updatedAt: parsed.updatedAt };
    }
  } catch {}
  return noConsent;
}

function saveConsent(consent: CookieConsent) {
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ analytics: consent.analytics, marketing: consent.marketing, updatedAt: consent.updatedAt }));
  } catch {}
}

/** Keys this site may have written to localStorage, for the "delete my data" action. */
export function kyveronStorageKeys(): string[] {
  const keys = new Set([CONSENT_KEY, CATALOGUE_STORAGE_KEY]);
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('kyveron_')) keys.add(k);
    }
  } catch {}
  return [...keys];
}

// ===== Initial State =====
function initialState(): AppState {
  return {
    cartItems: [],
    user: null,
    isAuthenticated: false,
    wishlist: [],
    currency: 'INR',
    orders: [],
    toasts: [],
    cookieConsent: loadConsent(),
    cookieSettingsOpen: false,
  };
}

// ===== Pricing =====
// Catalogue prices already include GST. The total is items − discount + delivery; GST is shown
// as the amount already contained in that price, never added on top.
export interface PricingRules {
  freeShippingThreshold: number;
  shippingCharge: number;
  gstRate: number;
}

export function calculateCart(items: CartItem[], discount: number, rules: PricingRules, couponCode?: string): Cart {
  const subtotal = items.reduce((sum, item) => sum + item.product.basePrice * item.quantity, 0);
  const cappedDiscount = Math.min(discount, subtotal);
  const afterDiscount = subtotal - cappedDiscount;
  const shipping = items.length === 0 || afterDiscount >= rules.freeShippingThreshold ? 0 : rules.shippingCharge;
  const tax = Math.round(afterDiscount * rules.gstRate / (100 + rules.gstRate));
  return { items, subtotal, discount: cappedDiscount, shipping, tax, total: afterDiscount + shipping, couponCode: cappedDiscount > 0 ? couponCode : undefined };
}

// ===== Reducer =====
function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existing = state.cartItems.find(i => i.variantId === action.payload.variantId);
      const cartItems = existing
        ? state.cartItems.map(i => i.variantId === action.payload.variantId ? { ...i, quantity: Math.min(MAX_QUANTITY, i.quantity + action.payload.quantity) } : i)
        : [...state.cartItems, action.payload];
      return { ...state, cartItems };
    }
    case 'REMOVE_FROM_CART':
      return { ...state, cartItems: state.cartItems.filter(i => i.variantId !== action.payload.variantId) };
    case 'UPDATE_QUANTITY':
      if (action.payload.quantity <= 0) return { ...state, cartItems: state.cartItems.filter(i => i.variantId !== action.payload.variantId) };
      return { ...state, cartItems: state.cartItems.map(i => i.variantId === action.payload.variantId ? { ...i, quantity: Math.min(MAX_QUANTITY, action.payload.quantity) } : i) };
    case 'APPLY_COUPON':
      return { ...state, couponCode: action.payload };
    case 'REMOVE_COUPON':
      return { ...state, couponCode: undefined };
    case 'CLEAR_CART':
      return { ...state, cartItems: [], couponCode: undefined };
    case 'LOGIN':
      return { ...state, user: action.payload, isAuthenticated: true };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false };
    case 'UPDATE_USER':
      return state.user ? { ...state, user: { ...state.user, ...action.payload } } : state;
    case 'TOGGLE_WISHLIST': {
      const exists = state.wishlist.includes(action.payload);
      return { ...state, wishlist: exists ? state.wishlist.filter(id => id !== action.payload) : [...state.wishlist, action.payload] };
    }
    case 'SET_CURRENCY':
      return { ...state, currency: action.payload };
    case 'ADD_ORDER':
      return { ...state, orders: [action.payload, ...state.orders] };
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.payload] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };
    case 'SET_COOKIE_CONSENT':
      return { ...state, cookieConsent: action.payload, cookieSettingsOpen: false };
    case 'SET_COOKIE_SETTINGS_OPEN':
      return { ...state, cookieSettingsOpen: action.payload };
    case 'RESET':
      return { ...initialState(), cookieConsent: noConsent };
    default:
      return state;
  }
}

// ===== Context =====
interface StoreState extends AppState {
  cart: Cart;
}

interface StoreContextType {
  state: StoreState;
  dispatch: React.Dispatch<Action>;
  addToCart: (productId: string, variantId: string, size: string, color: string, quantity?: number) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;
  clearCart: () => void;
  login: (user: User) => void;
  logout: () => void;
  toggleWishlist: (productId: string) => void;
  setCurrency: (currency: Currency) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  formatPrice: (amount: number) => string;
  setCookieConsent: (choice: { analytics: boolean; marketing: boolean }) => void;
  openCookieSettings: () => void;
  deleteLocalData: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { state: dyn, validateCoupon } = useDynamic();
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    dispatch({ type: 'ADD_TOAST', payload: { id, message, type } });
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: id }), 4000);
  }, []);

  const addToCart = useCallback((productId: string, variantId: string, size: string, color: string, quantity = 1) => {
    const product = dyn.products.find(p => p.id === productId);
    if (!product) return;
    dispatch({ type: 'ADD_TO_CART', payload: { productId, variantId, size, color, quantity, product } });
    showToast('Added to cart', 'success');
  }, [dyn.products, showToast]);

  const removeFromCart = useCallback((variantId: string) => dispatch({ type: 'REMOVE_FROM_CART', payload: { variantId } }), []);
  const updateQuantity = useCallback((variantId: string, quantity: number) => dispatch({ type: 'UPDATE_QUANTITY', payload: { variantId, quantity } }), []);
  const applyCoupon = useCallback((code: string) => {
    dispatch({ type: 'APPLY_COUPON', payload: code.toUpperCase() });
    showToast('Coupon applied', 'success');
  }, [showToast]);
  const removeCoupon = useCallback(() => dispatch({ type: 'REMOVE_COUPON' }), []);
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR_CART' }), []);
  const login = useCallback((user: User) => dispatch({ type: 'LOGIN', payload: user }), []);
  const logout = useCallback(() => dispatch({ type: 'LOGOUT' }), []);
  const toggleWishlist = useCallback((productId: string) => dispatch({ type: 'TOGGLE_WISHLIST', payload: productId }), []);
  const setCurrency = useCallback((currency: Currency) => dispatch({ type: 'SET_CURRENCY', payload: currency }), []);

  const setCookieConsent = useCallback((choice: { analytics: boolean; marketing: boolean }) => {
    const consent: CookieConsent = { necessary: true, ...choice, hasConsented: true, updatedAt: new Date().toISOString() };
    saveConsent(consent);
    dispatch({ type: 'SET_COOKIE_CONSENT', payload: consent });
  }, []);
  const openCookieSettings = useCallback(() => dispatch({ type: 'SET_COOKIE_SETTINGS_OPEN', payload: true }), []);

  const deleteLocalData = useCallback(() => {
    try { kyveronStorageKeys().forEach(k => localStorage.removeItem(k)); } catch {}
    try { sessionStorage.clear(); } catch {}
    dispatch({ type: 'RESET' });
  }, []);

  // Keep cart lines in step with catalogue edits (price, name, images) and drop removed products.
  useEffect(() => {
    state.cartItems.forEach(item => {
      const product = dyn.products.find(p => p.id === item.productId);
      if (!product || !product.isPublished) dispatch({ type: 'REMOVE_FROM_CART', payload: { variantId: item.variantId } });
    });
  }, [dyn.products, state.cartItems]);

  const cart = useMemo(() => {
    const items = state.cartItems.flatMap(item => {
      const product = dyn.products.find(p => p.id === item.productId);
      return product ? [{ ...item, product }] : [];
    });
    const subtotal = items.reduce((sum, i) => sum + i.product.basePrice * i.quantity, 0);
    const coupon = state.couponCode ? validateCoupon(state.couponCode, subtotal) : null;
    return calculateCart(items, coupon?.valid ? coupon.discount : 0, dyn.settings, state.couponCode);
  }, [state.cartItems, state.couponCode, dyn.products, dyn.settings, validateCoupon]);

  const priceFormatter = useCallback((amount: number) => formatPrice(amount, state.currency), [state.currency]);

  return (
    <StoreContext.Provider value={{
      state: { ...state, cart }, dispatch, addToCart, removeFromCart, updateQuantity,
      applyCoupon, removeCoupon, clearCart, login, logout, toggleWishlist,
      setCurrency, showToast, formatPrice: priceFormatter,
      setCookieConsent, openCookieSettings, deleteLocalData,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
}

/**
 * Gate for any analytics or marketing script. Nothing optional is installed today; a future
 * SDK must only load when this returns true for its category.
 */
export function useConsent(category: 'analytics' | 'marketing') {
  const { state } = useStore();
  return state.cookieConsent.hasConsented && state.cookieConsent[category];
}
