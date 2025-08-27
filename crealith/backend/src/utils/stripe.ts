import Stripe from 'stripe';
import { createError } from './errors';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export interface StripeAccountData {
  email: string;
  country: string;
  type: 'express' | 'standard';
  business_type?: 'individual' | 'company';
  company?: {
    name: string;
  };
  individual?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export const createStripeAccount = async (data: StripeAccountData): Promise<string> => {
  try {
    const account = await stripe.accounts.create({
      type: data.type,
      country: data.country,
      email: data.email,
      business_type: data.business_type,
      company: data.company,
      individual: data.individual,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    return account.id;
  } catch (error) {
    console.error('Stripe account creation error:', error);
    throw createError.internal('Failed to create Stripe account');
  }
};

export const createAccountLink = async (accountId: string, refreshUrl: string, returnUrl: string): Promise<string> => {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return accountLink.url;
  } catch (error) {
    console.error('Stripe account link creation error:', error);
    throw createError.internal('Failed to create account link');
  }
};

export const createPaymentIntent = async (amount: number, currency: string = 'eur', metadata?: any): Promise<Stripe.PaymentIntent> => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe utilise les centimes
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent;
  } catch (error) {
    console.error('Stripe payment intent creation error:', error);
    throw createError.internal('Failed to create payment intent');
  }
};

export const createTransfer = async (
  amount: number,
  currency: string,
  destination: string,
  metadata?: any
): Promise<Stripe.Transfer> => {
  try {
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100),
      currency,
      destination,
      metadata,
    });

    return transfer;
  } catch (error) {
    console.error('Stripe transfer creation error:', error);
    throw createError.internal('Failed to create transfer');
  }
};

export const getAccountBalance = async (accountId: string): Promise<Stripe.Balance> => {
  try {
    const balance = await stripe.balance.retrieve({
      stripeAccount: accountId,
    });

    return balance;
  } catch (error) {
    console.error('Stripe balance retrieval error:', error);
    throw createError.internal('Failed to retrieve account balance');
  }
};

export const createRefund = async (paymentIntentId: string, amount?: number): Promise<Stripe.Refund> => {
  try {
    const refundData: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
    };

    if (amount) {
      refundData.amount = Math.round(amount * 100);
    }

    const refund = await stripe.refunds.create(refundData);

    return refund;
  } catch (error) {
    console.error('Stripe refund creation error:', error);
    throw createError.internal('Failed to create refund');
  }
};

export const verifyWebhookSignature = (payload: string, signature: string, secret: string): Stripe.Event => {
  try {
    return stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw createError.unauthorized('Invalid webhook signature');
  }
};
