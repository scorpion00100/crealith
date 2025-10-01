import { Router, Request, Response } from 'express';
import { StripeService } from '../services/stripe.service';
import { redisService } from '../services/redis.service';
import { SecureLogger } from '../utils/secure-logger';

const router = Router();

// Route pour recevoir les webhooks Stripe
router.post('/stripe', async (req: Request, res: Response) => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    const payload = req.body;

    // Vérifier la signature du webhook
    const event = StripeService.verifyWebhookSignature(payload, sig);

    // ✨ IDEMPOTENCE : Vérifier si l'événement a déjà été traité
    const webhookKey = `webhook:stripe:${event.id}`;
    const alreadyProcessed = await redisService.cacheExists(webhookKey);
    
    if (alreadyProcessed) {
      SecureLogger.info(`Webhook already processed: ${event.id}`, { eventType: event.type });
      return res.json({ received: true, alreadyProcessed: true });
    }

    // Logger l'événement webhook reçu
    SecureLogger.info(`Processing webhook: ${event.id}`, {
      eventType: event.type,
      eventId: event.id
    });

    // Traiter l'événement selon son type
    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('✅ Payment succeeded:', event.data.object);
        // Traiter le paiement réussi
        await StripeService.handlePaymentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        console.log('❌ Payment failed:', event.data.object);
        // Traiter l'échec du paiement
        await StripeService.handlePaymentFailed(event.data.object);
        break;

      case 'checkout.session.completed':
        console.log('🛒 Checkout session completed:', event.data.object);
        // Traiter la session de checkout complétée
        await StripeService.handleCheckoutCompleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        console.log('💰 Invoice payment succeeded:', event.data.object);
        // Traiter le paiement de facture réussi
        await StripeService.handleInvoicePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        console.log('💸 Invoice payment failed:', event.data.object);
        // Traiter l'échec du paiement de facture
        await StripeService.handleInvoicePaymentFailed(event.data.object);
        break;

      default:
        SecureLogger.warn(`Unhandled event type: ${event.type}`, { eventId: event.id });
    }

    // ✨ Marquer l'événement comme traité (TTL 7 jours pour éviter rejeu)
    await redisService.cacheSet(webhookKey, {
      eventId: event.id,
      eventType: event.type,
      processedAt: new Date().toISOString()
    }, 7 * 24 * 60 * 60);

    SecureLogger.info(`Webhook processed successfully: ${event.id}`, { eventType: event.type });
    
    res.json({ received: true });
  } catch (error: any) {
    SecureLogger.error('Webhook error', error, {
      signature: req.headers['stripe-signature'],
      errorMessage: error.message
    });
    res.status(400).json({ error: 'Webhook signature verification failed' });
  }
});

export default router;
