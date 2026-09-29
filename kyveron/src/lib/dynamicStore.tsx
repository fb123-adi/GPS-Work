import React, { createContext, useContext, useReducer, useCallback, ReactNode, useEffect } from 'react';
import { Product, Collection, Review, JournalPost, Coupon, Currency, formatPrice as formatPriceUtil } from './types';
import { BUSINESS } from './business';

// ===== Image Assets =====
export const IMAGES = {
  blackTee: {
    front: 'https://image.qwenlm.ai/generated-images/55be5e51-274a-4f23-859c-4a4bffc688e4/_result.png',
    detail: 'https://image.qwenlm.ai/generated-images/b46946c9-0d6a-44eb-9509-507cdd3cf088/_result.png',
  },
  navyJacket: { front: 'https://image.qwenlm.ai/generated-images/f3fc663b-92ea-4290-acae-0b99cabaef90/_result.png' },
  whitePolo: { front: 'https://image.qwenlm.ai/generated-images/ccc04096-7092-4db5-9858-e4de1fbcfc3c/_result.png' },
  charcoalJoggers: { front: 'https://image.qwenlm.ai/generated-images/dc3ece90-ff37-418a-815b-e92acf33258d/_result.png' },
  cobaltTee: { front: 'https://image.qwenlm.ai/generated-images/3827b2e1-8051-4056-843a-797b6816030d/_result.png' },
  stoneHoodie: { front: 'https://image.qwenlm.ai/generated-images/5e3bd815-9d92-48b7-b4c0-c509950fc871/_result.png' },
  hero: 'https://image.qwenlm.ai/generated-images/b60a3017-1024-49f0-93c7-d28592101d0c/_result.png',
  lifestyle: 'https://image.qwenlm.ai/generated-images/2ad141c4-414b-437f-a729-bedd40d09074/_result.png',
  brandStory: 'https://image.qwenlm.ai/generated-images/532d81d5-0bbb-4773-be73-d31abb3ec710/_result.png',
};

// ===== Default Products =====
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

function generateVariants(basePrice: number, colors: string[]) {
  return colors.flatMap((color) =>
    SIZES.map((size) => ({
      id: `var-${color}-${size}`.toLowerCase().replace(/\s/g, '-'),
      sku: `KYV-${color.substring(0, 3).toUpperCase()}-${size}`,
      size, color, price: basePrice,
      stock: 15 + Math.floor(Math.random() * 20),
      isAvailable: true,
    }))
  );
}

const defaultProducts: Product[] = [
  {
    id: 'prod-001', slug: 'obsidian-performance-tee', name: 'Obsidian Performance Tee',
    description: 'A heavyweight combed-cotton tee cut for training and everyday wear. The 220 GSM fabric has enough structure to keep its shape, with a slightly dropped hem.',
    shortDescription: 'Heavyweight combed-cotton tee with a slightly dropped hem.',
    category: 't-shirts', collection: 'core-performance', gender: 'unisex',
    fabric: '220 GSM combed cotton blend',
    careInstructions: ['Machine wash cold with like colors', 'Do not bleach', 'Tumble dry low', 'Iron on low heat if needed'],
    fit: 'Regular athletic fit with slightly dropped hem',
    seoTitle: 'Obsidian Performance Tee | Premium Cotton T-Shirt | Kyveron',
    seoDescription: 'Heavyweight 220 GSM combed-cotton tee.',
    images: [
      { id: 'img-001-1', url: IMAGES.blackTee.front, alt: 'Black heavyweight cotton performance t-shirt, front view', order: 1, type: 'front' },
      { id: 'img-001-2', url: IMAGES.blackTee.detail, alt: 'Close-up of premium cotton fabric texture', order: 2, type: 'detail' },
    ],
    variants: generateVariants(249900, ['Black', 'Charcoal']),
    basePrice: 249900, isFeatured: true, isNew: false, isPublished: true,
    stockTotal: 150, rating: 0, reviewCount: 0,
    tags: ['performance'], colors: ['Black', 'Charcoal'], sizes: SIZES,
  },
  {
    id: 'prod-002', slug: 'midnight-track-jacket', name: 'Midnight Track Jacket',
    description: 'A lightweight track jacket in a nylon-spandex blend with a matte finish, raglan sleeves, a stand collar and zipped pockets.',
    shortDescription: 'Lightweight technical track jacket with raglan sleeves and stand collar.',
    category: 'jackets', collection: 'core-performance', gender: 'men',
    fabric: 'Technical Nylon-Spandex Blend, 140 GSM',
    careInstructions: ['Machine wash cold, gentle cycle', 'Hang dry', 'Do not iron directly on print'],
    fit: 'Slim athletic fit',
    seoTitle: 'Midnight Track Jacket | Technical Sports Jacket | Kyveron',
    seoDescription: 'Lightweight technical track jacket.',
    images: [{ id: 'img-002-1', url: IMAGES.navyJacket.front, alt: 'Navy blue lightweight zip-up track jacket', order: 1, type: 'front' }],
    variants: generateVariants(499900, ['Navy', 'Black']),
    basePrice: 499900, isFeatured: true, isNew: true, isPublished: true,
    stockTotal: 80, rating: 0, reviewCount: 0,
    tags: ['new-arrival', 'performance'], colors: ['Navy', 'Black'], sizes: SIZES,
  },
  {
    id: 'prod-003', slug: 'ivory-classic-polo', name: 'Ivory Classic Polo',
    description: 'A pique cotton polo with a two-button placket, ribbed collar and a tailored fit.',
    shortDescription: 'Premium pique cotton polo with textured finish and tailored fit.',
    category: 'polos', collection: 'daily-luxury', gender: 'men',
    fabric: 'Premium Pique Cotton, 200 GSM',
    careInstructions: ['Machine wash cold', 'Tumble dry low', 'Warm iron if needed'],
    fit: 'Tailored fit with slight ease through body',
    seoTitle: 'Ivory Classic Polo | Premium Cotton Polo Shirt | Kyveron',
    seoDescription: 'Premium pique cotton polo shirt.',
    images: [{ id: 'img-003-1', url: IMAGES.whitePolo.front, alt: 'White premium pique cotton polo shirt', order: 1, type: 'front' }],
    variants: generateVariants(299900, ['White', 'Stone', 'Navy']),
    basePrice: 299900, isFeatured: true, isNew: false, isPublished: true,
    stockTotal: 120, rating: 0, reviewCount: 0,
    tags: ['classic', 'daily-wear'], colors: ['White', 'Stone', 'Navy'], sizes: SIZES,
  },
  {
    id: 'prod-004', slug: 'graphite-tailored-jogger', name: 'Graphite Tailored Jogger',
    description: 'A French terry jogger with a brushed interior, tapered leg, elasticated waistband and internal drawcord.',
    shortDescription: 'Premium French terry jogger with tapered leg and brushed interior.',
    category: 'joggers', collection: 'daily-luxury', gender: 'unisex',
    fabric: 'Premium French Terry Cotton, 320 GSM, Brushed Interior',
    careInstructions: ['Machine wash cold', 'Tumble dry low', 'Do not iron on elastic'],
    fit: 'Tapered athletic fit',
    seoTitle: 'Graphite Tailored Jogger | Premium Cotton Joggers | Kyveron',
    seoDescription: 'Premium French terry jogger pants.',
    images: [{ id: 'img-004-1', url: IMAGES.charcoalJoggers.front, alt: 'Charcoal grey tailored jogger pants', order: 1, type: 'front' }],
    variants: generateVariants(349900, ['Charcoal', 'Black', 'Stone']),
    basePrice: 349900, isFeatured: true, isNew: false, isPublished: true,
    stockTotal: 100, rating: 0, reviewCount: 0,
    tags: ['comfort'], colors: ['Charcoal', 'Black', 'Stone'], sizes: SIZES,
  },
  {
    id: 'prod-005', slug: 'cobalt-training-tee', name: 'Cobalt Training Tee',
    description: 'A training tee in a polyester-elastane blend with mesh side panels and a slightly longer back hem.',
    shortDescription: 'Polyester-elastane training tee with mesh side panels.',
    category: 't-shirts', collection: 'core-performance', gender: 'unisex',
    fabric: 'Technical Polyester-Elastane Blend with Mesh Panels, 150 GSM',
    careInstructions: ['Machine wash cold', 'Hang dry recommended', 'Do not iron'],
    fit: 'Athletic performance fit',
    seoTitle: 'Cobalt Training Tee | Performance Training Top | Kyveron',
    seoDescription: 'Technical training t-shirt.',
    images: [{ id: 'img-005-1', url: IMAGES.cobaltTee.front, alt: 'Deep cobalt blue performance training t-shirt', order: 1, type: 'front' }],
    variants: generateVariants(199900, ['Cobalt Blue', 'Black', 'White']),
    basePrice: 199900, isFeatured: false, isNew: true, isPublished: true,
    stockTotal: 200, rating: 0, reviewCount: 0,
    tags: ['new-arrival', 'training'], colors: ['Cobalt Blue', 'Black', 'White'], sizes: SIZES,
  },
  {
    id: 'prod-006', slug: 'stone-heritage-hoodie', name: 'Stone Heritage Hoodie',
    description: 'A 380 GSM brushed-fleece cotton hoodie with a double-layered hood, kangaroo pocket and ribbed cuffs and hem.',
    shortDescription: 'Premium heavyweight brushed fleece hoodie with double-layered hood.',
    category: 'hoodies', collection: 'daily-luxury', gender: 'unisex',
    fabric: 'Premium Brushed Fleece Cotton, 380 GSM',
    careInstructions: ['Machine wash cold, inside out', 'Tumble dry low', 'Do not iron on print'],
    fit: 'Relaxed oversized fit',
    seoTitle: 'Stone Heritage Hoodie | Premium Cotton Hoodie | Kyveron',
    seoDescription: 'Premium heavyweight brushed fleece hoodie.',
    images: [{ id: 'img-006-1', url: IMAGES.stoneHoodie.front, alt: 'Stone beige heavyweight cotton hoodie', order: 1, type: 'front' }],
    variants: generateVariants(399900, ['Stone', 'Black', 'Charcoal']),
    basePrice: 399900, isFeatured: false, isNew: true, isPublished: true,
    stockTotal: 60, rating: 0, reviewCount: 0,
    tags: ['premium', 'comfort'], colors: ['Stone', 'Black', 'Charcoal'], sizes: SIZES,
  },
];

const defaultCollections: Collection[] = [
  { id: 'col-001', slug: 'core-performance', name: 'Core Performance', description: 'Training and track pieces: tees and a track jacket cut for movement.', bannerImage: IMAGES.lifestyle, productCount: 3 },
  { id: 'col-002', slug: 'daily-luxury', name: 'Daily Luxury', description: 'Everyday pieces: polo, jogger and hoodie.', bannerImage: IMAGES.brandStory, productCount: 3 },
];

const defaultJournalPosts: JournalPost[] = [
  { id: 'post-001', slug: 'the-art-of-fabric-selection', title: 'The Art of Fabric Selection', excerpt: 'How we think about choosing materials for a Kyveron garment.', content: 'Every Kyveron garment begins with a question: what does this fabric need to do? Before we choose a material, we decide how it should drape, move and age.', coverImage: IMAGES.brandStory, author: 'Kyveron Design Team', publishedAt: '2024-12-01', tags: ['craftsmanship', 'materials'] },
  { id: 'post-002', slug: 'designing-for-movement', title: 'Designing for Movement', excerpt: 'The engineering decisions behind garments that move with you, not against you.', content: 'Performance apparel should disappear during activity. When you are training, the last thing you should think about is what you are wearing.', coverImage: IMAGES.lifestyle, author: 'Kyveron Design Team', publishedAt: '2024-11-15', tags: ['design', 'performance'] },
];

// ===== Homepage Content =====
interface HomepageContent {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroBadge: string;
  featuredTitle: string;
  featuredSubtitle: string;
  performanceTitle: string;
  performanceSubtitle: string;
  performanceDescription: string;
  performanceImage: string;
  storyTitle: string;
  storySubtitle: string;
  storyParagraphs: string[];
  newsletterTitle: string;
  newsletterSubtitle: string;
}

const defaultHomepage: HomepageContent = {
  heroTitle: 'Engineered for\nthose who move\nwith intention.',
  heroSubtitle: 'Daily wear and sportswear, designed with care.',
  heroImage: IMAGES.hero,
  heroBadge: 'Premium Indian Apparel',
  featuredTitle: 'Featured Products',
  featuredSubtitle: 'Curated Selection',
  performanceTitle: 'Built for movement.\nRefined for life.',
  performanceSubtitle: 'Core Performance',
  performanceDescription: 'Tees and a track jacket cut for training and for the rest of the day.',
  performanceImage: IMAGES.lifestyle,
  storyTitle: 'Every detail,\nconsidered.',
  storySubtitle: 'Our Philosophy',
  storyParagraphs: [
    'At Kyveron, we believe good apparel is about intention, not excess. We choose each fabric for how it feels and wears, and we list fabric weight, fit and care on every product.',
  ],
  newsletterTitle: 'Stay in the loop',
  newsletterSubtitle: 'Occasional emails about new collections and offers. Unsubscribe at any time.',
};

// ===== FAQ Items =====
interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const defaultFAQs: FAQItem[] = [
  { id: 'faq-1', question: 'What is your shipping timeline?', answer: 'Orders are processed within 1-2 business days. Delivery typically takes 3-5 business days for metro cities and 5-7 business days for other locations.' },
  { id: 'faq-2', question: 'Do you offer free shipping?', answer: 'Yes, we offer free shipping on all orders above ₹999. For orders below this amount, a flat shipping fee of ₹99 applies.' },
  { id: 'faq-3', question: 'What payment methods do you accept?', answer: 'Once online payments go live we plan to accept UPI, credit/debit cards, net banking, wallets and cash on delivery (a ₹49 fee applies to cash on delivery, shown before you place the order). This preview store does not take payments yet.' },
  { id: 'faq-4', question: 'How do I track my order?', answer: 'You can track your order on the "Track Order" page using your order number.' },
  { id: 'faq-5', question: 'What is your return policy?', answer: 'We offer a 7-day return window from the date of delivery. Items must be unused with original tags.' },
  { id: 'faq-6', question: 'How do I choose the right size?', answer: 'Each product page has a size guide with measurements in inches. If you are between sizes, size up for a relaxed fit.' },
];

// ===== Reviews =====
// Only genuine customer reviews belong here; none have been collected yet.
const defaultReviews: Review[] = [];

// ===== Coupons =====
const defaultCoupons: Coupon[] = [
  { id: 'coup-001', code: 'KYVERON10', type: 'percentage', value: 10, minCartValue: 200000, maxDiscount: 100000, startDate: '2024-01-01', endDate: '2025-12-31', usageLimit: 1000, usedCount: 234, isActive: true },
  { id: 'coup-002', code: 'FIRST500', type: 'fixed', value: 50000, minCartValue: 250000, startDate: '2024-01-01', endDate: '2025-12-31', usageLimit: 500, usedCount: 89, isActive: true },
  { id: 'coup-003', code: 'PERF20', type: 'percentage', value: 20, minCartValue: 500000, maxDiscount: 200000, startDate: '2024-12-01', endDate: '2025-01-31', usageLimit: 200, usedCount: 45, isActive: true },
];

// ===== Site Settings =====
interface SiteSettings {
  brandName: string;
  supportEmail: string;
  supportPhone: string;
  whatsapp: string;
  serviceHours: string;
  freeShippingThreshold: number;
  shippingCharge: number;
  codFee: number;
  returnWindowDays: number;
  currency: Currency;
  gstRate: number;
}

const defaultSettings: SiteSettings = {
  brandName: BUSINESS.brandName,
  supportEmail: BUSINESS.supportEmail,
  supportPhone: BUSINESS.supportPhone,
  whatsapp: BUSINESS.supportPhone,
  serviceHours: BUSINESS.serviceHours,
  freeShippingThreshold: 99900,
  shippingCharge: 9900,
  codFee: 4900,
  returnWindowDays: 7,
  currency: 'INR',
  gstRate: 5,
};

// ===== State =====
interface DynamicState {
  products: Product[];
  collections: Collection[];
  homepage: HomepageContent;
  journalPosts: JournalPost[];
  faqs: FAQItem[];
  reviews: Review[];
  coupons: Coupon[];
  settings: SiteSettings;
  isAdminLoggedIn: boolean;
  adminUser: { email: string; role: string } | null;
}

// ===== Admin Credentials =====
const ADMIN_EMAIL = 'admin@kyveron.in';
const ADMIN_PASSWORD = 'Kyveron@Admin2024!';

// ===== Persistence =====
// v2: catalogue without the placeholder reviews, ratings and reference prices of v1.
const STORAGE_KEY = 'kyveron_dynamic_data_v2';
const LEGACY_STORAGE_KEYS = ['kyveron_dynamic_data'];

function loadState(): DynamicState {
  try {
    LEGACY_STORAGE_KEYS.forEach(k => localStorage.removeItem(k));
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        products: parsed.products || defaultProducts,
        collections: parsed.collections || defaultCollections,
        homepage: parsed.homepage || defaultHomepage,
        journalPosts: parsed.journalPosts || defaultJournalPosts,
        faqs: parsed.faqs || defaultFAQs,
        reviews: parsed.reviews || defaultReviews,
        coupons: parsed.coupons || defaultCoupons,
        settings: { ...defaultSettings, ...parsed.settings },
        isAdminLoggedIn: false,
        adminUser: null,
      };
    }
  } catch {}
  return {
    products: defaultProducts,
    collections: defaultCollections,
    homepage: defaultHomepage,
    journalPosts: defaultJournalPosts,
    faqs: defaultFAQs,
    reviews: defaultReviews,
    coupons: defaultCoupons,
    settings: defaultSettings,
    isAdminLoggedIn: false,
    adminUser: null,
  };
}

function saveState(state: DynamicState) {
  try {
    const toSave = { ...state, isAdminLoggedIn: false, adminUser: null };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {}
}

// ===== Actions =====
type DynAction =
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'SET_COLLECTIONS'; payload: Collection[] }
  | { type: 'ADD_COLLECTION'; payload: Collection }
  | { type: 'UPDATE_COLLECTION'; payload: Collection }
  | { type: 'DELETE_COLLECTION'; payload: string }
  | { type: 'UPDATE_HOMEPAGE'; payload: Partial<HomepageContent> }
  | { type: 'SET_JOURNAL_POSTS'; payload: JournalPost[] }
  | { type: 'ADD_JOURNAL_POST'; payload: JournalPost }
  | { type: 'UPDATE_JOURNAL_POST'; payload: JournalPost }
  | { type: 'DELETE_JOURNAL_POST'; payload: string }
  | { type: 'SET_FAQS'; payload: FAQItem[] }
  | { type: 'ADD_FAQ'; payload: FAQItem }
  | { type: 'UPDATE_FAQ'; payload: FAQItem }
  | { type: 'DELETE_FAQ'; payload: string }
  | { type: 'SET_REVIEWS'; payload: Review[] }
  | { type: 'DELETE_REVIEW'; payload: string }
  | { type: 'SET_COUPONS'; payload: Coupon[] }
  | { type: 'ADD_COUPON'; payload: Coupon }
  | { type: 'UPDATE_COUPON'; payload: Coupon }
  | { type: 'DELETE_COUPON'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<SiteSettings> }
  | { type: 'ADMIN_LOGIN'; payload: { email: string; role: string } }
  | { type: 'ADMIN_LOGOUT' }
  | { type: 'RESET_ALL' };

function dynReducer(state: DynamicState, action: DynAction): DynamicState {
  let newState: DynamicState;
  switch (action.type) {
    case 'SET_PRODUCTS': newState = { ...state, products: action.payload }; break;
    case 'ADD_PRODUCT': newState = { ...state, products: [...state.products, action.payload] }; break;
    case 'UPDATE_PRODUCT': newState = { ...state, products: state.products.map(p => p.id === action.payload.id ? action.payload : p) }; break;
    case 'DELETE_PRODUCT': newState = { ...state, products: state.products.filter(p => p.id !== action.payload) }; break;
    case 'SET_COLLECTIONS': newState = { ...state, collections: action.payload }; break;
    case 'ADD_COLLECTION': newState = { ...state, collections: [...state.collections, action.payload] }; break;
    case 'UPDATE_COLLECTION': newState = { ...state, collections: state.collections.map(c => c.id === action.payload.id ? action.payload : c) }; break;
    case 'DELETE_COLLECTION': newState = { ...state, collections: state.collections.filter(c => c.id !== action.payload) }; break;
    case 'UPDATE_HOMEPAGE': newState = { ...state, homepage: { ...state.homepage, ...action.payload } }; break;
    case 'SET_JOURNAL_POSTS': newState = { ...state, journalPosts: action.payload }; break;
    case 'ADD_JOURNAL_POST': newState = { ...state, journalPosts: [...state.journalPosts, action.payload] }; break;
    case 'UPDATE_JOURNAL_POST': newState = { ...state, journalPosts: state.journalPosts.map(p => p.id === action.payload.id ? action.payload : p) }; break;
    case 'DELETE_JOURNAL_POST': newState = { ...state, journalPosts: state.journalPosts.filter(p => p.id !== action.payload) }; break;
    case 'SET_FAQS': newState = { ...state, faqs: action.payload }; break;
    case 'ADD_FAQ': newState = { ...state, faqs: [...state.faqs, action.payload] }; break;
    case 'UPDATE_FAQ': newState = { ...state, faqs: state.faqs.map(f => f.id === action.payload.id ? action.payload : f) }; break;
    case 'DELETE_FAQ': newState = { ...state, faqs: state.faqs.filter(f => f.id !== action.payload) }; break;
    case 'SET_REVIEWS': newState = { ...state, reviews: action.payload }; break;
    case 'DELETE_REVIEW': newState = { ...state, reviews: state.reviews.filter(r => r.id !== action.payload) }; break;
    case 'SET_COUPONS': newState = { ...state, coupons: action.payload }; break;
    case 'ADD_COUPON': newState = { ...state, coupons: [...state.coupons, action.payload] }; break;
    case 'UPDATE_COUPON': newState = { ...state, coupons: state.coupons.map(c => c.id === action.payload.id ? action.payload : c) }; break;
    case 'DELETE_COUPON': newState = { ...state, coupons: state.coupons.filter(c => c.id !== action.payload) }; break;
    case 'UPDATE_SETTINGS': newState = { ...state, settings: { ...state.settings, ...action.payload } }; break;
    case 'ADMIN_LOGIN': newState = { ...state, isAdminLoggedIn: true, adminUser: action.payload }; break;
    case 'ADMIN_LOGOUT': newState = { ...state, isAdminLoggedIn: false, adminUser: null }; break;
    case 'RESET_ALL':
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
      newState = { ...loadState(), isAdminLoggedIn: state.isAdminLoggedIn, adminUser: state.adminUser }; break;
    default: return state;
  }
  saveState(newState);
  return newState;
}

// ===== Context =====
interface DynamicContextType {
  state: DynamicState;
  dispatch: React.Dispatch<DynAction>;
  // Product helpers
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  // Collection helpers
  addCollection: (collection: Collection) => void;
  updateCollection: (collection: Collection) => void;
  deleteCollection: (id: string) => void;
  // Homepage
  updateHomepage: (data: Partial<HomepageContent>) => void;
  // Journal
  addJournalPost: (post: JournalPost) => void;
  updateJournalPost: (post: JournalPost) => void;
  deleteJournalPost: (id: string) => void;
  // FAQ
  addFAQ: (faq: FAQItem) => void;
  updateFAQ: (faq: FAQItem) => void;
  deleteFAQ: (id: string) => void;
  // Reviews
  deleteReview: (id: string) => void;
  // Coupons
  addCoupon: (coupon: Coupon) => void;
  updateCoupon: (coupon: Coupon) => void;
  deleteCoupon: (id: string) => void;
  // Settings
  updateSettings: (data: Partial<SiteSettings>) => void;
  // Admin auth
  adminLogin: (email: string, password: string) => boolean;
  adminLogout: () => void;
  resetAll: () => void;
  // Utilities
  formatPrice: (amount: number) => string;
  getProductBySlug: (slug: string) => Product | undefined;
  getProductsByCollection: (slug: string) => Product[];
  getCollectionBySlug: (slug: string) => Collection | undefined;
  validateCoupon: (code: string, cartTotal: number) => { valid: boolean; discount: number; message: string };
}

const DynamicContext = createContext<DynamicContextType | null>(null);

export function DynamicProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dynReducer, undefined, loadState);

  const addProduct = useCallback((p: Product) => dispatch({ type: 'ADD_PRODUCT', payload: p }), []);
  const updateProduct = useCallback((p: Product) => dispatch({ type: 'UPDATE_PRODUCT', payload: p }), []);
  const deleteProduct = useCallback((id: string) => dispatch({ type: 'DELETE_PRODUCT', payload: id }), []);
  const addCollection = useCallback((c: Collection) => dispatch({ type: 'ADD_COLLECTION', payload: c }), []);
  const updateCollection = useCallback((c: Collection) => dispatch({ type: 'UPDATE_COLLECTION', payload: c }), []);
  const deleteCollection = useCallback((id: string) => dispatch({ type: 'DELETE_COLLECTION', payload: id }), []);
  const updateHomepage = useCallback((d: Partial<HomepageContent>) => dispatch({ type: 'UPDATE_HOMEPAGE', payload: d }), []);
  const addJournalPost = useCallback((p: JournalPost) => dispatch({ type: 'ADD_JOURNAL_POST', payload: p }), []);
  const updateJournalPost = useCallback((p: JournalPost) => dispatch({ type: 'UPDATE_JOURNAL_POST', payload: p }), []);
  const deleteJournalPost = useCallback((id: string) => dispatch({ type: 'DELETE_JOURNAL_POST', payload: id }), []);
  const addFAQ = useCallback((f: FAQItem) => dispatch({ type: 'ADD_FAQ', payload: f }), []);
  const updateFAQ = useCallback((f: FAQItem) => dispatch({ type: 'UPDATE_FAQ', payload: f }), []);
  const deleteFAQ = useCallback((id: string) => dispatch({ type: 'DELETE_FAQ', payload: id }), []);
  const deleteReview = useCallback((id: string) => dispatch({ type: 'DELETE_REVIEW', payload: id }), []);
  const addCoupon = useCallback((c: Coupon) => dispatch({ type: 'ADD_COUPON', payload: c }), []);
  const updateCoupon = useCallback((c: Coupon) => dispatch({ type: 'UPDATE_COUPON', payload: c }), []);
  const deleteCoupon = useCallback((id: string) => dispatch({ type: 'DELETE_COUPON', payload: id }), []);
  const updateSettings = useCallback((d: Partial<SiteSettings>) => dispatch({ type: 'UPDATE_SETTINGS', payload: d }), []);
  const resetAll = useCallback(() => dispatch({ type: 'RESET_ALL' }), []);

  const adminLogin = useCallback((email: string, password: string): boolean => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      dispatch({ type: 'ADMIN_LOGIN', payload: { email, role: 'super_admin' } });
      return true;
    }
    return false;
  }, []);

  const adminLogout = useCallback(() => dispatch({ type: 'ADMIN_LOGOUT' }), []);

  const formatPriceFn = useCallback((amount: number) => formatPriceUtil(amount, state.settings.currency), [state.settings.currency]);
  const getProductBySlug = useCallback((slug: string) => state.products.find(p => p.slug === slug), [state.products]);
  const getProductsByCollection = useCallback((slug: string) => state.products.filter(p => p.collection === slug), [state.products]);
  const getCollectionBySlug = useCallback((slug: string) => state.collections.find(c => c.slug === slug), [state.collections]);

  const validateCoupon = useCallback((code: string, cartTotal: number) => {
    const coupon = state.coupons.find(c => c.code === code.toUpperCase() && c.isActive);
    if (!coupon) return { valid: false, discount: 0, message: 'Invalid coupon code' };
    const today = new Date().toISOString().slice(0, 10);
    if (today < coupon.startDate || today > coupon.endDate) return { valid: false, discount: 0, message: 'This coupon has expired' };
    if (coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) return { valid: false, discount: 0, message: 'This coupon is no longer available' };
    if (coupon.minCartValue && cartTotal < coupon.minCartValue) return { valid: false, discount: 0, message: `Minimum cart value: ${formatPriceUtil(coupon.minCartValue, state.settings.currency)}` };
    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = Math.round(cartTotal * coupon.value / 100);
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = coupon.value;
    }
    return { valid: true, discount, message: `${coupon.code} applied!` };
  }, [state.coupons, state.settings.currency]);

  return (
    <DynamicContext.Provider value={{
      state, dispatch, addProduct, updateProduct, deleteProduct,
      addCollection, updateCollection, deleteCollection,
      updateHomepage, addJournalPost, updateJournalPost, deleteJournalPost,
      addFAQ, updateFAQ, deleteFAQ, deleteReview,
      addCoupon, updateCoupon, deleteCoupon, updateSettings,
      adminLogin, adminLogout, resetAll,
      formatPrice: formatPriceFn, getProductBySlug, getProductsByCollection, getCollectionBySlug, validateCoupon,
    }}>
      {children}
    </DynamicContext.Provider>
  );
}

export function useDynamic() {
  const ctx = useContext(DynamicContext);
  if (!ctx) throw new Error('useDynamic must be used within DynamicProvider');
  return ctx;
}

export { ADMIN_EMAIL, ADMIN_PASSWORD, SIZES, STORAGE_KEY as CATALOGUE_STORAGE_KEY };
export type { HomepageContent, FAQItem, SiteSettings };
