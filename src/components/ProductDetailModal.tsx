import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  MapPin,
  ShieldCheck,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Building2,
  Clock,
  UserCheck,
  Send,
  Sparkles,
} from 'lucide-react';
import { Product, User, Review, VerifiedReviewCheckResponse } from '../types';
import { api } from '../services/api';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  currentUser: User | null;
  onInitiateCheckout: (product: Product) => void;
  onRequireAuth: () => void;
  onProductUpdated?: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  onClose,
  product,
  currentUser,
  onInitiateCheckout,
  onRequireAuth,
  onProductUpdated,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [eligibility, setEligibility] = useState<VerifiedReviewCheckResponse | null>(null);
  const [loadingEligibility, setLoadingEligibility] = useState(false);

  // Review Form state
  const [rating, setRating] = useState(5);
  const [headline, setHeadline] = useState('');
  const [comment, setComment] = useState('');
  const [conditionAsDescribed, setConditionAsDescribed] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [confirmingDelivery, setConfirmingDelivery] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      loadReviews(product.id);
      checkEligibility(product.id);
      setReviewError('');
      setReviewSuccess('');
      setHeadline('');
      setComment('');
      setRating(5);
    }
  }, [isOpen, product, currentUser]);

  const loadReviews = async (productId: string) => {
    const res = await api.getReviews(productId);
    if (res.success && res.data) {
      setReviews(res.data);
    }
  };

  const checkEligibility = async (productId: string) => {
    if (!currentUser) {
      setEligibility({
        canReview: false,
        reason: 'not_ordered',
        message: 'Please sign in with your @iiitdmj.ac.in account to check review eligibility.',
      });
      return;
    }

    setLoadingEligibility(true);
    const res = await api.checkReviewEligibility(currentUser.id, productId);
    setLoadingEligibility(false);

    if (res.success && res.data) {
      setEligibility(res.data);
    }
  };

  if (!isOpen || !product) return null;

  const handleSimulateDeliveryConfirmation = async () => {
    if (!eligibility?.order) return;
    setConfirmingDelivery(true);
    const res = await api.updateOrderStatus(eligibility.order.id, 'Delivered');
    setConfirmingDelivery(false);

    if (res.success) {
      // Re-check eligibility
      await checkEligibility(product.id);
      if (onProductUpdated) onProductUpdated();
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');

    if (!currentUser) {
      onRequireAuth();
      return;
    }

    if (!headline.trim()) {
      setReviewError('Please provide a brief headline summarizing your review.');
      return;
    }

    if (!comment.trim() || comment.trim().length < 10) {
      setReviewError('Please provide a helpful review comment (at least 10 characters).');
      return;
    }

    setSubmittingReview(true);
    const res = await api.submitVerifiedReview({
      userId: currentUser.id,
      productId: product.id,
      rating,
      headline: headline.trim(),
      comment: comment.trim(),
      conditionAsDescribed,
    });
    setSubmittingReview(false);

    if (res.success && res.data) {
      setReviewSuccess('Verified review published! Thank you for sharing trusted feedback.');
      await loadReviews(product.id);
      await checkEligibility(product.id);
      if (onProductUpdated) onProductUpdated();
    } else {
      setReviewError(res.error || 'Failed to submit review.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Top Header */}
        <div className="bg-[#0A192F] px-6 py-4 flex items-center justify-between text-white border-b border-amber-500/20 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Campus Item Details
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-300 font-mono">ID: {product.id}</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Area */}
        <div className="p-6 overflow-y-auto space-y-8">
          
          {/* Main Product Split: Gallery Left, Purchase Module Right */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Gallery (md: 6 cols) */}
            <div className="md:col-span-6 space-y-3">
              <div className="relative w-full aspect-4/3 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                {product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    No Image Available
                  </div>
                )}
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 text-white">
                  {product.condition}
                </div>
              </div>

              {/* Seller Trust Lockup */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Student Seller</span>
                  <span className="font-semibold text-slate-900">{product.sellerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Roll Number & Batch</span>
                  <span className="font-mono text-slate-800">{product.sellerRoll}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Hostel Base</span>
                  <span className="font-medium text-slate-900">{product.sellerHostel}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-500 font-medium">Handover Spot</span>
                  <span className="text-amber-800 font-semibold">{product.handoverLocation}</span>
                </div>
              </div>
            </div>

            {/* Purchase Module (md: 6 cols) */}
            <div className="md:col-span-6 space-y-4">
              
              {/* Category & Status */}
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-bold text-amber-700 uppercase tracking-wider">{product.category}</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-700 font-medium">{product.inventoryStatus}</span>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                {product.title}
              </h2>

              {/* Price & Rating */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-900">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-slate-400 line-through font-mono tabular-nums">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                <div className="ml-auto flex items-center gap-1 text-xs">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-slate-900">{product.rating > 0 ? product.rating : 'New'}</span>
                  <span className="text-slate-500">({product.reviewCount} verified)</span>
                </div>
              </div>

              {/* Description */}
              <div className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                {product.description}
              </div>

              {/* Campus Handover Assurance */}
              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-amber-700" />
                  <span>Hostel Doorstep or Common Area Handover</span>
                </div>
                <p className="text-[11px] text-amber-900">
                  Bypasses courier delays. Seller walks over to your hostel (Hall 1, 3, 4, Panini, Saraswati) at your selected time slot.
                </p>
              </div>

              {/* Buy CTA */}
              <div className="pt-3">
                {product.inventoryStatus === 'Available' ? (
                  <button
                    onClick={() => onInitiateCheckout(product)}
                    className="w-full py-3 text-sm font-semibold text-white bg-[#0A192F] hover:bg-[#162A45] rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Proceed to Campus Hostel Checkout</span>
                    <Truck className="w-4 h-4 text-amber-400" />
                  </button>
                ) : (
                  <div className="w-full py-3 text-center text-xs font-semibold text-slate-500 bg-slate-100 rounded-xl">
                    Item is currently {product.inventoryStatus}
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* VERIFIED REVIEW & RATING SYSTEM SECTION */}
          <section className="pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    Verified Peer Reviews & Ratings
                  </h3>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Delivered-Only Constraint Enforced</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Reviews are strictly locked to students who completed campus delivery. Zero unsolicited ratings.
                </p>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                  {product.rating > 0 ? product.rating : '—'}
                  <span className="text-xs text-slate-500 font-sans font-normal ml-1">/ 5.0</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Based on {reviews.length} campus verified delivery{reviews.length === 1 ? '' : 'ies'}
                </div>
              </div>
            </div>

            {/* VERIFICATION CONSTRAINT STATE PANEL */}
            <div className="mb-6 p-4 rounded-xl border transition-all">
              
              {/* Not Logged In */}
              {!currentUser && (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Review Verification Locked
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Sign in with your @iiitdmj.ac.in credentials to verify your delivery status.
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={onRequireAuth}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0A192F] rounded-lg hover:bg-[#162A45] whitespace-nowrap"
                  >
                    Sign In
                  </button>
                </div>
              )}

              {/* Logged in: Case 1 - ELIGIBLE (Delivered Order) */}
              {currentUser && eligibility?.canReview && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 mb-2">
                    <Unlock className="w-4 h-4 text-emerald-600" />
                    <span>Verified Delivery Confirmed · Review System Unlocked</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-4">
                    Your order was delivered to <strong>{eligibility.order?.deliveryDetails.hostel}</strong> (Room {eligibility.order?.deliveryDetails.roomNumber}). Share your authentic experience to help your fellow IIITDMJ students.
                  </p>

                  {/* Review Form */}
                  <form onSubmit={handleSubmitReview} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    
                    {reviewError && (
                      <div className="p-2.5 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200">
                        {reviewError}
                      </div>
                    )}
                    {reviewSuccess && (
                      <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs border border-emerald-200">
                        {reviewSuccess}
                      </div>
                    )}

                    {/* Star Picker */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Select Rating (1 to 5 Stars)
                      </label>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="p-1 hover:scale-110 transition-transform cursor-pointer"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="text-xs font-bold text-slate-700 ml-2 font-mono">
                          {rating} / 5 Stars
                        </span>
                      </div>
                    </div>

                    {/* Headline */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Review Headline
                      </label>
                      <input
                        type="text"
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        placeholder="e.g. Excellent gear shifting, delivered right to Hall 3 mess!"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0A192F]"
                        required
                      />
                    </div>

                    {/* Comment */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Detailed Peer Review
                      </label>
                      <textarea
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Detail the condition, battery/functionality, and timeliness of handover on campus..."
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0A192F]"
                        required
                      />
                    </div>

                    {/* Checkbox: Condition as described */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="conditionCheck"
                        checked={conditionAsDescribed}
                        onChange={(e) => setConditionAsDescribed(e.target.checked)}
                        className="rounded text-[#0A192F]"
                      />
                      <label htmlFor="conditionCheck" className="text-xs text-slate-700">
                        Item condition exactly matched seller description upon handover
                      </label>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="px-4 py-2 text-xs font-semibold text-white bg-[#0A192F] hover:bg-[#162A45] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{submittingReview ? 'Verifying & Posting...' : 'Publish Verified Student Review'}</span>
                      </button>
                    </div>

                  </form>
                </div>
              )}

              {/* Logged in: Case 2 - PENDING DELIVERY (Premature Review Blocked) */}
              {currentUser && !eligibility?.canReview && eligibility?.reason === 'order_pending_delivery' && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-amber-950 flex items-center gap-2">
                        <span>Strict Constraint: Premature Review Locked</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-200/80 text-amber-900">
                          Status: {eligibility.order?.status}
                        </span>
                      </div>
                      <p className="text-xs text-amber-900 mt-1 leading-snug">
                        {eligibility.message}
                      </p>
                      
                      {/* Interactive simulation action so tester can immediately verify */}
                      <div className="mt-3 pt-3 border-t border-amber-200/80 flex items-center justify-between flex-wrap gap-2">
                        <span className="text-[11px] text-amber-800">
                          Did you just receive this item at your hostel?
                        </span>
                        <button
                          type="button"
                          onClick={handleSimulateDeliveryConfirmation}
                          disabled={confirmingDelivery}
                          className="px-3 py-1.5 text-xs font-semibold text-[#0A192F] bg-amber-400 hover:bg-amber-300 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{confirmingDelivery ? 'Updating...' : 'I Received This Item (Confirm Delivered)'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Logged in: Case 3 - NOT ORDERED */}
              {currentUser && !eligibility?.canReview && eligibility?.reason === 'not_ordered' && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Verified Purchase Required to Review
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {eligibility.message}
                      </div>
                    </div>
                  </div>
                  {product.inventoryStatus === 'Available' && (
                    <button
                      onClick={() => onInitiateCheckout(product)}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0A192F] rounded-lg hover:bg-[#162A45] whitespace-nowrap"
                    >
                      Buy with Hostel Delivery
                    </button>
                  )}
                </div>
              )}

              {/* Logged in: Case 4 - ALREADY REVIEWED */}
              {currentUser && !eligibility?.canReview && eligibility?.reason === 'already_reviewed' && (
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3 flex items-center gap-2.5 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{eligibility.message}</span>
                </div>
              )}

            </div>

            {/* List of Existing Verified Reviews */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No verified peer reviews yet for this product. Be the first student buyer to review after hostel delivery!
                </div>
              ) : (
                reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-xl bg-white border border-slate-200 text-xs space-y-2 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        {/* 5-star display */}
                        <div className="flex items-center text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-bold text-slate-900 text-sm">
                          {rev.headline}
                        </span>
                      </div>

                      {/* Verified Badge */}
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Verified IIITDMJ Delivery</span>
                      </div>
                    </div>

                    <p className="text-slate-600 text-xs leading-relaxed">
                      "{rev.comment}"
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex-wrap">
                      <span className="font-semibold text-slate-800">{rev.buyerName}</span>
                      <span>·</span>
                      <span className="font-mono">{rev.buyerRoll}</span>
                      <span>·</span>
                      <span>{rev.buyerHostel}</span>
                      <span>·</span>
                      <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                      {rev.conditionAsDescribed && (
                        <>
                          <span>·</span>
                          <span className="text-emerald-600">✓ Condition matched listing</span>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

          </section>

        </div>

      </div>
    </div>
  );
};
