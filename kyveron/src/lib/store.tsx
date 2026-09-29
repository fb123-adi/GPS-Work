import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { CartItem, Cart, User, Order, Address, Currency, formatPrice } from './types';
import { products } from './data';

// ===== State Types =====
interface AppState {
  cart: Cart;
  user: User | null;
  isAuthenticated: boolean;
  wishlist: string[];
  currency: Currency;
  orders: Order[];
  toasts: Toast[];
  cookieConsent: CookieConsent;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  hasConsented: boolean;
}

type Action =
  | { type: 'ADD_TO_CART'; payload: { productId: string; variantId: string; size: string; color: string; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: { variantId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { variantId: string; quantity: number } }
  | { type: 'APPLY_COUPON'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'TOGGLE_WISHLIST'; payload: string }
  | { type: 'SET_CURRENCY'; payload: Currency }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'ADD_TOAST'; payload: Toast }
  | { type: 'REMOVE_TOAST'; payload: string }
  | { type: 'SET_COOKIE_CONSENT'; payload: CookieConsent };

// ===== Initial State =====
const initialState: AppState = {
  cart: { items: [], subtotal: 0, discount: 0, shipping: 0, tax: 0, total: 0 },
  user: null,
  isAuthenticated: false,
  wishlist: [],
  currency: 'INR',
  orders: [],
  toasts: [],
  cookieConsent: { necessary: true, analytics: false, marketing: false, hasConsented: false },
};

// ===== Reducer =====
function calculateCart(items: CartItem[], couponCode?: string): Cart {
  const subtotal = items.reduce((sum, item) => sum + item.product.basePrice * item.quantity, 0);
  let discount = 0;
  if (couponCode === 'KYVERON10') discount = Math.min(subtotal * 0.1, 100000);
  else if (couponCode === 'FIRST500' && subtotal >= 250000) discount = 50000;
  else if (couponCode === 'PERF20' && subtotal >= 500000) discount = Math.min(subtotal * 0.2, 200000);
  const afterDiscount = subtotal - discount;
  const shipping = afterDiscount >= 99900 ? 0 : 9900;
  const tax = Math.round(afterDiscount * 0.05); // 5% GST estimate for display
  const total = afterDiscount + shipping + tax;
  return { items, subtotal, discount, shipping, tax, total, couponCode };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const product = products.find(p => p.id === action.payload.productId);
      if (!product) return state;
      const existing = state.cart.items.find(i => i.variantId === action.payload.variantId);
      let newItems: CartItem[];
      if (existing) {
        newItems = state.cart.items.map(i =>
          i.variantId === action.payload.variantId
            ? { ...i, quantity: i.quantity + action.payload.quantity }
            : i
        );
      } else {
        newItems = [...state.cart.items, {
          productId: action.payload.productId,
          variantId: action.payload.variantId,
          quantity: action.payload.quantity,
          size: action.payload.size,
          color: action.payload.color,
          product,
        }];
      }
      return { ...state, cart: calculateCart(newItems, state.cart.couponCode) };
    }
    case 'REMOVE_FROM_CART': {
      const newItems = state.cart.items.filter(i => i.variantId !== action.payload.variantId);
      return { ...state, cart: calculateCart(newItems, state.cart.couponCode) };
    }
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        const newItems = state.cart.items.filter(i => i.variantId !== action.payload.variantId);
        return { ...state, cart: calculateCart(newItems, state.cart.couponCode) };
      }
      const newItems = state.cart.items.map(i =>
        i.variantId === action.payload.variantId ? { ...i, quantity: action.payload.quantity } : i
      );
      return { ...state, cart: calculateCart(newItems, state.cart.couponCode) };
    }
    case 'APPLY_COUPON':
      return { ...state, cart: calculateCart(state.cart.items, action.payload) };
    case 'CLEAR_CART':
      return { ...state, cart: { items: [], subtotal: 0, discount: 0, shipping: 0, tax: 0, total: 0 } };
    case 'LOGIN':
      return { ...state, user: action.payload, isAuthenticated: true };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false };
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
      return { ...state, cookieConsent: action.payload };
    default:
      return state;
  }
}

// ===== Context =====
interface StoreContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  addToCart: (productId: string, variantId: string, size: string, color: string, quantity?: number) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  applyCoupon: (code: string) => void;
  clearCart: () => void;
  login: (user: User) => void;
  logout: () => void;
  toggleWishlist: (productId: string) => void;
  setCurrency: (currency: Currency) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  formatPrice: (amount: number) => string;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const addToCart = useCallback((productId: string, variantId: string, size: string, color: string, quantity = 1) => {
    dispatch({ type: 'ADD_TO_CART', payload: { productId, variantId, size, color, quantity } });
    dispatch({ type: 'ADD_TOAST', payload: { id: Date.now().toString(), message: 'Added to cart', type: 'success' } });
  }, []);

  const removeFromCart = useCallback((variantId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { variantId } });
  }, []);

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { variantId, quantity } });
  }, []);

  const applyCoupon = useCallback((code: string) => {
    dispatch({ type: 'APPLY_COUPON', payload: code.toUpperCase() });
    dispatch({ type: 'ADD_TOAST', payload: { id: Date.now().toString(), message: 'Coupon applied', type: 'success' } });
  }, []);

  const clearCart = useCallback(() => dispatch({ type: 'CLEAR_CART' }), []);
  const login = useCallback((user: User) => dispatch({ type: 'LOGIN', payload: user }), []);
  const logout = useCallback(() => dispatch({ type: 'LOGOUT' }), []);
  const toggleWishlist = useCallback((productId: string) => dispatch({ type: 'TOGGLE_WISHLIST', payload: productId }), []);
  const setCurrency = useCallback((currency: Currency) => dispatch({ type: 'SET_CURRENCY', payload: currency }), []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    dispatch({ type: 'ADD_TOAST', payload: { id, message, type } });
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: id }), 3000);
  }, []);

  const priceFormatter = useCallback((amount: number) => formatPrice(amount, state.currency), [state.currency]);

  return (
    <StoreContext.Provider value={{
      state, dispatch, addToCart, removeFromCart, updateQuantity,
      applyCoupon, clearCart, login, logout, toggleWishlist,
      setCurrency, showToast, formatPrice: priceFormatter,
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
