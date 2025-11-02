// Payment Service for handling online payments (Stripe & PayOS)

export interface PaymentConfig {
  method: 'stripe' | 'payos';
  amount: number;
  currency: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  error?: string;
  paymentMethod?: string;
}

export interface StripeConfig {
  publishableKey: string;
}

export interface PayOSConfig {
  clientId: string;
  apiKey: string;
}

export class PaymentService {
  private static stripeInstance: any = null;
  private static isStripeLoaded = false;
  private static isPayOSLoaded = false;

  // Initialize Stripe
  static async initializeStripe(): Promise<boolean> {
    try {
      const publishableKey = (import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY;
      
      if (!publishableKey) {
        console.error('Stripe publishable key not found');
        return false;
      }

      // Load Stripe script if not already loaded
      if (!this.isStripeLoaded) {
        await this.loadStripeScript();
        this.isStripeLoaded = true;
      }

      // Initialize Stripe instance
      if ((window as any).Stripe) {
        this.stripeInstance = (window as any).Stripe(publishableKey);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error initializing Stripe:', error);
      return false;
    }
  }

  // Load Stripe script
  private static loadStripeScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).Stripe) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Stripe script'));
      document.head.appendChild(script);
    });
  }

  // Initialize PayOS
  static async initializePayOS(): Promise<boolean> {
    try {
      const clientId = (import.meta as any).env?.VITE_PAYOS_CLIENT_ID;
      
      if (!clientId) {
        console.error('PayOS client ID not found');
        return false;
      }

      // Load PayOS script if not already loaded
      if (!this.isPayOSLoaded) {
        await this.loadPayOSScript();
        this.isPayOSLoaded = true;
      }

      return true;
    } catch (error) {
      console.error('Error initializing PayOS:', error);
      return false;
    }
  }

  // Load PayOS script
  private static loadPayOSScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).PayOS) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.payos.vn/payos-checkout/v1/payos-checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load PayOS script'));
      document.head.appendChild(script);
    });
  }

  // Process Stripe payment
  static async processStripePayment(config: PaymentConfig): Promise<PaymentResult> {
    try {
      if (!this.stripeInstance) {
        const initialized = await this.initializeStripe();
        if (!initialized) {
          return { success: false, error: 'Failed to initialize Stripe' };
        }
      }

      // Create payment intent on backend
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: config.amount * 100, // Convert to cents
          currency: config.currency,
          description: config.description,
          metadata: config.metadata
        }),
      });

      const { clientSecret } = await response.json();

      // Confirm payment
      const result = await this.stripeInstance.confirmCardPayment(clientSecret, {
        payment_method: {
          card: {
            // This would typically be a Stripe Elements card element
            // For demo purposes, we'll simulate success
          }
        }
      });

      if (result.error) {
        return {
          success: false,
          error: result.error.message
        };
      }

      return {
        success: true,
        paymentId: result.paymentIntent.id,
        paymentMethod: 'stripe'
      };
    } catch (error) {
      console.error('Stripe payment error:', error);
      return {
        success: false,
        error: 'Payment processing failed'
      };
    }
  }

  // Process PayOS payment
  static async processPayOSPayment(config: PaymentConfig): Promise<PaymentResult> {
    try {
      if (!this.isPayOSLoaded) {
        const initialized = await this.initializePayOS();
        if (!initialized) {
          return { success: false, error: 'Failed to initialize PayOS' };
        }
      }

      // Create PayOS payment
      const paymentData = {
        orderCode: Date.now(),
        amount: config.amount,
        description: config.description,
        returnUrl: window.location.origin + '/payment/success',
        cancelUrl: window.location.origin + '/payment/cancel',
        metadata: config.metadata
      };

      // This would typically call PayOS API
      // For demo purposes, we'll simulate the payment process
      const response = await fetch('/api/payos/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();

      if (result.success) {
        // Redirect to PayOS payment page
        window.location.href = result.checkoutUrl;
        
        return {
          success: true,
          paymentId: result.orderCode.toString(),
          paymentMethod: 'payos'
        };
      }

      return {
        success: false,
        error: result.error || 'PayOS payment failed'
      };
    } catch (error) {
      console.error('PayOS payment error:', error);
      return {
        success: false,
        error: 'Payment processing failed'
      };
    }
  }

  // Process payment (main method)
  static async processPayment(config: PaymentConfig): Promise<PaymentResult> {
    switch (config.method) {
      case 'stripe':
        return this.processStripePayment(config);
      case 'payos':
        return this.processPayOSPayment(config);
      default:
        return {
          success: false,
          error: 'Unsupported payment method'
        };
    }
  }

  // Create payment session for reservation
  static async createPaymentSession(
    reservationId: string,
    amount: number,
    method: 'stripe' | 'payos' = 'stripe'
  ): Promise<PaymentResult> {
    const config: PaymentConfig = {
      method,
      amount,
      currency: 'USD',
      description: `EV Charging Station Reservation - ${reservationId}`,
      metadata: {
        reservationId,
        type: 'reservation'
      }
    };

    return this.processPayment(config);
  }

  // Verify payment status
  static async verifyPayment(paymentId: string, method: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          method
        }),
      });

      const result = await response.json();
      return result.success && result.status === 'paid';
    } catch (error) {
      console.error('Error verifying payment:', error);
      return false;
    }
  }

  // Get supported payment methods
  static getSupportedMethods(): string[] {
    const methods: string[] = [];
    
    if ((import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY) {
      methods.push('stripe');
    }
    
    if ((import.meta as any).env?.VITE_PAYOS_CLIENT_ID) {
      methods.push('payos');
    }

    return methods;
  }

  // Format currency
  static formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  // Calculate total cost
  static calculateTotalCost(pricePerKwh: number, estimatedKwh: number, taxRate: number = 0.0825): number {
    const subtotal = pricePerKwh * estimatedKwh;
    const tax = subtotal * taxRate;
    return subtotal + tax;
  }

  // Get payment fee
  static getPaymentFee(amount: number, method: string): number {
    switch (method) {
      case 'stripe':
        return Math.max(0.30, amount * 0.029); // 2.9% + 30¢
      case 'payos':
        return amount * 0.025; // 2.5%
      default:
        return 0;
    }
  }

  // Handle payment success callback
  static handlePaymentSuccess(paymentId: string, reservationId: string): void {
    // Dispatch custom event for payment success
    const event = new CustomEvent('paymentSuccess', {
      detail: { paymentId, reservationId }
    });
    window.dispatchEvent(event);
  }

  // Handle payment failure callback
  static handlePaymentFailure(error: string, reservationId: string): void {
    // Dispatch custom event for payment failure
    const event = new CustomEvent('paymentFailure', {
      detail: { error, reservationId }
    });
    window.dispatchEvent(event);
  }
}