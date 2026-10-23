import React, { useState } from 'react';
import {
  Package,
  Truck,
  Building2,
  Clock,
  Phone,
  CheckCircle2,
  Star,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { Order, User, Product } from '../types';
import { api } from '../services/api';

interface BuyerDashboardProps {
  currentUser: User | null;
  orders: Order[];
  onOpenProduct: (productId: string) => void;
  onOrderUpdated: () => void;
  onRequireAuth: () => void;
  onBrowse: () => void;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({
  currentUser,
  orders,
  onOpenProduct,
  onOrderUpdated,
  onRequireAuth,
  onBrowse,
}) => {
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#0A192F] text-amber-400 flex items-center justify-center mx-auto mb-4">
          <Truck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">
          My Campus Orders
        </h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
          Sign in with your @iiitdmj.ac.in account to view your hostel delivery slips, verify receipts, and unlock peer reviews.
        </p>
        <button
          onClick={onRequireAuth}
          className="mt-6 px-6 py-2.5 text-sm font-semibold text-white bg-[#0A192F] hover:bg-[#162A45] rounded-xl transition-colors shadow-xs"
        >
          Sign In
        </button>
      </div>
    );
  }

  const myOrders = orders.filter(o => o.buyerId === currentUser.id);

  const handleConfirmReceived = async (orderId: string) => {
    setUpdatingOrderId(orderId);
    await api.updateOrderStatus(orderId, 'Delivered');
    setUpdatingOrderId(null);
    onOrderUpdated();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            My Campus Hostel Orders
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track student-to-student deliveries across IIITDMJ halls. Once delivered, submit trusted verified reviews.
          </p>
        </div>

        <button
          onClick={onBrowse}
          className="px-4 py-2 text-xs font-semibold text-[#0A192F] bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
        >
          <span>Explore Campus Bazaar</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Orders List */}
      {myOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            No campus orders placed yet
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-5">
            Find cycles, lab kits, monitors, coolers, and textbooks listed by batchmates.
          </p>
          <button
            onClick={onBrowse}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-[#0A192F] hover:bg-[#162A45] rounded-xl transition-colors shadow-xs"
          >
            Start Browsing Items
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {myOrders.map((ord) => {
            const isDelivered = ord.status === 'Delivered';

            return (
              <div
                key={ord.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all"
              >
                {/* Order Top Bar */}
                <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900">
                      Order #{ord.id}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500">
                      Placed on {new Date(ord.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="font-mono font-bold tabular-nums text-slate-900">
                      ₹{ord.productPrice}
                    </span>
                  </div>

                  {/* Order Status Badge */}
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                      isDelivered
                        ? 'bg-emerald-100 text-emerald-800'
                        : ord.status === 'Out for Delivery'
                        ? 'bg-blue-100 text-blue-800 animate-pulse'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {ord.status}
                    </span>
                  </div>
                </div>

                {/* Order Details Body */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  
                  {/* Left: Product Info */}
                  <div className="md:col-span-4 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                      {ord.productImage && (
                        <img
                          src={ord.productImage}
                          alt={ord.productTitle}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <h3
                        onClick={() => onOpenProduct(ord.productId)}
                        className="text-xs font-bold text-slate-900 hover:text-amber-800 cursor-pointer line-clamp-2"
                      >
                        {ord.productTitle}
                      </h3>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Seller: {ord.sellerName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {ord.sellerEmail}
                      </div>
                    </div>
                  </div>

                  {/* Middle: Delivery Slip Details */}
                  <div className="md:col-span-4 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Delivery Address
                    </div>
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>{ord.deliveryDetails.hostel} · Room {ord.deliveryDetails.roomNumber}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span className="font-mono">{ord.deliveryDetails.contactNumber}</span>
                      <span>·</span>
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="truncate">{ord.deliveryDetails.preferredSlot.split('—')[0]}</span>
                    </div>
                  </div>

                  {/* Right: Actions & Verified Review Trigger */}
                  <div className="md:col-span-4 flex flex-col items-end gap-2 text-right">
                    {/* If in transit: allow buyer to confirm receipt */}
                    {!isDelivered && (
                      <div className="w-full sm:w-auto">
                        <button
                          onClick={() => handleConfirmReceived(ord.id)}
                          disabled={updatingOrderId === ord.id}
                          className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{updatingOrderId === ord.id ? 'Updating...' : 'I Received This Item (Confirm Handover)'}</span>
                        </button>
                        <div className="text-[10px] text-slate-400 mt-1 text-center sm:text-right">
                          Confirming unlocks verified peer reviews
                        </div>
                      </div>
                    )}

                    {/* If delivered: show Verified Review status */}
                    {isDelivered && (
                      <div className="w-full sm:w-auto flex flex-col items-end">
                        <button
                          onClick={() => onOpenProduct(ord.productId)}
                          className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-[#0A192F] bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5 fill-[#0A192F]" />
                          <span>{ord.hasReviewed ? 'View Your Verified Review' : 'Submit Verified Peer Review'}</span>
                        </button>
                        <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium mt-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Delivered to {ord.deliveryDetails.hostel.split(' ')[0]}</span>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
