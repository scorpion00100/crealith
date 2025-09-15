import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Crealith API',
    version: '1.0.0',
    description: 'API pour la marketplace digitale Crealith',
    contact: {
      name: 'Crealith Team',
      email: 'contact@crealith.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000/api',
      description: 'Serveur de développement',
    },
    {
      url: 'https://api.crealith.com/api',
      description: 'Serveur de production',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Identifiant unique de l\'utilisateur',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Adresse email de l\'utilisateur',
          },
          firstName: {
            type: 'string',
            description: 'Prénom de l\'utilisateur',
          },
          lastName: {
            type: 'string',
            description: 'Nom de famille de l\'utilisateur',
          },
          role: {
            type: 'string',
            enum: ['BUYER', 'SELLER', 'ADMIN'],
            description: 'Rôle de l\'utilisateur',
          },
          avatar: {
            type: 'string',
            format: 'uri',
            description: 'URL de l\'avatar de l\'utilisateur',
          },
          bio: {
            type: 'string',
            description: 'Biographie de l\'utilisateur',
          },
          isActive: {
            type: 'boolean',
            description: 'Statut actif de l\'utilisateur',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Date de création du compte',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Date de dernière mise à jour',
          },
        },
        required: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive'],
      },
      Product: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Identifiant unique du produit',
          },
          title: {
            type: 'string',
            description: 'Titre du produit',
          },
          description: {
            type: 'string',
            description: 'Description détaillée du produit',
          },
          shortDescription: {
            type: 'string',
            description: 'Description courte du produit',
          },
          price: {
            type: 'number',
            format: 'decimal',
            description: 'Prix du produit',
          },
          originalPrice: {
            type: 'number',
            format: 'decimal',
            description: 'Prix original du produit (pour les promotions)',
          },
          fileUrl: {
            type: 'string',
            format: 'uri',
            description: 'URL du fichier du produit',
          },
          thumbnailUrl: {
            type: 'string',
            format: 'uri',
            description: 'URL de la miniature du produit',
          },
          fileSize: {
            type: 'integer',
            description: 'Taille du fichier en octets',
          },
          fileType: {
            type: 'string',
            description: 'Type MIME du fichier',
          },
          downloadsCount: {
            type: 'integer',
            description: 'Nombre de téléchargements',
          },
          tags: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'Tags associés au produit',
          },
          isActive: {
            type: 'boolean',
            description: 'Statut actif du produit',
          },
          isFeatured: {
            type: 'boolean',
            description: 'Produit mis en avant',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Date de création du produit',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Date de dernière mise à jour',
          },
        },
        required: ['id', 'title', 'description', 'price', 'fileUrl', 'thumbnailUrl'],
      },
      Order: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Identifiant unique de la commande',
          },
          orderNumber: {
            type: 'string',
            description: 'Numéro de commande',
          },
          totalAmount: {
            type: 'number',
            format: 'decimal',
            description: 'Montant total de la commande',
          },
          status: {
            type: 'string',
            enum: ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'],
            description: 'Statut de la commande',
          },
          stripePaymentId: {
            type: 'string',
            description: 'Identifiant du paiement Stripe',
          },
          paymentMethod: {
            type: 'string',
            description: 'Méthode de paiement utilisée',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Date de création de la commande',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Date de dernière mise à jour',
          },
        },
        required: ['id', 'orderNumber', 'totalAmount', 'status'],
      },
      Review: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Identifiant unique de l\'avis',
          },
          rating: {
            type: 'integer',
            minimum: 1,
            maximum: 5,
            description: 'Note de l\'avis (1-5)',
          },
          comment: {
            type: 'string',
            description: 'Commentaire de l\'avis',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Date de création de l\'avis',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Date de dernière mise à jour',
          },
        },
        required: ['id', 'rating'],
      },
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Indique si la requête a réussi',
          },
          message: {
            type: 'string',
            description: 'Message d\'erreur',
          },
          stack: {
            type: 'string',
            description: 'Stack trace de l\'erreur (uniquement en développement)',
          },
        },
        required: ['success', 'message'],
      },
      Success: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Indique si la requête a réussi',
          },
          message: {
            type: 'string',
            description: 'Message de succès',
          },
          data: {
            type: 'object',
            description: 'Données retournées',
          },
        },
        required: ['success'],
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'Endpoints d\'authentification et de gestion des utilisateurs',
    },
    {
      name: 'Products',
      description: 'Gestion des produits',
    },
    {
      name: 'Orders',
      description: 'Gestion des commandes',
    },
    {
      name: 'Reviews',
      description: 'Gestion des avis',
    },
    {
      name: 'Categories',
      description: 'Gestion des catégories',
    },
    {
      name: 'Health',
      description: 'Endpoints de santé et de monitoring',
    },
  ],
};

export default swaggerDefinition;
