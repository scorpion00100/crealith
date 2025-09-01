import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { createError } from '../utils/errors';

const prisma = new PrismaClient();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
});

export interface PaymentIntentData {
  amount: number;
  currency: string;
  orderId: string;
  customerEmail: string;
  metadata: Record<string, string>;
}

export interface StripeAccountData {
  email: string;
  country: string;
  businessType: 'individual' | 'company';
  individual?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address: {
      line1: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };
  company?: {
    name: string;
    taxId?: string;
  };
}

export class StripeService {
  // Créer un PaymentIntent pour une commande
  static async createPaymentIntent(data: PaymentIntentData): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: data.amount,
        currency: data.currency,
        metadata: {
          orderId: data.orderId,
          customerEmail: data.customerEmail,
          ...data.metadata
        },
        automatic_payment_methods: {
          enabled: true,
        },
        receipt_email: data.customerEmail,
      });

      return paymentIntent;
    } catch (error) {
      throw createError.badRequest('Erreur lors de la création du paiement');
    }
  }

  // Créer un compte Stripe Connect pour un vendeur
  static async createConnectAccount(data: StripeAccountData): Promise<Stripe.Account> {
    try {
      const account = await stripe.accounts.create({
        type: 'express',
        country: data.country,
        email: data.email,
        business_type: data.businessType,
        individual: data.individual,
        company: data.company,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      return account;
    } catch (error) {
      throw createError.badRequest('Erreur lors de la création du compte vendeur');
    }
  }

  // Créer un lien d'onboarding pour un vendeur
  static async createOnboardingLink(accountId: string, returnUrl: string): Promise<string> {
    try {
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: returnUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
      });

      return accountLink.url;
    } catch (error) {
      throw createError.badRequest('Erreur lors de la création du lien d\'onboarding');
    }
  }

  // Effectuer un transfert vers un vendeur
  static async transferToSeller(
    amount: number,
    currency: string,
    destinationAccountId: string,
    description: string
  ): Promise<Stripe.Transfer> {
    try {
      const transfer = await stripe.transfers.create({
        amount: amount,
        currency: currency,
        destination: destinationAccountId,
        description: description,
      });

      return transfer;
    } catch (error) {
      throw createError.badRequest('Erreur lors du transfert');
    }
  }

  // Récupérer les informations d'un compte Stripe
  static async getAccountInfo(accountId: string): Promise<Stripe.Account> {
    try {
      const account = await stripe.accounts.retrieve(accountId);
      return account;
    } catch (error) {
      throw createError.notFound('Compte Stripe non trouvé');
    }
  }

  // Créer un remboursement
  static async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
  ): Promise<Stripe.Refund> {
    try {
      const refundData: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        refundData.amount = amount;
      }

      if (reason) {
        refundData.reason = reason;
      }

      const refund = await stripe.refunds.create(refundData);
      return refund;
    } catch (error) {
      throw createError.badRequest('Erreur lors du remboursement');
    }
  }

  // Traiter les webhooks Stripe
  static async handleWebhook(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
          break;

        case 'account.updated':
          await this.handleAccountUpdate(event.data.object as Stripe.Account);
          break;

        case 'transfer.created':
          await this.handleTransferCreated(event.data.object as Stripe.Transfer);
          break;

        case 'charge.dispute.created':
          await this.handleDisputeCreated(event.data.object as Stripe.Dispute);
          break;

        default:
          console.log(`Webhook non géré: ${event.type}`);
      }
    } catch (error) {
      console.error('Erreur lors du traitement du webhook:', error);
      throw error;
    }
  }

  // Gérer le succès d'un paiement
  private static async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const orderId = paymentIntent.metadata.orderId;
    
    if (!orderId) {
      throw new Error('OrderId manquant dans les métadonnées');
    }

    // Mettre à jour le statut de la commande
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
        stripePaymentId: paymentIntent.id,
        updatedAt: new Date()
      }
    });

    // Créer une notification pour l'acheteur
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true }
    });

    if (order) {
      await prisma.notification.create({
        data: {
          userId: order.userId,
          type: 'success',
          title: 'Paiement confirmé',
          message: `Votre commande #${order.orderNumber} a été payée avec succès.`,
          actionUrl: `/orders/${orderId}`,
          actionLabel: 'Voir la commande'
        }
      });

      // Notifier le vendeur
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId: orderId },
        include: { product: { include: { user: true } } }
      });

      for (const item of orderItems) {
        await prisma.notification.create({
          data: {
            userId: item.product.userId,
            type: 'info',
            title: 'Nouvelle vente',
            message: `Votre produit "${item.product.title}" a été vendu.`,
            actionUrl: `/seller-dashboard/orders`,
            actionLabel: 'Voir les commandes'
          }
        });
      }
    }
  }

  // Gérer l'échec d'un paiement
  private static async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const orderId = paymentIntent.metadata.orderId;
    
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
          updatedAt: new Date()
        }
      });

      // Notifier l'acheteur
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { user: true }
      });

      if (order) {
        await prisma.notification.create({
          data: {
            userId: order.userId,
            type: 'error',
            title: 'Paiement échoué',
            message: `Le paiement pour votre commande #${order.orderNumber} a échoué.`,
            actionUrl: `/checkout?orderId=${orderId}`,
            actionLabel: 'Réessayer'
          }
        });
      }
    }
  }

  // Gérer la mise à jour d'un compte
  private static async handleAccountUpdate(account: Stripe.Account): Promise<void> {
    // Mettre à jour le statut du compte dans la base de données
    const user = await prisma.user.findFirst({
      where: { stripeAccountId: account.id }
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          isActive: account.charges_enabled && account.payouts_enabled
        }
      });
    }
  }

  // Gérer la création d'un transfert
  private static async handleTransferCreated(transfer: Stripe.Transfer): Promise<void> {
    // Enregistrer le transfert dans la base de données
    // Vous pouvez créer une table Transaction pour cela
    console.log('Transfert créé:', transfer.id);
  }

  // Gérer la création d'un litige
  private static async handleDisputeCreated(dispute: Stripe.Dispute): Promise<void> {
    // Notifier l'administrateur et le vendeur
    console.log('Litige créé:', dispute.id);
  }

  // Obtenir les statistiques de paiement pour un vendeur
  static async getSellerPaymentStats(accountId: string, period: 'week' | 'month' | 'year' = 'month') {
    try {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
      }

      const balance = await stripe.balance.retrieve({
        stripeAccount: accountId
      });

      const transfers = await stripe.transfers.list({
        destination: accountId,
        created: {
          gte: Math.floor(startDate.getTime() / 1000)
        },
        limit: 100
      });

      return {
        balance: balance.available[0]?.amount || 0,
        transfers: transfers.data,
        totalTransferred: transfers.data.reduce((sum, transfer) => sum + transfer.amount, 0)
      };
    } catch (error) {
      throw createError.badRequest('Erreur lors de la récupération des statistiques');
    }
  }
}
