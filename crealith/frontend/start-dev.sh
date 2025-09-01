#!/bin/bash

echo "🎨 Démarrage de Crealith - Application Modernisée"
echo "=================================================="

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier si npm est installé
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

echo "✅ Node.js et npm détectés"

# Vérifier si les dépendances sont installées
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Erreur lors de l'installation des dépendances"
        exit 1
    fi
    echo "✅ Dépendances installées avec succès"
else
    echo "✅ Dépendances déjà installées"
fi

# Vérifier la configuration Tailwind
if [ ! -f "tailwind.config.js" ]; then
    echo "❌ Configuration Tailwind manquante"
    exit 1
fi

# Vérifier la configuration PostCSS
if [ ! -f "postcss.config.js" ]; then
    echo "❌ Configuration PostCSS manquante"
    exit 1
fi

echo "✅ Configuration vérifiée"

echo ""
echo "🚀 Lancement du serveur de développement..."
echo "📍 L'application sera disponible sur: http://localhost:3000"
echo "🎨 Page de test du design: http://localhost:3000/test"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter le serveur"
echo ""

# Lancer le serveur de développement
npm run dev
