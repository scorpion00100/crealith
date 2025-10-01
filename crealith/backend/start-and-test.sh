#!/bin/bash

echo "🚀 Démarrage et test du système d'authentification"
echo "=================================================="

# Fonction pour vérifier si un port est utilisé
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $port déjà utilisé"
        return 1
    else
        echo "✅ Port $port disponible"
        return 0
    fi
}

# Fonction pour attendre qu'un service soit prêt
wait_for_service() {
    local url=$1
    local max_attempts=30
    local attempt=0
    
    echo "⏳ Attente du service $url..."
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo "✅ Service $url prêt"
            return 0
        fi
        
        attempt=$((attempt + 1))
        echo "   Tentative $attempt/$max_attempts..."
        sleep 2
    done
    
    echo "❌ Service $url non disponible après $max_attempts tentatives"
    return 1
}

# Vérifier les ports
echo "🔍 Vérification des ports..."
check_port 5000 || {
    echo "🔄 Arrêt des processus sur le port 5000..."
    pkill -f "tsx.*server.ts" || true
    pkill -f "node.*server" || true
    sleep 2
}

check_port 6379 || {
    echo "⚠️  Redis sur le port 6379 - vérifiez qu'il fonctionne"
}

# Démarrer Redis si nécessaire
echo "🔧 Vérification de Redis..."
if ! pgrep redis-server > /dev/null; then
    echo "⚠️  Redis non démarré - démarrage..."
    redis-server --daemonize yes --port 6379 || {
        echo "❌ Impossible de démarrer Redis"
        echo "   Veuillez démarrer Redis manuellement : redis-server"
        exit 1
    }
fi

# Attendre que Redis soit prêt
wait_for_service "http://localhost:6379" || {
    echo "⚠️  Redis non accessible, mais on continue..."
}

# Démarrer le serveur backend
echo "🚀 Démarrage du serveur backend..."
npm run dev &
SERVER_PID=$!

# Attendre que le serveur soit prêt
wait_for_service "http://localhost:5000/api/health" || {
    echo "❌ Serveur backend non accessible"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
}

echo "✅ Serveur backend démarré (PID: $SERVER_PID)"

# Attendre un peu pour que le serveur soit complètement prêt
sleep 3

# Exécuter les tests
echo "🧪 Exécution des tests d'authentification..."
node test-auth-system.js

# Garder le serveur en vie
echo "🔄 Serveur en cours d'exécution..."
echo "   Pour arrêter : kill $SERVER_PID"
echo "   Pour tester à nouveau : node test-auth-system.js"

# Attendre l'interruption
trap "echo '🛑 Arrêt du serveur...'; kill $SERVER_PID 2>/dev/null || true; exit 0" INT TERM

wait $SERVER_PID