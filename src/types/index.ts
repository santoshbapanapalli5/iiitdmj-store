export type UserRole = 'student' | 'admin';

export type HostelName =
  | 'Hall of Residence 1 (Hall 1)'
  | 'Hall of Residence 3 (Hall 3)'
  | 'Hall of Residence 4 (Hall 4)'
  | 'Panini Residency (Next-Gen)'
  | 'Nagarjuna Residency (Next-Gen)'
  | 'Maa Saraswati Hostel (Girls)'
  | 'PG & Research Scholars Hostel';

export interface User {
  id: string;
  name: string;
  email: string; // must end with @iiitdmj.ac.in
  rollNumber: string; // e.g., 22BCS045
  batch: string; // e.g., 2022
  discipline: string; // CSE, ECE, ME, Smart Manufacturing, Design
  hostel: HostelName;
  roomNumber: string;
  phone: string;
  avatarUrl?: string;
  createdAt: string;
  ratingAsSeller?: number;
  totalSales?: number;
}

export type ProductCategory =
  | 'Bicycles'
  | 'Textbooks & Notes'
  | 'Electronics & Monitors'
  | 'Coolers & Appliances'
  | 'Mattress & Room Decor'
  | 'Lab Kits & Hardware'
  | 'Sports & Fitness'
  | 'Engineering Calculators';

export type ProductCondition =
  | 'Brand New'
  | 'Like New / Mint'
  | 'Gently Used'
  | 'Well-Loved';

export type InventoryStatus = 'Available' | 'Out of Stock' | 'Sold';

export interface Product {
  id: string;
  title: string;
  description: string;
  category: ProductCategory;
  price: number; // in INR (₹)
  originalPrice?: number;
  condition: ProductCondition;
  inventoryStatus: InventoryStatus;
  images: string[];
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  sellerRoll: string;
  sellerHostel: HostelName;
  handoverLocation: string; // e.g., "Hall 3 Canteen" or "Central Mess"
  createdAt: string;
  viewsCount: number;
  rating: number; // average rating
  reviewCount: number;
}

export type OrderStatus =
  | 'Placed'
  | 'Confirmed by Seller'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface CampusDeliveryDetails {
  hostel: HostelName;
  roomNumber: string;
  contactNumber: string;
  preferredSlot: 'Morning (8:00 AM - 9:00 AM)' | 'Afternoon Break (1:00 PM - 2:00 PM)' | 'Evening Post-Labs (5:30 PM - 7:30 PM)' | 'Night Mess (9:00 PM - 10:30 PM)';
  notes?: string;
}

export interface Order {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  productPrice: number;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerRoll: string;
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  deliveryDetails: CampusDeliveryDetails;
  paymentMethod: 'UPI on Delivery (GPay / PhonePe / Paytm)' | 'Cash on Delivery (Campus Handover)';
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
  hasReviewed?: boolean;
}

export interface Review {
  id: string;
  productId: string;
  orderId: string;
  buyerId: string;
  buyerName: string;
  buyerRoll: string;
  buyerHostel: HostelName;
  rating: number; // 1 to 5
  headline: string;
  comment: string;
  conditionAsDescribed: boolean;
  createdAt: string;
  isVerifiedDelivery: boolean;
}

export interface VerifiedReviewCheckResponse {
  canReview: boolean;
  reason: 'delivered_eligible' | 'not_ordered' | 'order_pending_delivery' | 'already_reviewed';
  order?: Order;
  message: string;
}
