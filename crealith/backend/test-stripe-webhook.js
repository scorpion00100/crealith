const http = require('http');

// Test du webhook Stripe
const testWebhook = () => {
  const postData = JSON.stringify({
    id: 'evt_test_webhook',
    object: 'event',
    type: 'payment_intent.succeeded',
    data: {
      object: {
        id: 'pi_test_123',
        amount: 2000,
        currency: 'eur',
        status: 'succeeded',
        metadata: {
          orderId: 'test_order_123'
        }
      }
    }
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/webhook/stripe',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'stripe-signature': 'test_signature'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Webhook Status: ${res.statusCode}`);
    console.log(`Webhook Headers: ${JSON.stringify(res.headers)}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Webhook Response:', data);
    });
  });

  req.on('error', (e) => {
    console.error(`Webhook Error: ${e.message}`);
  });

  req.write(postData);
  req.end();
};

// Test de l'API de base
const testAPI = () => {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`API Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('API Response:', data);
      console.log('\n--- Testing Webhook ---');
      testWebhook();
    });
  });

  req.on('error', (e) => {
    console.error(`API Error: ${e.message}`);
  });

  req.end();
};

console.log('Testing Crealith API and Stripe Webhook...\n');
testAPI();
