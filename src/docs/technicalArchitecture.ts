export const TECH_STACK_SPEC = {
  frontend: {
    framework: 'React 19 + TypeScript + Vite',
    styling: 'Tailwind CSS v4 (IIITDMJ official palette: Navy #0A192F, Gold #F59E0B, White #FFFFFF)',
    stateManagement: 'Modular React Hooks + Persistent Storage Sync',
    icons: 'Lucide-React',
    motion: 'Motion (Framer Motion v12) for smooth micro-interactions',
  },
  backend: {
    runtime: 'Node.js (v20+ LTS)',
    framework: 'Express.js with TypeScript',
    auth: 'JWT (JSON Web Tokens) with @iiitdmj.ac.in domain validation & Roll Number extraction',
    fileStorage: 'Cloudinary API / Firebase Storage for student product photo uploads with 5MB limits',
    security: 'Helmet, express-rate-limit, CORS origin restriction to campus domain',
  },
  database: {
    primary: 'MongoDB (Mongoose ODM) or Firebase Firestore',
    indexing: 'Compound index on orders: { buyerId: 1, productId: 1, status: 1 } for O(1) review verification',
  },
};

export const DATABASE_SCHEMA_CODE = `/**
 * ============================================================================
 * DATABASE SCHEMA DEFINITIONS (MongoDB / Mongoose ODM & Firebase Firestore)
 * Specially designed for PDPM IIITDM Jabalpur Peer-to-Peer Marketplace
 * ============================================================================
 */

import { Schema, model, Document, Types } from 'mongoose';

// 1. USERS COLLECTION
// Restricts to @iiitdmj.ac.in corporate emails and campus hostel addresses
export interface IUser extends Document {
  name: string;
  email: string; // Regex enforced: /^[a-zA-Z0-9._%+-]+@iiitdmj\\.ac\\.in$/
  rollNumber: string; // e.g. "22BCS045", "21BEC012"
  batch: string; // e.g. "2022"
  discipline: string; // CSE, ECE, ME, SM, B.Des, etc.
  hostel: 'Hall 1' | 'Hall 3' | 'Hall 4' | 'Panini Residency' | 'Nagarjuna Residency' | 'Maa Saraswati Hostel' | 'PG Hostel';
  roomNumber: string;
  phone: string; // 10-digit Indian mobile number
  avatarUrl?: string;
  ratingAsSeller: number; // Running average 1.0 - 5.0
  totalSales: number;
  isEmailVerified: boolean;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-zA-Z0-9._%+-]+@iiitdmj\\.ac\\.in$/, 'Only @iiitdmj.ac.in corporate emails are permitted.'],
  },
  rollNumber: { type: String, required: true, uppercase: true, trim: true },
  batch: { type: String, required: true },
  discipline: { type: String, required: true },
  hostel: {
    type: String,
    required: true,
    enum: [
      'Hall of Residence 1 (Hall 1)',
      'Hall of Residence 3 (Hall 3)',
      'Hall of Residence 4 (Hall 4)',
      'Panini Residency (Next-Gen)',
      'Nagarjuna Residency (Next-Gen)',
      'Maa Saraswati Hostel (Girls)',
      'PG & Research Scholars Hostel',
    ],
  },
  roomNumber: { type: String, required: true, trim: true },
  phone: { type: String, required: true, match: [/^[6-9]\\d{9}$/, 'Please enter a valid 10-digit Indian phone number'] },
  avatarUrl: { type: String },
  ratingAsSeller: { type: Number, default: 5.0, min: 1.0, max: 5.0 },
  totalSales: { type: Number, default: 0 },
  isEmailVerified: { type: Boolean, default: true },
}, { timestamps: true });


// 2. PRODUCTS COLLECTION
// Campus items: Cycles, Textbooks, Mattress, Coolers, Electronics, Lab Kits
export interface IProduct extends Document {
  title: string;
  description: string;
  category: string;
  price: number; // in INR (₹)
  originalPrice?: number;
  condition: 'Brand New' | 'Like New / Mint' | 'Gently Used' | 'Well-Loved';
  inventoryStatus: 'Available' | 'Out of Stock' | 'Sold';
  images: string[];
  sellerId: Types.ObjectId;
  sellerHostel: string;
  handoverLocation: string; // e.g. "Hall 3 Canteen" or "Central Mess"
  viewsCount: number;
  rating: number;
  reviewCount: number;
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, maxlength: 2000 },
  category: {
    type: String,
    required: true,
    enum: [
      'Bicycles',
      'Textbooks & Notes',
      'Electronics & Monitors',
      'Coolers & Appliances',
      'Mattress & Room Decor',
      'Lab Kits & Hardware',
      'Sports & Fitness',
      'Engineering Calculators',
    ],
  },
  price: { type: Number, required: true, min: [0, 'Price cannot be negative'] },
  originalPrice: { type: Number },
  condition: {
    type: String,
    required: true,
    enum: ['Brand New', 'Like New / Mint', 'Gently Used', 'Well-Loved'],
  },
  inventoryStatus: {
    type: String,
    default: 'Available',
    enum: ['Available', 'Out of Stock', 'Sold'],
  },
  images: [{ type: String, required: true }],
  sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sellerHostel: { type: String, required: true },
  handoverLocation: { type: String, required: true, trim: true },
  viewsCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
}, { timestamps: true });

ProductSchema.index({ title: 'text', description: 'text' });


// 3. ORDERS COLLECTION
// Bypasses standard city/zip shipping inputs, requires strict college delivery details
export interface IOrder extends Document {
  productId: Types.ObjectId;
  buyerId: Types.ObjectId;
  sellerId: Types.ObjectId;
  productPrice: number;
  deliveryDetails: {
    hostel: string;
    roomNumber: string;
    contactNumber: string;
    preferredSlot: string;
    notes?: string;
  };
  paymentMethod: string;
  status: 'Placed' | 'Confirmed by Seller' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  deliveredAt?: Date;
  hasReviewed: boolean;
  createdAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  productPrice: { type: Number, required: true },
  deliveryDetails: {
    hostel: { type: String, required: true },
    roomNumber: { type: String, required: true },
    contactNumber: { type: String, required: true },
    preferredSlot: { type: String, required: true },
    notes: { type: String },
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['UPI on Delivery (GPay / PhonePe / Paytm)', 'Cash on Delivery (Campus Handover)'],
  },
  status: {
    type: String,
    default: 'Placed',
    enum: ['Placed', 'Confirmed by Seller', 'Out for Delivery', 'Delivered', 'Cancelled'],
    index: true,
  },
  deliveredAt: { type: Date },
  hasReviewed: { type: Boolean, default: false },
}, { timestamps: true });

// CRITICAL COMPOUND INDEX FOR VERIFIED REVIEWS:
// Instant O(1) query to verify whether buyer has a 'Delivered' order for a product
OrderSchema.index({ buyerId: 1, productId: 1, status: 1 });


// 4. REVIEWS COLLECTION
// Strict verification: Can ONLY be created if Order status is "Delivered"
export interface IReview extends Document {
  productId: Types.ObjectId;
  orderId: Types.ObjectId;
  buyerId: Types.ObjectId;
  buyerRoll: string;
  buyerHostel: string;
  rating: number; // 1 to 5 stars
  headline: string;
  comment: string;
  conditionAsDescribed: boolean;
  isVerifiedDelivery: boolean;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true }, // 1 review per delivered order
  buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  buyerRoll: { type: String, required: true },
  buyerHostel: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  headline: { type: String, required: true, trim: true, maxlength: 100 },
  comment: { type: String, required: true, trim: true, maxlength: 1500 },
  conditionAsDescribed: { type: Boolean, default: true },
  isVerifiedDelivery: { type: Boolean, default: true },
}, { timestamps: true });

// Ensure a student can only submit one review per order
ReviewSchema.index({ orderId: 1 }, { unique: true });
ReviewSchema.index({ buyerId: 1, productId: 1 }, { unique: true });
`;

export const VERIFIED_REVIEW_ENDPOINT_CODE = `/**
 * ============================================================================
 * CORE BACKEND API ENDPOINT LOGIC: STRICT VERIFIED REVIEW CONSTRAINT
 * Route: POST /api/reviews
 * ============================================================================
 */

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { Review } from '../models/Review';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    rollNumber: string;
    hostel: string;
  };
}

export async function createVerifiedReviewHandler(req: AuthenticatedRequest, res: Response) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const buyerId = req.user?.id;
    const { productId, rating, headline, comment, conditionAsDescribed } = req.body;

    // 1. Sanitize & Validate Payload
    if (!productId || !rating || !headline || !comment) {
      return res.status(400).json({
        success: false,
        error: 'Missing required review fields (productId, rating, headline, comment).',
      });
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be an integer between 1 and 5 stars.',
      });
    }

    // 2. Query Orders for this Buyer & Product
    // We look for any order that matches buyerId and productId
    const existingOrders = await Order.find({
      buyerId,
      productId,
    }).session(session);

    if (existingOrders.length === 0) {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        errorCode: 'NOT_A_PURCHASER',
        error: 'Access Denied: You have not ordered this item on IIITDMJ Campus Bazaar. Only students with a completed campus purchase can review products.',
      });
    }

    // 3. Strict Delivery Verification Logic:
    // Check if there is an order with status === 'Delivered'
    const deliveredOrder = existingOrders.find(order => order.status === 'Delivered');

    if (!deliveredOrder) {
      // Order exists but is still 'Placed', 'Confirmed', or 'Out for Delivery'
      const pendingOrder = existingOrders[0];
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        errorCode: 'ORDER_NOT_DELIVERED',
        currentStatus: pendingOrder.status,
        error: \`Review Locked: Premature reviews are strictly forbidden. Your order is currently "\${pendingOrder.status}". You can only rate and review this item once campus hostel delivery is confirmed.\`,
      });
    }

    // 4. Check if this Delivered Order was already reviewed
    if (deliveredOrder.hasReviewed) {
      await session.abortTransaction();
      return res.status(409).json({
        success: false,
        errorCode: 'ALREADY_REVIEWED',
        error: 'You have already submitted a verified review for this completed order.',
      });
    }

    // 5. Create Verified Review Document
    const review = new Review({
      productId,
      orderId: deliveredOrder._id,
      buyerId,
      buyerRoll: req.user!.rollNumber,
      buyerHostel: req.user!.hostel,
      rating: Math.round(numericRating),
      headline: headline.trim(),
      comment: comment.trim(),
      conditionAsDescribed: Boolean(conditionAsDescribed),
      isVerifiedDelivery: true,
    });

    await review.save({ session });

    // 6. Atomically update the Order status flag
    deliveredOrder.hasReviewed = true;
    await deliveredOrder.save({ session });

    // 7. Recalculate Aggregate Product Rating & Review Count
    const productReviews = await Review.find({ productId }).session(session);
    const totalScore = productReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = Number((totalScore / productReviews.length).toFixed(1));

    await Product.findByIdAndUpdate(
      productId,
      {
        rating: averageRating,
        reviewCount: productReviews.length,
      },
      { session }
    );

    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: 'Verified peer review published successfully! Thank you for helping your fellow IIITDMJ batchmates.',
      data: review,
    });
  } catch (error: any) {
    await session.abortTransaction();
    console.error('Review submission error:', error);
    return res.status(500).json({
      success: false,
      error: 'An unexpected internal error occurred while saving your verified review.',
    });
  } finally {
    session.endSession();
  }
}
`;
