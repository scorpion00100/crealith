import { apiService } from './api';

class DownloadService {
  async generateDownloadUrl(productId: string): Promise<{ url: string }> {
    const res = await apiService.get<{ success: boolean; data: { url: string } }>(`/downloads/generate/${productId}`);
    return res;
  }
}

export const downloadService = new DownloadService();


