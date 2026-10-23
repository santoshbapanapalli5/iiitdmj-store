import React, { useState, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  Building2,
  Package,
  Sparkles,
  ShoppingBag,
  Info,
  CheckCircle,
  HelpCircle,
  Code2,
  PlusCircle,
  Layers,
  ArrowRight,
  Store,
  User as UserIcon,
} from 'lucide-react';
import { User, Product, Order, ProductCategory, InventoryStatus } from './types';
import { storage } from './services/storage';
import { api } from './services/api';
import { Header } from './components/Header';
import { WelcomeBanner } from './components/WelcomeBanner';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CampusCheckoutModal } from './components/CampusCheckoutModal';
import { AuthModal } from './components/AuthModal';
import { SignInPage } from './components/SignInPage';
import { SellerDashboard } from './components/SellerDashboard';
import { BuyerDashboard } from './components/BuyerDashboard';
import { TechArchitectureModal } from './components/TechArchitectureModal';
import { HOSTELS_LIST } from './data/mockData';

const CATEGORIES: ('All' | ProductCategory)[] = [
  'All',
  'Bicycles',
  'Textbooks & Notes',
  'Electronics & Monitors',
  'Coolers & Appliances',
  'Mattress & Room Decor',
  'Lab Kits & Hardware',
  'Sports & Fitness',
  'Engineering Calculators',
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<'buyer' | 'seller'>('buyer');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [guestBrowsing, setGuestBrowsing] = useState(false);

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ProductCategory>('All');
  const [selectedHostel, setSelectedHostel] = useState<string>('All');
  const [selectedCondition, setSelectedCondition] = useState<string>('All');

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [architectureModalOpen, setArchitectureModalOpen] = useState(false);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [selectedProductForCheckout, setSelectedProductForCheckout] = useState<Product | null>(null);
  const [showBuyerOrders, setShowBuyerOrders] = useState(false);

  // Success Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    const user = await api.getCurrentUser();
    setCurrentUser(user);
    setActiveView(storage.getActiveView());

    const prodRes = await api.getProducts();
    if (prodRes.success && prodRes.data) {
      setProducts(prodRes.data);
    }

    setOrders(storage.getOrders());
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSwitchUser = async (userId: string) => {
    const user = await api.switchUser(userId);
    setCurrentUser(user);
    setGuestBrowsing(false);
    showToast(`Switched account to ${user?.name} (${user?.rollNumber})`);
    loadInitialData();
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setGuestBrowsing(false); // Return to sign in page
    showToast('Signed out of IIITDMJ Campus Bazaar');
  };

  const handleViewChange = (view: 'buyer' | 'seller') => {
    setActiveView(view);
    storage.setActiveView(view);
    setShowBuyerOrders(false);
  };

  const handleOrderPlaced = (newOrder: Order) => {
    setOrders([newOrder, ...orders]);
    showToast(`Order #${newOrder.id} confirmed! Delivery dispatched to ${newOrder.deliveryDetails.hostel} (Room ${newOrder.deliveryDetails.roomNumber}).`);
    setShowBuyerOrders(true);
    setActiveView('buyer');
  };

  const handleInventoryStatusUpdated = async (productId: string, status: InventoryStatus) => {
    const res = await api.updateInventoryStatus(productId, status);
    if (res.success && res.data) {
      setProducts(products.map(p => (p.id === productId ? res.data! : p)));
      showToast(`Inventory status updated to "${status}".`);
    }
  };

  const handleOrderStatusUpdated = async (orderId: string, status: any) => {
    const res = await api.updateOrderStatus(orderId, status);
    if (res.success && res.data) {
      setOrders(orders.map(o => (o.id === orderId ? res.data! : o)));
      showToast(`Order status updated to "${status}".`);
    }
  };

  const handleLoadSampleData = async () => {
    await api.loadSampleCatalog();
    await loadInitialData();
    showToast('Loaded sample campus items for testing.');
  };

  // NEW USER GATE: If not signed in and not explicitly exploring as guest, take new users to Sign In page
  if (!currentUser && !guestBrowsing) {
    return (
      <>
        <SignInPage
          onAuthSuccess={(user) => {
            setCurrentUser(user);
            showToast(`Welcome, ${user.name}! Verified as ${user.rollNumber} (${user.hostel}).`);
            loadInitialData();
          }}
          onExploreAsGuest={() => setGuestBrowsing(true)}
          onOpenArchitecture={() => setArchitectureModalOpen(true)}
        />
        <TechArchitectureModal
          isOpen={architectureModalOpen}
          onClose={() => setArchitectureModalOpen(false)}
        />
      </>
    );
  }

  // Filtered Products for Buyer View
  const filteredProducts = products.filter((p) => {
    // Hide sold items from general buyer catalog unless search matches
    if (p.inventoryStatus === 'Sold' && !searchQuery) return false;

    if (selectedCategory !== 'All' && p.category !== selectedCategory) {
      return false;
    }

    if (selectedHostel !== 'All' && p.sellerHostel !== selectedHostel) {
      return false;
    }

    if (selectedCondition !== 'All' && p.condition !== selectedCondition) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchCat = p.category.toLowerCase().includes(q);
      const matchHostel = p.sellerHostel.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchCat || matchHostel;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans pb-16 lg:pb-0">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-50 bg-[#0A192F] text-white px-4 py-3 rounded-xl shadow-xl border border-amber-400/40 text-xs flex items-center gap-2.5 animate-in slide-in-from-bottom-3 duration-200 max-w-sm sm:max-w-md">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="leading-snug">{toastMessage}</span>
        </div>
      )}

      {/* Guest Mode Notice Bar */}
      {!currentUser && guestBrowsing && (
        <div className="bg-[#0A192F] text-amber-300 px-3 sm:px-4 py-2 text-xs flex items-center justify-between border-b border-amber-500/20">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 truncate">
              <span className="font-semibold text-white shrink-0">Guest Mode:</span>
              <span className="text-slate-300 truncate">Sign in with @iiitdmj.ac.in to place hostel orders and list products.</span>
            </div>
            <button
              onClick={() => setGuestBrowsing(false)}
              className="px-2.5 sm:px-3 py-1 bg-[#F59E0B] text-[#0A192F] font-bold rounded-lg hover:bg-amber-400 transition-colors shrink-0 text-[11px] sm:text-xs"
            >
              Sign In
            </button>
          </div>
        </div>
      )}

      {/* Top Bar Contract Header */}
      <Header
        currentUser={currentUser}
        activeView={activeView}
        onViewChange={handleViewChange}
        onOpenAuth={() => {
          if (!currentUser) setGuestBrowsing(false);
          else setAuthModalOpen(true);
        }}
        onOpenArchitecture={() => setArchitectureModalOpen(true)}
        onOpenFaq={() => {}}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat as any);
          setActiveView('buyer');
          setShowBuyerOrders(false);
        }}
        onSwitchUser={handleSwitchUser}
        onLogout={handleLogout}
        cartCount={0}
        onOpenOrders={() => {
          if (!currentUser) {
            setGuestBrowsing(false);
          } else {
            setShowBuyerOrders(true);
            setActiveView('buyer');
          }
        }}
      />

      {/* DUAL VIEW SWITCH CONTAINER */}
      <main className="flex-1">
        
        {/* VIEW 1: SELLER DASHBOARD */}
        {activeView === 'seller' ? (
          <SellerDashboard
            currentUser={currentUser}
            products={products}
            orders={orders}
            onProductCreated={(newProd) => {
              setProducts([newProd, ...products]);
              showToast(`Item "${newProd.title}" listed successfully!`);
            }}
            onStatusUpdated={handleInventoryStatusUpdated}
            onOrderStatusUpdated={handleOrderStatusUpdated}
            onRequireAuth={() => setGuestBrowsing(false)}
          />
        ) : showBuyerOrders ? (
          /* VIEW 2: BUYER ORDERS & REVIEWS */
          <BuyerDashboard
            currentUser={currentUser}
            orders={orders}
            onOpenProduct={(prodId) => {
              const p = products.find(item => item.id === prodId);
              if (p) setSelectedProductForDetail(p);
            }}
            onOrderUpdated={loadInitialData}
            onRequireAuth={() => setGuestBrowsing(false)}
            onBrowse={() => setShowBuyerOrders(false)}
          />
        ) : (
          /* VIEW 3: BUYER CAMPUS MARKETPLACE */
          <div>
            {/* Campus Hero / Welcome Banner */}
            <WelcomeBanner
              studentName={currentUser ? `${currentUser.name} (${currentUser.rollNumber})` : undefined}
              onBrowse={() => {
                const el = document.getElementById('catalog-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onListProduct={() => {
                if (!currentUser) {
                  setGuestBrowsing(false);
                } else {
                  setActiveView('seller');
                }
              }}
            />

            {/* Marketplace Catalog Section */}
            <section id="catalog-section" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
              
              {/* Search & Filter Bar */}
              <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-5 shadow-xs space-y-3 sm:space-y-4">
                
                {/* Search Bar & Hostel Selector */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-3">
                  <div className="md:col-span-8 relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search cycles, CLRS textbook, cooler, mattress, monitor, Arduino kit..."
                      className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A192F] min-h-[44px]"
                    />
                  </div>

                  <div className="md:col-span-4 flex gap-2">
                    <select
                      value={selectedHostel}
                      onChange={(e) => setSelectedHostel(e.target.value)}
                      className="w-full px-3 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A192F] min-h-[44px]"
                    >
                      <option value="All">All Hostels (Hall 1, 3, 4, Panini...)</option>
                      {HOSTELS_LIST.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Category Filter Tabs (Horizontal scrolling with touch momentum) */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-none">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer min-h-[36px] flex items-center ${
                        selectedCategory === cat
                          ? 'bg-[#0A192F] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

              </div>

              {/* Grid Header & Result Counter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    {selectedCategory === 'All' ? 'Campus Peer Listings' : selectedCategory}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>{filteredProducts.length} items available on campus</span>
                    <span aria-hidden="true">·</span>
                    <span>Direct Hostel Doorstep Handover</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Option to load sample demo items for testing */}
                  {products.length === 0 && (
                    <button
                      onClick={handleLoadSampleData}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg transition-colors shadow-2xs min-h-[40px]"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Load Sample Demo Items</span>
                    </button>
                  )}

                  <button
                    onClick={() => setArchitectureModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-lg transition-colors min-h-[40px]"
                  >
                    <Code2 className="w-3.5 h-3.5 text-amber-700" />
                    <span>Tech Architecture & Schema</span>
                  </button>
                </div>
              </div>

              {/* Product Grid Or Empty Marketplace State */}
              {products.length === 0 ? (
                /* INITIAL EMPTY MARKETPLACE (No mock products shown initially) */
                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-12 text-center max-w-xl mx-auto shadow-xs">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-100 text-[#0A192F] flex items-center justify-center mx-auto mb-4">
                    <Package className="w-7 h-7 sm:w-8 sm:h-8 text-slate-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    No Campus Products Listed Yet
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
                    IIITDMJ Campus Bazaar starts clean with zero pre-populated items. Students can list their used or new bicycles, textbooks, air coolers, room decor, and electronics.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 mt-6">
                    <button
                      onClick={() => {
                        if (!currentUser) setGuestBrowsing(false);
                        else setActiveView('seller');
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-[#0A192F] hover:bg-[#162A45] rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                    >
                      <PlusCircle className="w-4 h-4 text-amber-400" />
                      <span>List the First Campus Product</span>
                    </button>

                    <button
                      onClick={handleLoadSampleData}
                      className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Load Sample Test Items</span>
                    </button>
                  </div>
                </div>
              ) : filteredProducts.length === 0 ? (
                /* Search Filter Empty State */
                <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-lg mx-auto">
                  <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-800">
                    No items match your filter
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    Try adjusting your search terms or clearing your hostel filter.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                      setSelectedHostel('All');
                    }}
                    className="px-4 py-2 text-xs font-semibold text-[#0A192F] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors min-h-[44px]"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredProducts.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      onSelect={(p) => setSelectedProductForDetail(p)}
                      onQuickBuy={(p) => {
                        if (!currentUser) {
                          setGuestBrowsing(false);
                        } else {
                          setSelectedProductForCheckout(p);
                        }
                      }}
                    />
                  ))}
                </div>
              )}

            </section>
          </div>
        )}

      </main>

      {/* Campus Footer */}
      <footer className="mt-auto bg-[#0A192F] text-slate-400 py-8 sm:py-10 border-t border-amber-500/20 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <div className="w-7 h-7 rounded-lg bg-amber-400 text-[#0A192F] flex items-center justify-center font-black text-xs">
                  DMJ
                </div>
                <span>IIITDMJ Campus Bazaar</span>
              </div>
              <p className="text-slate-400 text-xs max-w-md leading-relaxed">
                Pandit Dwarka Prasad Mishra Indian Institute of Information Technology, Design and Manufacturing Jabalpur. Dumna Nature Park Road, Jabalpur, Madhya Pradesh - 482005.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-amber-400 pt-1 flex-wrap">
                <span>Verified @iiitdmj.ac.in Student Network</span>
                <span>·</span>
                <span>Delivered-Only Verified Reviews</span>
              </div>
            </div>

            <div>
              <div className="font-bold text-white uppercase tracking-wider text-[11px] mb-2.5">
                Hostel Delivery Hubs
              </div>
              <ul className="space-y-1.5 text-slate-300 text-[11px]">
                <li>Hall of Residence 1 (Hall 1)</li>
                <li>Hall of Residence 3 (Hall 3)</li>
                <li>Hall of Residence 4 (Hall 4)</li>
                <li>Panini & Nagarjuna Residency</li>
                <li>Maa Saraswati Hostel (Girls)</li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-white uppercase tracking-wider text-[11px] mb-2.5">
                Technical Deliverables
              </div>
              <ul className="space-y-1.5 text-slate-300 text-[11px]">
                <li>
                  <button
                    onClick={() => setArchitectureModalOpen(true)}
                    className="hover:text-amber-300 transition-colors text-left"
                  >
                    Tech Stack Breakdown
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setArchitectureModalOpen(true)}
                    className="hover:text-amber-300 transition-colors text-left"
                  >
                    4-Collection Database Schema
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setArchitectureModalOpen(true)}
                    className="hover:text-amber-300 transition-colors text-left"
                  >
                    Strict Verified Review Endpoint
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      storage.resetToDefaults();
                      loadInitialData();
                      setGuestBrowsing(false);
                      showToast('Database reset: 0 products, redirected to Sign In.');
                    }}
                    className="text-amber-400 hover:text-amber-300 text-left pt-1"
                  >
                    Reset Demo State (0 Products & Logout)
                  </button>
                </li>
              </ul>
            </div>

          </div>

          <div className="pt-4 sm:pt-6 border-t border-white/10 flex items-center justify-between flex-wrap gap-2 text-[11px] text-slate-500">
            <div>
              © 2026 PDPM IIITDM Jabalpur Student Body. Built for Campus Peer-to-Peer Exchange.
            </div>
            <div className="font-mono text-slate-400">
              Zero Commission · Peer-to-Peer UPI Handover
            </div>
          </div>
        </div>
      </footer>

      {/* MOBILE BOTTOM NAVIGATION BAR (Visible on mobile/tablet devices) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-3 flex items-center justify-around shadow-lg">
        <button
          onClick={() => {
            setActiveView('buyer');
            setShowBuyerOrders(false);
          }}
          className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors ${
            activeView === 'buyer' && !showBuyerOrders
              ? 'text-[#0A192F]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingBag className={`w-5 h-5 ${activeView === 'buyer' && !showBuyerOrders ? 'stroke-[2.5]' : ''}`} />
          <span className="mt-0.5">Marketplace</span>
        </button>

        <button
          onClick={() => {
            setActiveView('seller');
            setShowBuyerOrders(false);
          }}
          className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors ${
            activeView === 'seller'
              ? 'text-amber-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Store className={`w-5 h-5 ${activeView === 'seller' ? 'stroke-[2.5]' : ''}`} />
          <span className="mt-0.5">Seller</span>
        </button>

        <button
          onClick={() => {
            if (!currentUser) setGuestBrowsing(false);
            else {
              setShowBuyerOrders(true);
              setActiveView('buyer');
            }
          }}
          className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors ${
            showBuyerOrders
              ? 'text-[#0A192F]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className={`w-5 h-5 ${showBuyerOrders ? 'stroke-[2.5]' : ''}`} />
          <span className="mt-0.5">My Orders</span>
        </button>

        <button
          onClick={() => setArchitectureModalOpen(true)}
          className="flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-semibold text-slate-500 hover:text-amber-800 transition-colors"
        >
          <Code2 className="w-5 h-5" />
          <span className="mt-0.5">Specs</span>
        </button>
      </nav>

      {/* MODALS */}
      {/* 1. Auth & Smart Onboarding Modal (when triggered while in-app) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Welcome, ${user.name}! Verified as ${user.rollNumber} (${user.hostel}).`);
          loadInitialData();
        }}
      />

      {/* 2. Product Detail & Verified Review Modal */}
      <ProductDetailModal
        isOpen={!!selectedProductForDetail}
        onClose={() => setSelectedProductForDetail(null)}
        product={selectedProductForDetail}
        currentUser={currentUser}
        onInitiateCheckout={(p) => {
          setSelectedProductForDetail(null);
          setSelectedProductForCheckout(p);
        }}
        onRequireAuth={() => setGuestBrowsing(false)}
        onProductUpdated={loadInitialData}
      />

      {/* 3. Campus-Specific Checkout Modal */}
      <CampusCheckoutModal
        isOpen={!!selectedProductForCheckout}
        onClose={() => setSelectedProductForCheckout(null)}
        product={selectedProductForCheckout}
        currentUser={currentUser}
        onOrderPlaced={handleOrderPlaced}
        onRequireAuth={() => setGuestBrowsing(false)}
      />

      {/* 4. Tech Architecture & Code Deliverables Modal */}
      <TechArchitectureModal
        isOpen={architectureModalOpen}
        onClose={() => setArchitectureModalOpen(false)}
      />

    </div>
  );
}
