import React, { useState, useRef } from 'react';
import {
  PlusCircle,
  Package,
  CheckCircle,
  Clock,
  IndianRupee,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  Truck,
  Building2,
  Trash2,
  ArrowRight,
  Eye,
  Camera,
  Star,
} from 'lucide-react';
import {
  User,
  Product,
  Order,
  ProductCategory,
  ProductCondition,
  InventoryStatus,
  HostelName,
} from '../types';
import { api } from '../services/api';

interface SellerDashboardProps {
  currentUser: User | null;
  products: Product[];
  orders: Order[];
  onProductCreated: (newProduct: Product) => void;
  onStatusUpdated: (productId: string, status: InventoryStatus) => void;
  onOrderStatusUpdated: (orderId: string, status: any) => void;
  onRequireAuth: () => void;
}

const CATEGORIES: ProductCategory[] = [
  'Bicycles',
  'Textbooks & Notes',
  'Electronics & Monitors',
  'Coolers & Appliances',
  'Mattress & Room Decor',
  'Lab Kits & Hardware',
  'Sports & Fitness',
  'Engineering Calculators',
];

const CONDITIONS: ProductCondition[] = [
  'Brand New',
  'Like New / Mint',
  'Gently Used',
  'Well-Loved',
];

// Preset campus photos for fast mock listing
const PRESET_PHOTOS = [
  { label: 'Campus Bicycle', url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80' },
  { label: 'Engineering Book', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80' },
  { label: 'Desk Monitor', url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80' },
  { label: 'Room Cooler', url: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80' },
  { label: 'Hostel Mattress', url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80' },
  { label: 'Robotics Kit', url: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=800&q=80' },
];

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  currentUser,
  products,
  orders,
  onProductCreated,
  onStatusUpdated,
  onOrderStatusUpdated,
  onRequireAuth,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Listing Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Bicycles');
  const [condition, setCondition] = useState<ProductCondition>('Like New / Mint');
  const [price, setPrice] = useState<number | ''>('');
  const [originalPrice, setOriginalPrice] = useState<number | ''>('');
  const [handoverLocation, setHandoverLocation] = useState('Hall 3 Common Room or Central Mess');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>(PRESET_PHOTOS[0].url);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto py-12 sm:py-16 px-4 text-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#0A192F] text-amber-400 flex items-center justify-center mx-auto mb-4">
          <Package className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          Student Seller Portal
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-2">
          Sign in with your verified @iiitdmj.ac.in credentials to list cycles, books, electronics, and manage hostel deliveries.
        </p>
        <button
          onClick={onRequireAuth}
          className="mt-6 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#0A192F] hover:bg-[#162A45] rounded-xl transition-colors shadow-xs min-h-[44px]"
        >
          Sign In with Institute Email
        </button>
      </div>
    );
  }

  // Filter listings & orders for this seller
  const sellerProducts = products.filter(p => p.sellerId === currentUser.id);
  const sellerOrders = orders.filter(o => o.sellerId === currentUser.id);

  const totalEarnings = sellerOrders
    .filter(o => o.status === 'Delivered')
    .reduce((sum, o) => sum + o.productPrice, 0);

  const pendingHandoverCount = sellerOrders.filter(
    o => o.status === 'Placed' || o.status === 'Confirmed by Seller' || o.status === 'Out for Delivery'
  ).length;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormError('Image size exceeds 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim()) {
      setFormError('Please enter a product title.');
      return;
    }
    if (!price || Number(price) <= 0) {
      setFormError('Please provide a valid selling price in ₹.');
      return;
    }
    if (!description.trim()) {
      setFormError('Please provide a short description for your fellow students.');
      return;
    }
    if (!uploadedImageUrl) {
      setFormError('Please upload a product photo or pick a preset image.');
      return;
    }

    setIsSubmitting(true);
    const res = await api.createProduct({
      title: title.trim(),
      description: description.trim(),
      category,
      condition,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      inventoryStatus: 'Available',
      images: [uploadedImageUrl],
      sellerId: currentUser.id,
      sellerName: currentUser.name,
      sellerEmail: currentUser.email,
      sellerRoll: currentUser.rollNumber,
      sellerHostel: currentUser.hostel,
      handoverLocation: handoverLocation.trim() || `${currentUser.hostel} Gate`,
    });
    setIsSubmitting(false);

    if (res.success && res.data) {
      onProductCreated(res.data);
      setShowAddForm(false);
      // Reset form
      setTitle('');
      setDescription('');
      setPrice('');
      setOriginalPrice('');
    } else {
      setFormError(res.error || 'Failed to list product.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      
      {/* Top Banner & KPI Stat Strip */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4 sm:pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#0A192F] text-amber-400 flex items-center justify-center font-bold text-base sm:text-lg shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-bold text-slate-900">{currentUser.name}</h1>
                <span className="text-[10px] sm:text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {currentUser.rollNumber}
                </span>
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{currentUser.hostel} · Room {currentUser.roomNumber}</span>
              </div>
            </div>
          </div>

          <div className="w-full sm:w-auto">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#0A192F] hover:bg-[#162A45] rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
            >
              <PlusCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{showAddForm ? 'Close Form' : 'List New Campus Item'}</span>
            </button>
          </div>
        </div>

        {/* Seller Key Performance Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 pt-4 sm:pt-5">
          <div className="p-2 sm:p-0 bg-slate-50 sm:bg-transparent rounded-xl">
            <div className="text-[11px] sm:text-xs font-medium text-slate-500">Active Listings</div>
            <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
              {sellerProducts.filter(p => p.inventoryStatus === 'Available').length}
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
              of {sellerProducts.length} listed
            </div>
          </div>

          <div className="p-2 sm:p-0 bg-slate-50 sm:bg-transparent rounded-xl">
            <div className="text-[11px] sm:text-xs font-medium text-slate-500">Completed Sales</div>
            <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-emerald-600 mt-1">
              ₹{totalEarnings.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
              Direct student UPI/Cash
            </div>
          </div>

          <div className="p-2 sm:p-0 bg-slate-50 sm:bg-transparent rounded-xl">
            <div className="text-[11px] sm:text-xs font-medium text-slate-500">Pending Deliveries</div>
            <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-amber-600 mt-1">
              {pendingHandoverCount}
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
              Hostel handover
            </div>
          </div>

          <div className="p-2 sm:p-0 bg-slate-50 sm:bg-transparent rounded-xl">
            <div className="text-[11px] sm:text-xs font-medium text-slate-500">Seller Trust Rating</div>
            <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1 flex items-center gap-1">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400 text-amber-400" />
              <span>{currentUser.ratingAsSeller || 5.0}</span>
              <span className="text-xs text-slate-400 font-sans font-normal">/ 5.0</span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
              Verified deliveries
            </div>
          </div>
        </div>
      </div>

      {/* CREATE NEW LISTING FORM MODAL */}
      {showAddForm && (
        <div className="bg-white rounded-2xl border border-slate-300 shadow-md p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 mb-4 sm:mb-5">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                List a Campus Product
              </h2>
              <p className="text-xs text-slate-500">
                Offer your cycles, textbooks, mattress, cooler, or electronics to fellow IIITDMJ students.
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-slate-600 text-xs p-1"
            >
              Cancel
            </button>
          </div>

          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              {formError}
            </div>
          )}

          <form onSubmit={handleCreateListing} className="space-y-4 sm:space-y-5">
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
              
              {/* Left Column: Details */}
              <div className="md:col-span-7 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Product Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Hero Sprint Pro 21-Speed Cycle or CLRS Algorithm Textbook"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A192F] min-h-[44px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ProductCategory)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A192F] min-h-[44px]"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Item Condition
                    </label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value as ProductCondition)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A192F] min-h-[44px]"
                    >
                      {CONDITIONS.map(cond => (
                        <option key={cond} value={cond}>{cond}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Selling Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-xs font-mono text-slate-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                        placeholder="2500"
                        className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono tabular-nums focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A192F] min-h-[44px]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Original / MRP Price (₹) (Optional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-xs font-mono text-slate-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value ? Number(e.target.value) : '')}
                        placeholder="6000"
                        className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono tabular-nums focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A192F] min-h-[44px]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Preferred Campus Handover Spot
                  </label>
                  <input
                    type="text"
                    value={handoverLocation}
                    onChange={(e) => setHandoverLocation(e.target.value)}
                    placeholder="e.g. Hall 4 Bicycle Shed, Central Mess, or SAC Gate"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A192F] min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Description & Specifications
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mention months of usage, accessories included, and condition..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A192F]"
                    required
                  />
                </div>
              </div>

              {/* Right Column: Image Upload Capability */}
              <div className="md:col-span-5 space-y-3">
                <label className="block text-xs font-semibold text-slate-700">
                  Product Image Upload
                </label>

                {/* Preview Frame */}
                <div className="relative w-full aspect-4/3 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  {uploadedImageUrl ? (
                    <img
                      src={uploadedImageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                      <Camera className="w-6 h-6 mb-1 text-slate-300" />
                      <span>No image selected</span>
                    </div>
                  )}
                </div>

                {/* Upload Buttons */}
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2.5 px-3 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
                  >
                    <Upload className="w-4 h-4 text-slate-600" />
                    <span>Upload Device Photo</span>
                  </button>
                </div>

                {/* Preset Suggestions for Quick Demo */}
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Or select quick campus photo preset
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {PRESET_PHOTOS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setUploadedImageUrl(p.url)}
                        className={`text-[10px] p-1.5 rounded border truncate text-left transition-colors min-h-[36px] ${
                          uploadedImageUrl === p.url
                            ? 'border-[#0A192F] bg-blue-50 font-semibold text-[#0A192F]'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 text-center min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-[#0A192F] hover:bg-[#162A45] rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
              >
                {isSubmitting ? (
                  <span>Publishing Listing...</span>
                ) : (
                  <>
                    <span>Publish to IIITDMJ Campus Bazaar</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* INVENTORY STATUS TRACKER SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Inventory Status Tracker
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Update item availability in real-time. Sold items are archived from the public browse catalog.
            </p>
          </div>
          <span className="text-[11px] sm:text-xs font-mono text-slate-500">
            {sellerProducts.length} items
          </span>
        </div>

        {sellerProducts.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            You haven't listed any items on Campus Bazaar yet. Click "List New Campus Item" above to get started!
          </div>
        ) : (
          <>
            {/* MOBILE VIEW FOR INVENTORY (CARDS - Eliminates awkward table scrolling) */}
            <div className="sm:hidden divide-y divide-slate-100">
              {sellerProducts.map((p) => (
                <div key={p.id} className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                      {p.images[0] && (
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 text-xs line-clamp-1">
                        {p.title}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {p.category} · {p.condition}
                      </div>
                      <div className="text-sm font-bold font-mono text-slate-900 mt-1">
                        ₹{p.price.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {/* Mobile Segmented Status Switcher */}
                  <div className="pt-1">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase mb-1">
                      Status: <span className="text-slate-700">{p.inventoryStatus}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                      <button
                        onClick={() => onStatusUpdated(p.id, 'Available')}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold text-center transition-all ${
                          p.inventoryStatus === 'Available'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Available
                      </button>
                      <button
                        onClick={() => onStatusUpdated(p.id, 'Out of Stock')}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold text-center transition-all ${
                          p.inventoryStatus === 'Out of Stock'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Out of Stock
                      </button>
                      <button
                        onClick={() => onStatusUpdated(p.id, 'Sold')}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold text-center transition-all ${
                          p.inventoryStatus === 'Sold'
                            ? 'bg-slate-800 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Sold
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* TABLE VIEW FOR TABLET & DESKTOP */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-3">Product</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Price</th>
                    <th className="px-6 py-3">Inventory Status Tracker</th>
                    <th className="px-6 py-3 text-right">Stats & Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sellerProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                            {p.images[0] && (
                              <img
                                src={p.images[0]}
                                alt={p.title}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 line-clamp-1 max-w-xs">
                              {p.title}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {p.condition} · Handover: {p.handoverLocation}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {p.category}
                      </td>

                      <td className="px-6 py-4 font-bold font-mono tabular-nums text-slate-900">
                        ₹{p.price.toLocaleString('en-IN')}
                      </td>

                      {/* Interactive Inventory Status Buttons */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg inline-flex border border-slate-200">
                          <button
                            onClick={() => onStatusUpdated(p.id, 'Available')}
                            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all whitespace-nowrap ${
                              p.inventoryStatus === 'Available'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Available
                          </button>
                          <button
                            onClick={() => onStatusUpdated(p.id, 'Out of Stock')}
                            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all whitespace-nowrap ${
                              p.inventoryStatus === 'Out of Stock'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Out of Stock
                          </button>
                          <button
                            onClick={() => onStatusUpdated(p.id, 'Sold')}
                            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all whitespace-nowrap ${
                              p.inventoryStatus === 'Sold'
                                ? 'bg-slate-800 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Sold
                          </button>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 font-semibold text-slate-800">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{p.rating > 0 ? p.rating : '—'}</span>
                          <span className="text-slate-400 font-normal">({p.reviewCount})</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {p.viewsCount} campus views
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* INCOMING CAMPUS ORDERS TO DISPATCH */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Hostel Orders to Fulfill
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Incoming orders from fellow students with room delivery details.
            </p>
          </div>
          <span className="text-[11px] sm:text-xs font-mono text-slate-500">
            {sellerOrders.length} orders
          </span>
        </div>

        {sellerOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No incoming orders yet. Once a student places an order for your items, their hostel and phone details will show here.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sellerOrders.map((ord) => (
              <div key={ord.id} className="p-4 sm:p-6 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                  <div className="space-y-1 w-full md:w-auto">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900">
                        Order #{ord.id}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs font-semibold text-slate-700">
                        {ord.productTitle}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs font-bold font-mono tabular-nums text-slate-900">
                        ₹{ord.productPrice}
                      </span>
                    </div>

                    {/* Buyer Delivery Coordinates */}
                    <div className="text-xs space-y-1 text-slate-600 pt-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-900">
                          Buyer: {ord.buyerName} ({ord.buyerRoll})
                        </span>
                        <span>·</span>
                        <span className="text-amber-800 font-medium">
                          {ord.deliveryDetails.hostel} · Room {ord.deliveryDetails.roomNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 flex-wrap">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Slot: <strong>{ord.deliveryDetails.preferredSlot.split('—')[0]}</strong></span>
                        <span>·</span>
                        <span>Phone: <strong className="font-mono">{ord.deliveryDetails.contactNumber}</strong></span>
                      </div>
                      {ord.deliveryDetails.notes && (
                        <div className="text-[11px] text-slate-500 italic">
                          Note: "{ord.deliveryDetails.notes}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delivery Status Management */}
                  <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="flex items-center justify-between sm:justify-start gap-2">
                      <span className="text-xs text-slate-500">Status:</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                        ord.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.status === 'Out for Delivery'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ord.status}
                      </span>
                    </div>

                    {ord.status !== 'Delivered' && (
                      <div className="flex flex-col sm:flex-row items-stretch gap-1.5 mt-1 sm:mt-0">
                        {ord.status !== 'Out for Delivery' && (
                          <button
                            onClick={() => onOrderStatusUpdated(ord.id, 'Out for Delivery')}
                            className="px-3 py-2 sm:py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition-colors text-center min-h-[40px] sm:min-h-0"
                          >
                            Mark Out for Delivery
                          </button>
                        )}
                        <button
                          onClick={() => onOrderStatusUpdated(ord.id, 'Delivered')}
                          className="px-3 py-2 sm:py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs text-center min-h-[40px] sm:min-h-0"
                        >
                          Confirm Handed Over & Delivered
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
