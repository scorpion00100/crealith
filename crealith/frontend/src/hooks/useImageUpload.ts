import { useState, useCallback } from 'react';
import { ImageKitUploadResponse } from '../config/imagekit';

interface UseImageUploadOptions {
  folder?: string;
  tags?: string[];
  maxFileSize?: number;
  acceptedFileTypes?: string[];
  onSuccess?: (response: ImageKitUploadResponse) => void;
  onError?: (error: any) => void;
}

interface UseImageUploadReturn {
  isUploading: boolean;
  uploadProgress: number;
  uploadedImages: ImageKitUploadResponse[];
  uploadImage: (file: File, fileName?: string) => Promise<ImageKitUploadResponse>;
  removeImage: (fileId: string) => void;
  clearImages: () => void;
  error: string | null;
}

export const useImageUpload = (options: UseImageUploadOptions = {}): UseImageUploadReturn => {
  const {
    folder = '/crealith/products',
    tags = ['product'],
    maxFileSize = 10 * 1024 * 1024, // 10MB
    acceptedFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    onSuccess,
    onError,
  } = options;

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<ImageKitUploadResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = useCallback(async (file: File, fileName?: string): Promise<ImageKitUploadResponse> => {
    // Validation du fichier
    if (file.size > maxFileSize) {
      const errorMsg = `Le fichier est trop volumineux. Taille maximale: ${maxFileSize / (1024 * 1024)}MB`;
      setError(errorMsg);
      onError?.(new Error(errorMsg));
      throw new Error(errorMsg);
    }

    if (!acceptedFileTypes.includes(file.type)) {
      const errorMsg = `Type de fichier non supporté. Types acceptés: ${acceptedFileTypes.join(', ')}`;
      setError(errorMsg);
      onError?.(new Error(errorMsg));
      throw new Error(errorMsg);
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Créer un FormData pour l'upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      formData.append('tags', tags.join(','));
      formData.append('useUniqueFileName', 'true');
      formData.append('responseFields', 'fileId,name,size,filePath,url,thumbnailUrl,height,width,fileType');
      
      if (fileName) {
        formData.append('fileName', fileName);
      }

      // Simuler le progrès d'upload (ImageKit ne fournit pas de callback de progrès natif)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Faire l'upload via votre API backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/imagekit/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result: ImageKitUploadResponse = await response.json();
      
      setUploadProgress(100);
      setUploadedImages(prev => [...prev, result]);
      onSuccess?.(result);
      
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur lors de l\'upload';
      setError(errorMsg);
      onError?.(err);
      throw err;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [folder, tags, maxFileSize, acceptedFileTypes, onSuccess, onError]);

  const removeImage = useCallback((fileId: string) => {
    setUploadedImages(prev => prev.filter(img => img.fileId !== fileId));
  }, []);

  const clearImages = useCallback(() => {
    setUploadedImages([]);
    setError(null);
  }, []);

  return {
    isUploading,
    uploadProgress,
    uploadedImages,
    uploadImage,
    removeImage,
    clearImages,
    error,
  };
};

// Hook pour gérer les uploads multiples
export const useMultipleImageUpload = (options: UseImageUploadOptions = {}) => {
  const {
    isUploading,
    uploadProgress,
    uploadedImages,
    uploadImage,
    removeImage,
    clearImages,
    error,
  } = useImageUpload(options);

  const uploadMultipleImages = useCallback(async (files: FileList | File[]): Promise<ImageKitUploadResponse[]> => {
    const fileArray = Array.from(files);
    const results: ImageKitUploadResponse[] = [];

    for (const file of fileArray) {
      try {
        const result = await uploadImage(file);
        results.push(result);
      } catch (err) {
        // Failed to upload file - handled by error state
        // Continue avec les autres fichiers même si un échoue
      }
    }

    return results;
  }, [uploadImage]);

  return {
    isUploading,
    uploadProgress,
    uploadedImages,
    uploadImage,
    uploadMultipleImages,
    removeImage,
    clearImages,
    error,
  };
};
