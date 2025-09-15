import Stripe from 'stripe';
import { createError } from './errors';
import { SecureLogger } from './secure-logger';
import { StripeErrorHandler, StripeErrorType } from './stripe-error-handler';

// Validation de la configuration Stripe au démarrage
StripeErrorHandler.validateStripeConfig();

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  maxNetworkRetries: 3,
  timeout: 30000,
  telemetry: false, // Désactiver la télémétrie pour la confidentialité
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
  return StripeErrorHandler.executeWithRetry(
    async () => {
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

      SecureLogger.info('Stripe account created successfully', {
        accountId: account.id,
        type: account.type,
        country: account.country
      });

      return account.id;
    },
    'createStripeAccount',
    {
      maxRetries: 2,
      retryDelay: 1000,
      logLevel: 'error'
    },
    {
      accountType: data.type,
      country: data.country,
      email: data.email.substring(0, 3) + '***@' + data.email.split('@')[1]
    }
  );
};

export const createAccountLink = async (accountId: string, refreshUrl: string, returnUrl: string): Promise<string> => {
  return StripeErrorHandler.executeWithRetry(
    async () => {
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
      });

      SecureLogger.info('Stripe account link created successfully', {
        accountId: accountId.substring(0, 8) + '...',
        linkType: 'account_onboarding'
      });

      return accountLink.url;
    },
    'createAccountLink',
    {
      maxRetries: 2,
      retryDelay: 1000,
      logLevel: 'error'
    },
    {
      accountId: accountId.substring(0, 8) + '...',
      refreshUrl,
      returnUrl
    }
  );
};

export const createPaymentIntent = async (amount: number, currency: string = 'eur', metadata?: any): Promise<Stripe.PaymentIntent> => {
  return StripeErrorHandler.executeWithRetry(
    async () => {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe utilise les centimes
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      SecureLogger.info('Stripe payment intent created successfully', {
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      });

      return paymentIntent;
    },
    'createPaymentIntent',
    {
      maxRetries: 3,
      retryDelay: 1000,
      logLevel: 'error'
    },
    {
      amount,
      currency,
      metadata: metadata ? Object.keys(metadata) : undefined
    }
  );
};

export const createTransfer = async (
  amount: number,
  currency: string,
  destination: string,
  metadata?: any
): Promise<Stripe.Transfer> => {
  return StripeErrorHandler.executeWithRetry(
    async () => {
      const transfer = await stripe.transfers.create({
        amount: Math.round(amount * 100),
        currency,
        destination,
        metadata,
      });

      SecureLogger.info('Stripe transfer created successfully', {
        transferId: transfer.id,
        amount: transfer.amount,
        currency: transfer.currency,
        destination: transfer.destination
      });

      return transfer;
    },
    'createTransfer',
    {
      maxRetries: 3,
      retryDelay: 1000,
      logLevel: 'error'
    },
    {
      amount,
      currency,
      destination: destination.substring(0, 8) + '...',
      metadata: metadata ? Object.keys(metadata) : undefined
    }
  );
};

export const getAccountBalance = async (accountId: string): Promise<Stripe.Balance> => {
  return StripeErrorHandler.executeWithRetry(
    async () => {
      const balance = await stripe.balance.retrieve({
        stripeAccount: accountId,
      });

      SecureLogger.info('Stripe balance retrieved successfully', {
        accountId: accountId.substring(0, 8) + '...',
        available: balance.available.length,
        pending: balance.pending.length
      });

      return balance;
    },
    'getAccountBalance',
    {
      maxRetries: 2,
      retryDelay: 1000,
      logLevel: 'error'
    },
    {
      accountId: accountId.substring(0, 8) + '...'
    }
  );
};

export const createRefund = async (paymentIntentId: string, amount?: number): Promise<Stripe.Refund> => {
  return StripeErrorHandler.executeWithRetry(
    async () => {
      const refundData: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100);
      }

      const refund = await stripe.refunds.create(refundData);

      SecureLogger.info('Stripe refund created successfully', {
        refundId: refund.id,
        paymentIntentId: paymentIntentId.substring(0, 8) + '...',
        amount: refund.amount,
        status: refund.status
      });

      return refund;
    },
    'createRefund',
    {
      maxRetries: 2,
      retryDelay: 1000,
      logLevel: 'error'
    },
    {
      paymentIntentId: paymentIntentId.substring(0, 8) + '...',
      amount
    }
  );
};

export const verifyWebhookSignature = (payload: string, signature: string, secret: string): Stripe.Event => {
  try {
    const event = stripe.webhooks.constructEvent(payload, signature, secret);
    
    SecureLogger.info('Stripe webhook signature verified successfully', {
      eventId: event.id,
      eventType: event.type,
      signaturePrefix: signature.substring(0, 20) + '...'
    });
    
    return event;
  } catch (error) {
    const errorInfo = StripeErrorHandler.analyzeError(error, 'verifyWebhookSignature', {
      signaturePrefix: signature.substring(0, 20) + '...',
      payloadLength: payload.length
    });
    
    StripeErrorHandler.logError(errorInfo, { logLevel: 'error' });
    throw createError.unauthorized('Invalid webhook signature');
  }
};
