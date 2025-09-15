// Configuration des variables d'environnement
export const config = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51234567890abcdef',
  IMAGEKIT_URL_ENDPOINT: import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/test',
  IMAGEKIT_PUBLIC_KEY: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || 'public_test_key',
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
  NODE_ENV: import.meta.env.VITE_NODE_ENV || 'development',
};
