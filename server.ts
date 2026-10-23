/**
 * ============================================================================
 * IIITDMJ CAMPUS BAZAAR — FULL-STACK EXPRESS BACKEND SERVER
 * Pandit Dwarka Prasad Mishra IIITDM Jabalpur Peer-to-Peer Marketplace API
 * ============================================================================
 */

import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// In-Memory Database collections (ready to swap with Mongoose or Firestore)
interface DBUser {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  batch: string;
  discipline: string;
  hostel: string;
  roomNumber: string;
  phone: string;
}

interface DBProduct {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  condition: string;
  inventoryStatus: 'Available' | 'Out of Stock' | 'Sold';
  images: string[];
  sellerId: string;
  sellerHostel: string;
  handoverLocation: string;
  rating: number;
  reviewCount: number;
}

interface DBOrder {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  productPrice: number;
  deliveryDetails: {
    hostel: string;
    roomNumber: string;
    contactNumber: string;
    preferredSlot: string;
  };
  paymentMethod: string;
  status: 'Placed' | 'Confirmed by Seller' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  hasReviewed: boolean;
  deliveredAt?: string;
  createdAt: string;
}

interface DBReview {
  id: string;
  productId: string;
  orderId: string;
  buyerId: string;
  buyerRoll: string;
  buyerHostel: string;
  rating: number;
  headline: string;
  comment: string;
  conditionAsDescribed: boolean;
  isVerifiedDelivery: boolean;
  createdAt: string;
}

// Seed Store
const users: DBUser[] = [
  {
    id: 'user_1',
    name: 'Aryan Patel',
    email: '22bec034@iiitdmj.ac.in',
    rollNumber: '22BEC034',
    batch: '2022',
    discipline: 'Electronics & Communication Engineering',
    hostel: 'Hall of Residence 3 (Hall 3)',
    roomNumber: 'B-314',
    phone: '9827361120',
  },
  {
    id: 'user_2',
    name: 'Ananya Sharma',
    email: '21bcs012@iiitdmj.ac.in',
    rollNumber: '21BCS012',
    batch: '2021',
    discipline: 'Computer Science & Engineering',
    hostel: 'Maa Saraswati Hostel (Girls)',
    roomNumber: 'G-108',
    phone: '9752109843',
  },
];

const orders: DBOrder[] = [
  {
    id: 'ord_101',
    productId: 'prod_2',
    buyerId: 'user_1',
    sellerId: 'user_2',
    productPrice: 650,
    deliveryDetails: {
      hostel: 'Hall of Residence 3 (Hall 3)',
      roomNumber: 'B-314',
      contactNumber: '9827361120',
      preferredSlot: 'Evening Post-Labs (5:30 PM - 7:30 PM)',
    },
    paymentMethod: 'UPI on Delivery (GPay / PhonePe / Paytm)',
    status: 'Delivered',
    hasReviewed: false,
    deliveredAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
];

const reviews: DBReview[] = [];

// 1. SMART EMAIL DETECTION & REGISTRATION CHECK
// Checks if email belongs to @iiitdmj.ac.in and whether account exists
app.post('/api/auth/check-email', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ success: false, error: 'Email is required' });
  }

  const clean = email.toLowerCase().trim();
  if (!clean.endsWith('@iiitdmj.ac.in')) {
    return res.status(400).json({
      success: false,
      error: 'Access restricted: Only official IIITDM Jabalpur corporate emails (@iiitdmj.ac.in) are permitted.',
    });
  }

  const existing = users.find(u => u.email === clean);
  return res.json({
    success: true,
    data: {
      isExisting: !!existing,
      user: existing || null,
    },
  });
});

// 2. CAMPUS HOSTEL CHECKOUT ENDPOINT
// Bypasses standard courier/zip inputs, requires strict hostel coordinates
app.post('/api/orders', (req: Request, res: Response) => {
  const { productId, buyerId, sellerId, productPrice, deliveryDetails, paymentMethod } = req.body;

  if (!deliveryDetails?.hostel || !deliveryDetails?.roomNumber || !deliveryDetails?.contactNumber) {
    return res.status(400).json({
      success: false,
      error: 'College delivery details required: Hostel Name, Room Number, and 10-digit Phone.',
    });
  }

  const newOrder: DBOrder = {
    id: `ord_${Date.now()}`,
    productId,
    buyerId,
    sellerId,
    productPrice,
    deliveryDetails,
    paymentMethod: paymentMethod || 'UPI on Delivery (GPay / PhonePe / Paytm)',
    status: 'Placed',
    hasReviewed: false,
    createdAt: new Date().toISOString(),
  };

  orders.unshift(newOrder);
  return res.status(201).json({ success: true, data: newOrder });
});

// 3. CORE VERIFIED REVIEW CONSTRAINT ENDPOINT (POST /api/reviews)
// STRICT REQUIREMENT: Order status MUST BE "Delivered"
app.post('/api/reviews', (req: Request, res: Response) => {
  const { userId, productId, rating, headline, comment, conditionAsDescribed } = req.body;

  if (!userId || !productId || !rating || !headline || !comment) {
    return res.status(400).json({
      success: false,
      error: 'Missing required review fields (userId, productId, rating, headline, comment).',
    });
  }

  // Find orders placed by this student for this product
  const userOrders = orders.filter(o => o.buyerId === userId && o.productId === productId);

  if (userOrders.length === 0) {
    return res.status(403).json({
      success: false,
      errorCode: 'NOT_A_PURCHASER',
      error: 'Access Denied: Only students who have purchased this item on campus can leave a review.',
    });
  }

  // Check for delivered order
  const deliveredOrder = userOrders.find(o => o.status === 'Delivered');

  if (!deliveredOrder) {
    const activeOrder = userOrders[0];
    return res.status(403).json({
      success: false,
      errorCode: 'ORDER_NOT_DELIVERED',
      status: activeOrder.status,
      error: `Review Locked: Premature reviews are strictly forbidden. Your order is currently "${activeOrder.status}". You can only rate and review this item once campus hostel delivery is confirmed.`,
    });
  }

  if (deliveredOrder.hasReviewed) {
    return res.status(409).json({
      success: false,
      errorCode: 'ALREADY_REVIEWED',
      error: 'You have already submitted a verified review for this completed delivery.',
    });
  }

  const buyer = users.find(u => u.id === userId);
  const newReview: DBReview = {
    id: `rev_${Date.now()}`,
    productId,
    orderId: deliveredOrder.id,
    buyerId: userId,
    buyerRoll: buyer?.rollNumber || '22BCS000',
    buyerHostel: deliveredOrder.deliveryDetails.hostel,
    rating: Math.min(5, Math.max(1, Number(rating))),
    headline: headline.trim(),
    comment: comment.trim(),
    conditionAsDescribed: Boolean(conditionAsDescribed),
    isVerifiedDelivery: true,
    createdAt: new Date().toISOString(),
  };

  deliveredOrder.hasReviewed = true;
  reviews.unshift(newReview);

  return res.status(201).json({
    success: true,
    message: 'Verified review published! Thank you for helping your fellow IIITDMJ batchmates.',
    data: newReview,
  });
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    platform: 'PDPM IIITDM Jabalpur Peer-to-Peer Campus Bazaar',
    timestamp: new Date().toISOString(),
  });
});

export default app;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`IIITDMJ Campus Bazaar server running on port ${PORT}`);
  });
}
