import {
  User,
  Product,
  Order,
  Review,
  InventoryStatus,
  OrderStatus,
  VerifiedReviewCheckResponse,
  CampusDeliveryDetails,
} from '../types';
import { storage } from './storage';

// Simulated realistic network latency for authentic feel
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: number;
}

export const api = {
  // Auth endpoints
  async checkEmail(email: string): Promise<ApiResponse<{ isExisting: boolean; user?: User }>> {
    await sleep(250);
    const result = storage.checkEmail(email);
    if (result.error) {
      return { success: false, error: result.error, code: 400 };
    }
    return {
      success: true,
      data: { isExisting: result.isExisting, user: result.user },
      code: 200,
    };
  },

  async registerStudent(userData: Omit<User, 'id' | 'createdAt'>): Promise<ApiResponse<User>> {
    await sleep(350);
    const result = storage.registerStudent(userData);
    if (!result.success || !result.user) {
      return { success: false, error: result.error || 'Failed to register', code: 400 };
    }
    return { success: true, data: result.user, code: 201 };
  },

  async login(email: string): Promise<ApiResponse<User>> {
    await sleep(300);
    const check = storage.checkEmail(email);
    if (check.error) {
      return { success: false, error: check.error, code: 400 };
    }
    if (!check.isExisting || !check.user) {
      return { success: false, error: 'Student not found. Please register first.', code: 404 };
    }
    storage.setCurrentUser(check.user.id);
    return { success: true, data: check.user, code: 200 };
  },

  async getCurrentUser(): Promise<User | null> {
    return storage.getCurrentUser();
  },

  async switchUser(userId: string): Promise<User | null> {
    storage.setCurrentUser(userId);
    return storage.getCurrentUser();
  },

  async logout(): Promise<void> {
    storage.setCurrentUser(null);
  },

  // Products endpoints
  async getProducts(): Promise<ApiResponse<Product[]>> {
    await sleep(150);
    return { success: true, data: storage.getProducts(), code: 200 };
  },

  async createProduct(
    productData: Omit<Product, 'id' | 'createdAt' | 'viewsCount' | 'rating' | 'reviewCount'>
  ): Promise<ApiResponse<Product>> {
    await sleep(350);
    try {
      const newProd = storage.addProduct(productData);
      return { success: true, data: newProd, code: 201 };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to create listing', code: 500 };
    }
  },

  async updateInventoryStatus(productId: string, status: InventoryStatus): Promise<ApiResponse<Product>> {
    await sleep(200);
    const updated = storage.updateProductStatus(productId, status);
    if (!updated) return { success: false, error: 'Product not found', code: 404 };
    return { success: true, data: updated, code: 200 };
  },

  // Orders endpoints
  async createOrder(params: {
    productId: string;
    buyer: User;
    deliveryDetails: CampusDeliveryDetails;
    paymentMethod: 'UPI on Delivery (GPay / PhonePe / Paytm)' | 'Cash on Delivery (Campus Handover)';
  }): Promise<ApiResponse<Order>> {
    await sleep(400);
    try {
      const order = storage.createOrder(params);
      return { success: true, data: order, code: 201 };
    } catch (e: any) {
      return { success: false, error: e.message || 'Order failed', code: 400 };
    }
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<ApiResponse<Order>> {
    await sleep(250);
    const updated = storage.updateOrderStatus(orderId, status);
    if (!updated) return { success: false, error: 'Order not found', code: 404 };
    return { success: true, data: updated, code: 200 };
  },

  // Reviews endpoints & strict verification check
  async checkReviewEligibility(userId: string, productId: string): Promise<ApiResponse<VerifiedReviewCheckResponse>> {
    await sleep(150);
    const result = storage.verifyReviewEligibility(userId, productId);
    return { success: true, data: result, code: 200 };
  },

  async submitVerifiedReview(params: {
    userId: string;
    productId: string;
    rating: number;
    headline: string;
    comment: string;
    conditionAsDescribed: boolean;
  }): Promise<ApiResponse<Review>> {
    await sleep(350);
    const result = storage.submitVerifiedReview(params);
    if (!result.success || !result.review) {
      return {
        success: false,
        error: result.error || 'Review rejected: Verification check failed.',
        code: 403,
      };
    }
    return { success: true, data: result.review, code: 201 };
  },

  async getReviews(productId: string): Promise<ApiResponse<Review[]>> {
    await sleep(100);
    return { success: true, data: storage.getReviewsForProduct(productId), code: 200 };
  },

  async resetMarketplace(): Promise<void> {
    storage.resetToDefaults();
  },

  async loadSampleCatalog(): Promise<void> {
    storage.loadSampleCatalog();
  },
};
