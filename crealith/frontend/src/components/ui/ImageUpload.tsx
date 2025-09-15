import React, { useState, useRef } from 'react';
import { IKUpload, IKContext, IKImage } from 'imagekitio-react';
import { IMAGEKIT_CONFIG, ImageKitUploadResponse, ImageKitUploadOptions } from '../../config/imagekit';

interface ImageUploadProps {
    onUploadSuccess: (response: ImageKitUploadResponse) => void;
    onUploadError?: (error: any) => void;
    onUploadStart?: () => void;
    folder?: string;
    fileName?: string;
    tags?: string[];
    maxFileSize?: number;
    acceptedFileTypes?: string[];
    className?: string;
    buttonText?: string;
    buttonClassName?: string;
    disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
    onUploadSuccess,
    onUploadError,
    onUploadStart,
    folder = '/crealith/products',
    fileName,
    tags = ['product'],
    maxFileSize = 10 * 1024 * 1024, // 10MB
    acceptedFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    className = '',
    buttonText = 'Choisir une image',
    buttonClassName = 'btn-primary',
    disabled = false,
}) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadStart = () => {
        setIsUploading(true);
        setUploadProgress(0);
        onUploadStart?.();
    };

    const handleUploadProgress = (progress: number) => {
        setUploadProgress(progress);
    };

    const handleUploadSuccess = (response: ImageKitUploadResponse) => {
        setIsUploading(false);
        setUploadProgress(100);
        setPreviewUrl(response.url);
        onUploadSuccess(response);
    };

    const handleUploadError = (error: any) => {
        setIsUploading(false);
        setUploadProgress(0);
        // ImageKit upload error - handled by error state
        onUploadError?.(error);
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validation de la taille
        if (file.size > maxFileSize) {
            onUploadError?.(new Error(`Le fichier est trop volumineux. Taille maximale: ${maxFileSize / (1024 * 1024)}MB`));
            return;
        }

        // Validation du type
        if (!acceptedFileTypes.includes(file.type)) {
            onUploadError?.(new Error(`Type de fichier non supporté. Types acceptés: ${acceptedFileTypes.join(', ')}`));
            return;
        }

        // Créer une preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const uploadOptions: ImageKitUploadOptions = {
        fileName: fileName || undefined,
        folder,
        tags,
        useUniqueFileName: true,
        responseFields: ['fileId', 'name', 'size', 'filePath', 'url', 'thumbnailUrl', 'height', 'width', 'fileType'],
    };

    return (
        <div className={`image-upload ${className}`}>
            <IKContext
                urlEndpoint={IMAGEKIT_CONFIG.urlEndpoint}
                publicKey={IMAGEKIT_CONFIG.publicKey}
                authenticationEndpoint={`${import.meta.env.VITE_API_URL}/imagekit/auth`}
            >
                {/* Preview de l'image */}
                {previewUrl && (
                    <div className="mb-4">
                        <IKImage
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg border border-gray-300"
                            transformation={[{
                                height: 200,
                                width: 200,
                                cropMode: 'maintain_ratio',
                            }]}
                        />
                    </div>
                )}

                {/* Barre de progression */}
                {isUploading && (
                    <div className="mb-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                            Upload en cours... {uploadProgress}%
                        </p>
                    </div>
                )}

                {/* Bouton d'upload */}
                <IKUpload
                    fileName={fileName}
                    folder={folder}
                    tags={tags}
                    useUniqueFileName={true}
                    responseFields={['fileId', 'name', 'size', 'filePath', 'url', 'thumbnailUrl', 'height', 'width', 'fileType']}
                    onUploadStart={handleUploadStart}
                    onUploadProgress={handleUploadProgress}
                    onSuccess={handleUploadSuccess}
                    onError={handleUploadError}
                    validateFile={(file) => {
                        if (file.size > maxFileSize) {
                            return {
                                isValid: false,
                                message: `Le fichier est trop volumineux. Taille maximale: ${maxFileSize / (1024 * 1024)}MB`,
                            };
                        }
                        if (!acceptedFileTypes.includes(file.type)) {
                            return {
                                isValid: false,
                                message: `Type de fichier non supporté. Types acceptés: ${acceptedFileTypes.join(', ')}`,
                            };
                        }
                        return { isValid: true };
                    }}
                    className="hidden"
                >
                    <button
                        type="button"
                        className={`btn ${buttonClassName} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={disabled || isUploading}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {isUploading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Upload en cours...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                {buttonText}
                            </>
                        )}
                    </button>
                </IKUpload>

                {/* Input file caché pour la validation */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptedFileTypes.join(',')}
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </IKContext>
        </div>
    );
};

export default ImageUpload;
