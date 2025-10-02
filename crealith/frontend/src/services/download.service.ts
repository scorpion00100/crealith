import { apiService } from './api';

class DownloadService {
  async generateDownloadUrl(productId: string): Promise<{ url: string }> {
    try {
      const response = await apiService.get<{ success: boolean; data: { downloadUrl: string } }>(`/downloads/generate/${productId}`);
      
      if (response.success && response.data?.downloadUrl) {
        return { url: response.data.downloadUrl };
      } else {
        throw new Error('URL de téléchargement non disponible');
      }
    } catch (error: any) {
      console.error('Erreur lors de la génération de l\'URL de téléchargement:', error);
      throw new Error(error.message || 'Impossible de générer l\'URL de téléchargement');
    }
  }
}

export const downloadService = new DownloadService();


