import ImageKit from 'imagekit';
import { createError } from './errors';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export interface ImageKitUploadResult {
  url: string;
  fileId: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
}

export const uploadToImageKit = async (
  file: Express.Multer.File,
  folder: string = 'uploads'
): Promise<ImageKitUploadResult> => {
  try {
    const fileName = `${folder}/${Date.now()}-${file.originalname}`;
    
    const uploadResponse = await new Promise<ImageKitUploadResult>((resolve, reject) => {
      imagekit.upload({
        file: file.buffer,
        fileName: fileName,
        folder: folder,
        useUniqueFileName: true,
        tags: ['crealith', folder],
        responseFields: ['url', 'fileId', 'fileName', 'filePath', 'fileType', 'fileSize'],
      }, (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            url: result.url,
            fileId: result.fileId,
            fileName: result.name,
            filePath: result.filePath,
            fileType: result.fileType,
            fileSize: result.size,
          });
        } else {
          reject(new Error('Upload failed'));
        }
      });
    });

    return uploadResponse;
  } catch (error) {
    console.error('ImageKit upload error:', error);
    throw createError.internal('Failed to upload file');
  }
};

export const deleteFromImageKit = async (fileId: string): Promise<void> => {
  try {
    await new Promise<void>((resolve, reject) => {
      imagekit.deleteFile(fileId, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  } catch (error) {
    console.error('ImageKit delete error:', error);
    // Ne pas faire échouer l'opération si la suppression échoue
  }
};

export const getImageKitUrl = (filePath: string, transformation?: string): string => {
  if (transformation) {
    return imagekit.url({
      path: filePath,
      transformation: [transformation],
    });
  }
  return imagekit.url({ path: filePath });
};
