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
import {
  DEMO_USERS,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_REVIEWS,
  parseIIITRollNumber,
} from '../data/mockData';

const STORAGE_KEYS = {
  USERS: 'iiitdmj_bazaar_users_v2',
  PRODUCTS: 'iiitdmj_bazaar_products_v2',
  ORDERS: 'iiitdmj_bazaar_orders_v2',
  REVIEWS: 'iiitdmj_bazaar_reviews_v2',
  CURRENT_USER_ID: 'iiitdmj_bazaar_current_user_id_v2',
  ACTIVE_VIEW: 'iiitdmj_bazaar_active_view_v2',
};

class StorageService {
  private users: User[] = [];
  private products: Product[] = [];
  private orders: Order[] = [];
  private reviews: Review[] = [];
  private currentUserId: string | null = null;
  private activeView: 'buyer' | 'seller' = 'buyer';

  constructor() {
    this.init();
  }

  private init() {
    try {
      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      if (storedUsers) {
        this.users = JSON.parse(storedUsers);
      } else {
        this.users = [...DEMO_USERS];
        this.persistUsers();
      }

      const storedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (storedProducts) {
        this.products = JSON.parse(storedProducts);
      } else {
        // Initial state: NO mock products are shown
        this.products = [];
        this.persistProducts();
      }

      const storedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (storedOrders) {
        this.orders = JSON.parse(storedOrders);
      } else {
        this.orders = [];
        this.persistOrders();
      }

      const storedReviews = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      if (storedReviews) {
        this.reviews = JSON.parse(storedReviews);
      } else {
        this.reviews = [];
        this.persistReviews();
      }

      const storedCurUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      if (storedCurUser && this.users.some(u => u.id === storedCurUser)) {
        this.currentUserId = storedCurUser;
      } else {
        // Default to null so new users are directed to the sign in page
        this.currentUserId = null;
      }

      const storedView = localStorage.getItem(STORAGE_KEYS.ACTIVE_VIEW);
      if (storedView === 'buyer' || storedView === 'seller') {
        this.activeView = storedView;
      }
    } catch (e) {
      console.warn('LocalStorage fallback to memory:', e);
      this.users = [...DEMO_USERS];
      this.products = [];
      this.orders = [];
      this.reviews = [];
      this.currentUserId = null;
    }
  }

  private persistUsers() {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
    } catch (e) {
      console.error(e);
    }
  }

  private persistProducts() {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(this.products));
    } catch (e) {
      console.error(e);
    }
  }

  private persistOrders() {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(this.orders));
    } catch (e) {
      console.error(e);
    }
  }

  private persistReviews() {
    try {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(this.reviews));
    } catch (e) {
      console.error(e);
    }
  }

  // --- Auth & Users ---
  public getCurrentUser(): User | null {
    if (!this.currentUserId) return null;
    return this.users.find(u => u.id === this.currentUserId) || null;
  }

  public setCurrentUser(userId: string | null) {
    this.currentUserId = userId;
    if (userId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    }
  }

  public getAllUsers(): User[] {
    return [...this.users];
  }

  public getActiveView(): 'buyer' | 'seller' {
    return this.activeView;
  }

  public setActiveView(view: 'buyer' | 'seller') {
    this.activeView = view;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_VIEW, view);
  }

  public checkEmail(email: string): { isExisting: boolean; user?: User; error?: string } {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail.endsWith('@iiitdmj.ac.in')) {
      return {
        isExisting: false,
        error: 'Access restricted: Please enter an official IIITDMJ corporate email (@iiitdmj.ac.in).',
      };
    }

    const existing = this.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { isExisting: true, user: existing };
    }
    return { isExisting: false };
  }

  public registerStudent(data: Omit<User, 'id' | 'createdAt'>): { success: boolean; user?: User; error?: string } {
    const check = this.checkEmail(data.email);
    if (check.error) {
      return { success: false, error: check.error };
    }
    if (check.isExisting) {
      return { success: false, error: 'A student profile already exists with this @iiitdmj.ac.in address. Please sign in.' };
    }

    const newUser: User = {
      ...data,
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString(),
      ratingAsSeller: 5.0,
      totalSales: 0,
    };

    this.users.unshift(newUser);
    this.persistUsers();
    this.setCurrentUser(newUser.id);
    return { success: true, user: newUser };
  }

  // --- Products ---
  public getProducts(): Product[] {
    return [...this.products];
  }

  public getProductById(id: string): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  public addProduct(productData: Omit<Product, 'id' | 'createdAt' | 'viewsCount' | 'rating' | 'reviewCount'>): Product {
    const newProduct: Product = {
      ...productData,
      id: `prod_${Date.now()}`,
      createdAt: new Date().toISOString(),
      viewsCount: 1,
      rating: 0,
      reviewCount: 0,
    };

    this.products.unshift(newProduct);
    this.persistProducts();
    return newProduct;
  }

  public updateProductStatus(productId: string, status: InventoryStatus): Product | null {
    const prod = this.products.find(p => p.id === productId);
    if (!prod) return null;
    prod.inventoryStatus = status;
    this.persistProducts();
    return { ...prod };
  }

  public updateProductPrice(productId: string, newPrice: number): Product | null {
    const prod = this.products.find(p => p.id === productId);
    if (!prod) return null;
    prod.price = newPrice;
    this.persistProducts();
    return { ...prod };
  }

  public incrementProductViews(productId: string) {
    const prod = this.products.find(p => p.id === productId);
    if (prod) {
      prod.viewsCount += 1;
      this.persistProducts();
    }
  }

  // --- Orders ---
  public getOrders(): Order[] {
    return [...this.orders];
  }

  public getOrdersByBuyer(buyerId: string): Order[] {
    return this.orders.filter(o => o.buyerId === buyerId);
  }

  public getOrdersBySeller(sellerId: string): Order[] {
    return this.orders.filter(o => o.sellerId === sellerId);
  }

  public createOrder(params: {
    productId: string;
    buyer: User;
    deliveryDetails: CampusDeliveryDetails;
    paymentMethod: 'UPI on Delivery (GPay / PhonePe / Paytm)' | 'Cash on Delivery (Campus Handover)';
  }): Order {
    const product = this.getProductById(params.productId);
    if (!product) throw new Error('Product not found');

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      productId: product.id,
      productTitle: product.title,
      productImage: product.images[0] || '',
      productPrice: product.price,
      buyerId: params.buyer.id,
      buyerName: params.buyer.name,
      buyerEmail: params.buyer.email,
      buyerRoll: params.buyer.rollNumber,
      sellerId: product.sellerId,
      sellerName: product.sellerName,
      sellerEmail: product.sellerEmail,
      deliveryDetails: params.deliveryDetails,
      paymentMethod: params.paymentMethod,
      status: 'Placed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      hasReviewed: false,
    };

    this.orders.unshift(newOrder);
    this.persistOrders();
    return newOrder;
  }

  public updateOrderStatus(orderId: string, status: OrderStatus): Order | null {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return null;

    order.status = status;
    order.updatedAt = new Date().toISOString();
    if (status === 'Delivered' && !order.deliveredAt) {
      order.deliveredAt = new Date().toISOString();
      // Also mark seller stats and product status if single inventory
      const seller = this.users.find(u => u.id === order.sellerId);
      if (seller) {
        seller.totalSales = (seller.totalSales || 0) + 1;
        this.persistUsers();
      }
    }

    this.persistOrders();
    return { ...order };
  }

  // --- Verified Review Constraint System ---
  public verifyReviewEligibility(userId: string, productId: string): VerifiedReviewCheckResponse {
    // 1. Check if user has an order for this product
    const matchingOrders = this.orders.filter(
      o => o.buyerId === userId && o.productId === productId
    );

    if (matchingOrders.length === 0) {
      return {
        canReview: false,
        reason: 'not_ordered',
        message: 'Verified Purchase Required: You must order this item and receive it on campus before leaving a peer review.',
      };
    }

    // 2. Check if there is already a delivered order that hasn't been reviewed yet
    const deliveredUnreviewedOrder = matchingOrders.find(
      o => o.status === 'Delivered' && !o.hasReviewed
    );

    if (deliveredUnreviewedOrder) {
      return {
        canReview: true,
        reason: 'delivered_eligible',
        order: deliveredUnreviewedOrder,
        message: 'Verified Campus Delivery Confirmed: Your order was received. You may now submit your peer review.',
      };
    }

    // 3. Check if order exists but is still in transit (Placed, Confirmed, Out for Delivery)
    const inTransitOrder = matchingOrders.find(
      o => o.status !== 'Delivered' && o.status !== 'Cancelled'
    );

    if (inTransitOrder) {
      return {
        canReview: false,
        reason: 'order_pending_delivery',
        order: inTransitOrder,
        message: `Review Locked: Your order status is "${inTransitOrder.status}". Reviews are strictly locked until you or the seller confirms campus delivery.`,
      };
    }

    // 4. Otherwise, user already reviewed
    const alreadyReviewedOrder = matchingOrders.find(o => o.hasReviewed);
    return {
      canReview: false,
      reason: 'already_reviewed',
      order: alreadyReviewedOrder,
      message: 'You have already submitted a verified review for this purchase.',
    };
  }

  public getReviewsForProduct(productId: string): Review[] {
    return this.reviews.filter(r => r.productId === productId);
  }

  public submitVerifiedReview(params: {
    userId: string;
    productId: string;
    rating: number;
    headline: string;
    comment: string;
    conditionAsDescribed: boolean;
  }): { success: boolean; review?: Review; error?: string } {
    const eligibility = this.verifyReviewEligibility(params.userId, params.productId);

    if (!eligibility.canReview || !eligibility.order) {
      return {
        success: false,
        error: eligibility.message,
      };
    }

    const buyer = this.users.find(u => u.id === params.userId);
    if (!buyer) {
      return { success: false, error: 'User not found' };
    }

    const newReview: Review = {
      id: `rev_${Date.now()}`,
      productId: params.productId,
      orderId: eligibility.order.id,
      buyerId: buyer.id,
      buyerName: buyer.name,
      buyerRoll: buyer.rollNumber,
      buyerHostel: buyer.hostel,
      rating: Math.max(1, Math.min(5, Math.round(params.rating))),
      headline: params.headline.trim(),
      comment: params.comment.trim(),
      conditionAsDescribed: params.conditionAsDescribed,
      createdAt: new Date().toISOString(),
      isVerifiedDelivery: true,
    };

    // Mark order as reviewed
    eligibility.order.hasReviewed = true;
    this.persistOrders();

    // Add review
    this.reviews.unshift(newReview);
    this.persistReviews();

    // Recalculate product rating
    const prodReviews = this.reviews.filter(r => r.productId === params.productId);
    const prod = this.products.find(p => p.id === params.productId);
    if (prod) {
      const totalStars = prodReviews.reduce((sum, r) => sum + r.rating, 0);
      prod.rating = Number((totalStars / prodReviews.length).toFixed(1));
      prod.reviewCount = prodReviews.length;
      this.persistProducts();
    }

    return { success: true, review: newReview };
  }

  public resetToDefaults() {
    this.users = [...DEMO_USERS];
    this.products = [];
    this.orders = [];
    this.reviews = [];
    this.currentUserId = null;
    this.activeView = 'buyer';

    this.persistUsers();
    this.persistProducts();
    this.persistOrders();
    this.persistReviews();
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_VIEW, 'buyer');
  }

  public loadSampleCatalog() {
    this.products = [...INITIAL_PRODUCTS];
    this.orders = [...INITIAL_ORDERS];
    this.reviews = [...INITIAL_REVIEWS];
    this.persistProducts();
    this.persistOrders();
    this.persistReviews();
  }
}

export const storage = new StorageService();
