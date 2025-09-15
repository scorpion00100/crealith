#!/bin/bash

echo "🚀 Starting Crealith Backend Server..."

# Démarrer le serveur en arrière-plan
npm run dev &
SERVER_PID=$!

echo "⏳ Waiting for server to start..."
sleep 8

echo "🧪 Testing API..."
node test-webhook.js

echo ""
echo "🧪 Testing Stripe Webhook..."
node test-stripe-webhook.js

echo ""
echo "🎯 Testing with Stripe CLI..."
stripe trigger payment_intent.succeeded

echo ""
echo "✅ Tests completed!"
echo "📊 Server PID: $SERVER_PID"
echo "🔗 API URL: http://localhost:5000/api"
echo "🔗 Webhook URL: http://localhost:5000/api/webhook/stripe"

echo ""
echo "Press Ctrl+C to stop the server"
wait $SERVER_PID
