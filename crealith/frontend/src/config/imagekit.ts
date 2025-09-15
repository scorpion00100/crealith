// Configuration ImageKit pour le frontend
export const IMAGEKIT_CONFIG = {
  // Ces valeurs doivent être configurées dans votre .env frontend
  urlEndpoint: import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/your_endpoint',
  publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || 'your_imagekit_public_key',
  // Le private key ne doit JAMAIS être exposé côté frontend
  // Il sera utilisé côté backend pour générer les tokens d'authentification
};

// Types pour ImageKit
export interface ImageKitUploadResponse {
  fileId: string;
  name: string;
  size: number;
  filePath: string;
  url: string;
  thumbnailUrl: string;
  height: number;
  width: number;
  fileType: string;
  tags?: string[];
  customMetadata?: Record<string, any>;
}

export interface ImageKitUploadOptions {
  fileName?: string;
  folder?: string;
  tags?: string[];
  customMetadata?: Record<string, any>;
  useUniqueFileName?: boolean;
  responseFields?: string[];
  isPrivateFile?: boolean;
  customCoordinates?: string;
  extensions?: Array<{
    name: string;
    options: Record<string, any>;
  }>;
}

// Transformations d'images courantes
export const IMAGE_TRANSFORMATIONS = {
  thumbnail: {
    height: 200,
    width: 200,
    cropMode: 'maintain_ratio',
  },
  medium: {
    height: 400,
    width: 400,
    cropMode: 'maintain_ratio',
  },
  large: {
    height: 800,
    width: 800,
    cropMode: 'maintain_ratio',
  },
  product: {
    height: 600,
    width: 600,
    cropMode: 'maintain_ratio',
    quality: 80,
  },
  avatar: {
    height: 150,
    width: 150,
    cropMode: 'maintain_ratio',
    radius: 'max',
  },
} as const;

// Fonction utilitaire pour construire les URLs d'images avec transformations
export const buildImageUrl = (
  imagePath: string,
  transformations?: Record<string, any>
): string => {
  if (!imagePath) return '';
  
  const baseUrl = IMAGEKIT_CONFIG.urlEndpoint;
  let url = `${baseUrl}/${imagePath}`;
  
  if (transformations) {
    const params = new URLSearchParams();
    Object.entries(transformations).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
  }
  
  return url;
};
