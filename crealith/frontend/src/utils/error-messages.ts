/**
 * Messages d'erreur centralisés et traduits
 */
export const ERROR_MESSAGES = {
  // Erreurs d'authentification
  AUTH: {
    INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
    SESSION_EXPIRED: 'Votre session a expiré. Veuillez vous reconnecter.',
    ACCESS_DENIED: 'Accès refusé. Vous n\'avez pas les permissions nécessaires.',
    ACCOUNT_LOCKED: 'Votre compte est temporairement verrouillé',
    EMAIL_NOT_VERIFIED: 'Veuillez vérifier votre email avant de continuer',
  },

  // Erreurs de validation
  VALIDATION: {
    REQUIRED_FIELD: 'Ce champ est obligatoire',
    INVALID_EMAIL: 'Format d\'email invalide',
    PASSWORD_TOO_SHORT: 'Le mot de passe doit contenir au moins 8 caractères',
    PASSWORD_MISMATCH: 'Les mots de passe ne correspondent pas',
    INVALID_PHONE: 'Numéro de téléphone invalide',
    INVALID_URL: 'URL invalide',
  },

  // Erreurs de réseau
  NETWORK: {
    CONNECTION_ERROR: 'Erreur de connexion. Vérifiez votre connexion internet.',
    TIMEOUT: 'La requête a expiré. Veuillez réessayer.',
    SERVER_ERROR: 'Erreur du serveur. Veuillez réessayer plus tard.',
    RATE_LIMIT: 'Trop de requêtes. Veuillez attendre un moment.',
    MAINTENANCE: 'Le service est en maintenance. Veuillez réessayer plus tard.',
  },

  // Erreurs de fichiers
  FILE: {
    TOO_LARGE: 'Le fichier est trop volumineux',
    INVALID_TYPE: 'Type de fichier non autorisé',
    UPLOAD_FAILED: 'Échec du téléchargement du fichier',
    CORRUPTED: 'Le fichier semble corrompu',
  },

  // Erreurs de paiement
  PAYMENT: {
    FAILED: 'Le paiement a échoué',
    CARD_DECLINED: 'Carte refusée',
    INSUFFICIENT_FUNDS: 'Fonds insuffisants',
    EXPIRED_CARD: 'Carte expirée',
    INVALID_CARD: 'Informations de carte invalides',
  },

  // Erreurs génériques
  GENERIC: {
    UNKNOWN_ERROR: 'Une erreur inattendue s\'est produite',
    TRY_AGAIN: 'Veuillez réessayer',
    CONTACT_SUPPORT: 'Veuillez contacter le support technique',
    NOT_FOUND: 'Ressource non trouvée',
    ALREADY_EXISTS: 'Cette ressource existe déjà',
  },
} as const;

/**
 * Fonction pour obtenir un message d'erreur basé sur le code d'erreur
 */
export const getErrorMessage = (error: any): string => {
  // Si c'est déjà un message d'erreur formaté
  if (typeof error === 'string') {
    return error;
  }

  // Si c'est une erreur avec un code
  if (error?.code) {
    const codeMap: Record<string, string> = {
      'AUTH_INVALID_CREDENTIALS': ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS,
      'AUTH_SESSION_EXPIRED': ERROR_MESSAGES.AUTH.SESSION_EXPIRED,
      'AUTH_ACCESS_DENIED': ERROR_MESSAGES.AUTH.ACCESS_DENIED,
      'VALIDATION_REQUIRED': ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD,
      'VALIDATION_INVALID_EMAIL': ERROR_MESSAGES.VALIDATION.INVALID_EMAIL,
      'NETWORK_CONNECTION_ERROR': ERROR_MESSAGES.NETWORK.CONNECTION_ERROR,
      'NETWORK_TIMEOUT': ERROR_MESSAGES.NETWORK.TIMEOUT,
      'NETWORK_SERVER_ERROR': ERROR_MESSAGES.NETWORK.SERVER_ERROR,
      'FILE_TOO_LARGE': ERROR_MESSAGES.FILE.TOO_LARGE,
      'FILE_INVALID_TYPE': ERROR_MESSAGES.FILE.INVALID_TYPE,
      'PAYMENT_FAILED': ERROR_MESSAGES.PAYMENT.FAILED,
      'PAYMENT_CARD_DECLINED': ERROR_MESSAGES.PAYMENT.CARD_DECLINED,
    };

    return codeMap[error.code] || error.message || ERROR_MESSAGES.GENERIC.UNKNOWN_ERROR;
  }

  // Si c'est une erreur avec un message
  if (error?.message) {
    return error.message;
  }

  // Si c'est une erreur HTTP
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  // Si c'est une erreur de statut HTTP
  if (error?.response?.status) {
    const statusMap: Record<number, string> = {
      400: 'Requête invalide',
      401: ERROR_MESSAGES.AUTH.SESSION_EXPIRED,
      403: ERROR_MESSAGES.AUTH.ACCESS_DENIED,
      404: ERROR_MESSAGES.GENERIC.NOT_FOUND,
      409: ERROR_MESSAGES.GENERIC.ALREADY_EXISTS,
      422: 'Données invalides',
      429: ERROR_MESSAGES.NETWORK.RATE_LIMIT,
      500: ERROR_MESSAGES.NETWORK.SERVER_ERROR,
      502: 'Service temporairement indisponible',
      503: ERROR_MESSAGES.NETWORK.MAINTENANCE,
      504: ERROR_MESSAGES.NETWORK.TIMEOUT,
    };

    return statusMap[error.response.status] || ERROR_MESSAGES.GENERIC.UNKNOWN_ERROR;
  }

  // Message par défaut
  return ERROR_MESSAGES.GENERIC.UNKNOWN_ERROR;
};

/**
 * Fonction pour formater les erreurs de validation
 */
export const formatValidationErrors = (errors: any[]): string[] => {
  return errors.map(error => {
    if (typeof error === 'string') {
      return error;
    }
    return error.message || ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD;
  });
};

/**
 * Fonction pour déterminer si une erreur est récupérable
 */
export const isRecoverableError = (error: any): boolean => {
  const status = error?.response?.status;
  
  // Erreurs récupérables
  const recoverableStatuses = [408, 429, 500, 502, 503, 504];
  
  return recoverableStatuses.includes(status) || 
         error?.code === 'NETWORK_CONNECTION_ERROR' ||
         error?.code === 'NETWORK_TIMEOUT';
};

/**
 * Fonction pour obtenir le délai de retry recommandé
 */
export const getRetryDelay = (error: any, attempt: number): number => {
  const baseDelay = 1000; // 1 seconde
  const maxDelay = 30000; // 30 secondes
  
  // Délai exponentiel avec jitter
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  const jitter = Math.random() * 0.1 * delay; // 10% de jitter
  
  return delay + jitter;
};
