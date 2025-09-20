// Configuration des méthodes de paiement par environnement

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'digital' | 'bank';
  available: boolean;
  comingSoon?: boolean;
  testCards?: string[];
  colors: {
    primary: string;
    secondary: string;
    border: string;
  };
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  // Cartes bancaires - Toujours disponibles
  {
    id: 'visa',
    name: 'Visa',
    type: 'card',
    available: true,
    colors: {
      primary: 'from-blue-600 to-blue-700',
      secondary: 'border-blue-500',
      border: 'text-blue-200'
    }
  },
  {
    id: 'mastercard',
    name: 'Mastercard',
    type: 'card',
    available: true,
    colors: {
      primary: 'from-red-600 to-red-700',
      secondary: 'border-red-500',
      border: 'text-red-200'
    }
  },
  {
    id: 'amex',
    name: 'American Express',
    type: 'card',
    available: true,
    colors: {
      primary: 'from-green-600 to-green-700',
      secondary: 'border-green-500',
      border: 'text-green-200'
    }
  },
  {
    id: 'diners',
    name: 'Diners Club',
    type: 'card',
    available: true,
    colors: {
      primary: 'from-purple-600 to-purple-700',
      secondary: 'border-purple-500',
      border: 'text-purple-200'
    }
  },
  {
    id: 'discover',
    name: 'Discover',
    type: 'card',
    available: true,
    colors: {
      primary: 'from-orange-600 to-orange-700',
      secondary: 'border-orange-500',
      border: 'text-orange-200'
    }
  },
  {
    id: 'jcb',
    name: 'JCB',
    type: 'card',
    available: true,
    colors: {
      primary: 'from-indigo-600 to-indigo-700',
      secondary: 'border-indigo-500',
      border: 'text-indigo-200'
    }
  },
  
  // Paiements numériques - En développement
  {
    id: 'paypal',
    name: 'PayPal',
    type: 'digital',
    available: false,
    comingSoon: true,
    colors: {
      primary: 'from-yellow-500 to-orange-500',
      secondary: 'border-yellow-400',
      border: 'text-yellow-200'
    }
  },
  {
    id: 'apple_pay',
    name: 'Apple Pay',
    type: 'digital',
    available: false,
    comingSoon: true,
    colors: {
      primary: 'from-gray-600 to-gray-700',
      secondary: 'border-gray-500',
      border: 'text-gray-300'
    }
  },
  {
    id: 'google_pay',
    name: 'Google Pay',
    type: 'digital',
    available: false,
    comingSoon: true,
    colors: {
      primary: 'from-blue-500 to-blue-600',
      secondary: 'border-blue-400',
      border: 'text-blue-200'
    }
  },
  
  // Virements bancaires - À venir
  {
    id: 'sepa',
    name: 'Virement SEPA',
    type: 'bank',
    available: false,
    comingSoon: true,
    colors: {
      primary: 'from-green-500 to-green-600',
      secondary: 'border-green-400',
      border: 'text-green-200'
    }
  }
];

// Cartes de test Stripe pour le développement
export const STRIPE_TEST_CARDS = {
  visa: {
    number: '4242 4242 4242 4242',
    name: 'Visa',
    description: 'Carte Visa de test'
  },
  visa_debit: {
    number: '4000 0566 5566 5556',
    name: 'Visa Debit',
    description: 'Carte Visa Débit de test'
  },
  mastercard: {
    number: '5555 5555 5555 4444',
    name: 'Mastercard',
    description: 'Carte Mastercard de test'
  },
  amex: {
    number: '3782 822463 10005',
    name: 'American Express',
    description: 'Carte American Express de test'
  },
  discover: {
    number: '6011 1111 1111 1117',
    name: 'Discover',
    description: 'Carte Discover de test'
  },
  diners: {
    number: '3055 9390 9390 9394',
    name: 'Diners Club',
    description: 'Carte Diners Club de test'
  },
  jcb: {
    number: '3530 1113 3330 0000',
    name: 'JCB',
    description: 'Carte JCB de test'
  },
  // Cartes qui échouent pour tester les erreurs
  declined: {
    number: '4000 0000 0000 0002',
    name: 'Carte refusée',
    description: 'Carte qui sera refusée par Stripe'
  },
  insufficient_funds: {
    number: '4000 0000 0000 9995',
    name: 'Fonds insuffisants',
    description: 'Carte avec fonds insuffisants'
  },
  expired_card: {
    number: '4000 0000 0000 0069',
    name: 'Carte expirée',
    description: 'Carte expirée'
  }
};

// Configuration par environnement
export const getPaymentMethodsConfig = () => {
  const isDevelopment = import.meta.env.VITE_NODE_ENV === 'development';
  
  return {
    isDevelopment,
    showTestCards: isDevelopment,
    availableMethods: PAYMENT_METHODS.filter(method => method.available),
    comingSoonMethods: PAYMENT_METHODS.filter(method => method.comingSoon),
    testCards: isDevelopment ? STRIPE_TEST_CARDS : null,
    stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  };
};

// Fonction utilitaire pour obtenir les méthodes par type
export const getPaymentMethodsByType = (type: 'card' | 'digital' | 'bank') => {
  return PAYMENT_METHODS.filter(method => method.type === type);
};

// Fonction pour vérifier si une méthode est disponible
export const isPaymentMethodAvailable = (methodId: string): boolean => {
  const method = PAYMENT_METHODS.find(m => m.id === methodId);
  return method?.available || false;
};
