import React, { useState, useEffect } from 'react';
import {
  X,
  Truck,
  Building2,
  Phone,
  Clock,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  Banknote,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Product, User, HostelName, Order } from '../types';
import { HOSTELS_LIST } from '../data/mockData';
import { api } from '../services/api';

interface CampusCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  currentUser: User | null;
  onOrderPlaced: (order: Order) => void;
  onRequireAuth: () => void;
}

export const CampusCheckoutModal: React.FC<CampusCheckoutModalProps> = ({
  isOpen,
  onClose,
  product,
  currentUser,
  onOrderPlaced,
  onRequireAuth,
}) => {
  const [hostel, setHostel] = useState<HostelName>('Hall of Residence 3 (Hall 3)');
  const [roomNumber, setRoomNumber] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [preferredSlot, setPreferredSlot] = useState<
    'Morning (8:00 AM - 9:00 AM)' | 'Afternoon Break (1:00 PM - 2:00 PM)' | 'Evening Post-Labs (5:30 PM - 7:30 PM)' | 'Night Mess (9:00 PM - 10:30 PM)'
  >('Evening Post-Labs (5:30 PM - 7:30 PM)');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<
    'UPI on Delivery (GPay / PhonePe / Paytm)' | 'Cash on Delivery (Campus Handover)'
  >('UPI on Delivery (GPay / PhonePe / Paytm)');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Prefill buyer defaults from user profile
  useEffect(() => {
    if (currentUser) {
      if (currentUser.hostel) setHostel(currentUser.hostel);
      if (currentUser.roomNumber) setRoomNumber(currentUser.roomNumber);
      if (currentUser.phone) setContactNumber(currentUser.phone);
    }
  }, [currentUser]);

  if (!isOpen || !product) return null;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentUser) {
      onRequireAuth();
      return;
    }

    if (!roomNumber.trim()) {
      setErrorMsg('Please specify your hostel room number for delivery.');
      return;
    }

    if (!contactNumber.trim() || contactNumber.trim().length < 10) {
      setErrorMsg('Please provide a valid 10-digit campus contact phone number.');
      return;
    }

    setSubmitting(true);
    const res = await api.createOrder({
      productId: product.id,
      buyer: currentUser,
      deliveryDetails: {
        hostel,
        roomNumber: roomNumber.trim(),
        contactNumber: contactNumber.trim(),
        preferredSlot,
        notes: notes.trim() || undefined,
      },
      paymentMethod,
    });
    setSubmitting(false);

    if (res.success && res.data) {
      onOrderPlaced(res.data);
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to submit order. Please check inputs.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-[#0A192F] px-6 py-4 flex items-center justify-between text-white border-b border-amber-500/20 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-[#0A192F] font-black text-sm flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight">Campus-Specific Checkout</div>
              <div className="text-[11px] text-amber-300">Direct IIITDMJ Hostel Handover</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmitOrder} className="p-6 overflow-y-auto space-y-5">
          
          {/* Order Item Summary */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
            <div className="w-14 h-14 rounded-lg bg-slate-200 overflow-hidden shrink-0">
              {product.images[0] && (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-900 truncate">
                {product.title}
              </div>
              <div className="text-[11px] text-slate-500">
                Seller: {product.sellerName} ({product.sellerHostel})
              </div>
              <div className="text-sm font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                ₹{product.price.toLocaleString('en-IN')}
                <span className="text-[11px] font-normal text-emerald-600 ml-2 font-sans">
                  + ₹0 Delivery Fee (Student Handover)
                </span>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              {errorMsg}
            </div>
          )}

          {/* College Delivery Details Section (Strictly Required) */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Building2 className="w-4 h-4 text-[#0A192F]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A192F]">
                College Delivery Details
              </h4>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Standard city & pin codes are bypassed. Orders are delivered directly to your hostel room or common lobby.
            </p>

            <div className="space-y-3">
              {/* Hostel Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hostel Name <span className="text-red-500">*</span>
                </label>
                <select
                  value={hostel}
                  onChange={(e) => setHostel(e.target.value as HostelName)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A192F]"
                  required
                >
                  {HOSTELS_LIST.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              {/* Room Number & Phone Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Room Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="e.g. B-314, F-201, P-405"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A192F]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-mono text-slate-400">+91</span>
                    <input
                      type="tel"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="9827361120"
                      className="w-full pl-11 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A192F]"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Preferred Delivery Time Slot */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preferred Handover Time Slot
                </label>
                <div className="relative">
                  <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <select
                    value={preferredSlot}
                    onChange={(e: any) => setPreferredSlot(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A192F]"
                  >
                    <option value="Morning (8:00 AM - 9:00 AM)">Morning (8:00 AM - 9:00 AM) — Before 1st period</option>
                    <option value="Afternoon Break (1:00 PM - 2:00 PM)">Afternoon Break (1:00 PM - 2:00 PM) — Lunch hour</option>
                    <option value="Evening Post-Labs (5:30 PM - 7:30 PM)">Evening Post-Labs (5:30 PM - 7:30 PM) — SAC / Hostel</option>
                    <option value="Night Mess (9:00 PM - 10:30 PM)">Night Mess (9:00 PM - 10:30 PM) — After dinner</option>
                  </select>
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Handover Spot / Notes for Seller (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Call when outside Hall 3 canteen or bring to common room"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A192F]"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Payment Method (On Delivery)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                  paymentMethod.includes('UPI')
                    ? 'border-[#0A192F] bg-blue-50/40 text-[#0A192F]'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod.includes('UPI')}
                  onChange={() => setPaymentMethod('UPI on Delivery (GPay / PhonePe / Paytm)')}
                  className="mt-0.5"
                />
                <div>
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>UPI on Handover</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Scan seller's GPay / PhonePe QR code once you inspect the item.
                  </div>
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                  paymentMethod.includes('Cash')
                    ? 'border-[#0A192F] bg-blue-50/40 text-[#0A192F]'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod.includes('Cash')}
                  onChange={() => setPaymentMethod('Cash on Delivery (Campus Handover)')}
                  className="mt-0.5"
                />
                <div>
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <Banknote className="w-3.5 h-3.5" />
                    <span>Cash on Handover</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Hand cash directly to fellow student upon item verification.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Review Verification Notice */}
          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>Peer Review Guarantee:</strong> After you receive and inspect this item at your hostel, confirm delivery in "My Orders" to unlock verified reviews and help fellow batchmates.
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 text-sm font-semibold text-white bg-[#0A192F] hover:bg-[#162A45] rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <span>Confirming Order...</span>
              ) : (
                <>
                  <span>Place Campus Delivery Order (₹{product.price.toLocaleString('en-IN')})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
