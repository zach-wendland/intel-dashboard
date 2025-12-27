import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

export const isStripeConfigured = Boolean(stripePublishableKey && !stripePublishableKey.includes('your-key'));

let stripePromise: ReturnType<typeof loadStripe> | null = null;

export function getStripe() {
  if (!isStripeConfigured) {
    return null;
  }
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
}

// Premium pricing configuration
export const PREMIUM_PRICE = {
  monthly: {
    amount: 9.99,
    priceId: import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID || 'price_monthly',
    label: '$9.99/month'
  },
  yearly: {
    amount: 79.99,
    priceId: import.meta.env.VITE_STRIPE_YEARLY_PRICE_ID || 'price_yearly',
    label: '$79.99/year',
    savings: '33%'
  }
};

// Redirect to Stripe Checkout
export async function redirectToCheckout(priceId: string, customerEmail?: string) {
  const stripe = await getStripe();
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  // For a full implementation, you would call your backend to create a checkout session
  // and get the session ID. For now, we'll use Stripe Payment Links or handle this
  // server-side when you set up Vercel Edge Functions.

  // This is a placeholder - in production, you'd create a checkout session server-side
  console.log('Would redirect to checkout for price:', priceId, 'email:', customerEmail);

  // You can use a Stripe Payment Link here as a simple solution:
  // window.location.href = 'https://buy.stripe.com/your-payment-link';

  throw new Error('Stripe checkout requires server-side session creation. Set up a Vercel Edge Function or use Stripe Payment Links.');
}
