/// <reference types="vite/client" />

declare global {
  interface Window {
    Razorpay: new (options: {
      key: string;
      amount: number;
      currency: string;
      name: string;
      description: string;
      order_id: string;
      prefill?: { email?: string; name?: string };
      theme?: { color?: string };
      modal?: { ondismiss?: () => void };
      handler: (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => void;
    }) => { open: () => void };
  }
}

export {};
