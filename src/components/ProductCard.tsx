import React, { useState } from 'react';
import { Star, MapPin, Eye, ShoppingCart } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onQuickBuy: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onQuickBuy,
}) => {
  const [imageError, setImageError] = useState(false);

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <article
      onClick={() => onSelect(product)}
      className="group relative bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md overflow-hidden cursor-pointer flex flex-col h-full"
    >
      {/* Product Image Slot (65% visual weight) */}
      <div className="relative w-full aspect-4/3 bg-slate-100 overflow-hidden shrink-0">
        {!imageError && product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.title}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          />
        ) : (
          /* Styled Resilient CSS Fallback Container */
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 p-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-white shadow-xs flex items-center justify-center text-[#0A192F] font-bold text-sm mb-2">
              IIIT
            </div>
            <span className="text-xs font-medium text-slate-600 line-clamp-1">{product.category}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Campus Verified Item</span>
          </div>
        )}

        {/* Quiet single-text status badge (if not available) */}
        {product.inventoryStatus !== 'Available' && (
          <div className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-xs">
            {product.inventoryStatus}
          </div>
        )}

        {/* Discount tag if applicable */}
        {discountPercent && discountPercent > 0 && product.inventoryStatus === 'Available' && (
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold tracking-tight bg-amber-500 text-slate-950 shadow-xs">
            {discountPercent}% OFF
          </div>
        )}
      </div>

      {/* Card Content & Zero-Pill Metadata */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Zero-Pill Metadata: Clean inline text with bullet separators */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5 flex-wrap">
            <span className="font-medium text-amber-700">{product.category}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>{product.condition}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="truncate max-w-[120px]">{product.sellerHostel.split(' ')[0]} {product.sellerHostel.includes('3') ? '3' : product.sellerHostel.includes('4') ? '4' : 'G'}</span>
          </div>

          {/* Product Title */}
          <h3 className="text-sm font-semibold text-slate-900 group-hover:text-[#0A192F] line-clamp-2 leading-snug">
            {product.title}
          </h3>

          {/* Handover location subtle cue */}
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{product.handoverLocation}</span>
          </div>
        </div>

        {/* Bottom Row: Price + Rating + Buy Action */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold font-mono tabular-nums text-slate-900">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-slate-400 line-through font-mono tabular-nums">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Rating text */}
            <div className="flex items-center gap-1 text-[11px] text-slate-600 mt-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold tabular-nums">{product.rating > 0 ? product.rating : 'New'}</span>
              <span className="text-slate-400">({product.reviewCount} verified)</span>
            </div>
          </div>

          {/* Interactive Button */}
          {product.inventoryStatus === 'Available' ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickBuy(product);
              }}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0A192F] hover:bg-[#162A45] rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-xs"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Checkout</span>
            </button>
          ) : (
            <span className="text-xs font-medium text-slate-400">
              {product.inventoryStatus}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};
