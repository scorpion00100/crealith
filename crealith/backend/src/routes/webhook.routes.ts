import { Router, Request, Response } from 'express';
import { StripeService } from '../services/stripe.service';

const router = Router();

// Route pour recevoir les webhooks Stripe
router.post('/stripe', async (req: Request, res: Response) => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    const payload = req.body;

    // Vérifier la signature du webhook
    const event = StripeService.verifyWebhookSignature(payload, sig);

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
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook signature verification failed' });
  }
});

export default router;
