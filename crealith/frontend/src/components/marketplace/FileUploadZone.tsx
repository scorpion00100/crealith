import React, { useState, useRef, useCallback } from 'react';
import {
    Upload,
    X,
    File,
    Image,
    Video,
    FileText,
    Archive,
    CheckCircle,
    AlertCircle,
    Trash2,
    Eye,
    Download
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface UploadedFile {
    id: string;
    file: File;
    preview?: string;
    progress: number;
    status: 'uploading' | 'completed' | 'error';
    error?: string;
    size: number;
    type: string;
}

interface FileUploadZoneProps {
    onFilesUploaded: (files: UploadedFile[]) => void;
    maxFiles?: number;
    maxSize?: number; // in MB
    acceptedTypes?: string[];
    multiple?: boolean;
    className?: string;
}

const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('video/')) return Video;
    if (type.includes('pdf') || type.includes('document')) return FileText;
    if (type.includes('zip') || type.includes('rar')) return Archive;
    return File;
};

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
    onFilesUploaded,
    maxFiles = 10,
    maxSize = 50, // 50MB
    acceptedTypes = ['image/*', 'video/*', 'application/pdf', '.zip', '.rar'],
    multiple = true,
    className
}) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFile = (file: File): string | null => {
        // Check file size
        if (file.size > maxSize * 1024 * 1024) {
            return `Le fichier "${file.name}" dépasse la taille maximale de ${maxSize}MB`;
        }

        // Check file type
        const isValidType = acceptedTypes.some(type => {
            if (type.startsWith('.')) {
                return file.name.toLowerCase().endsWith(type.toLowerCase());
            }
            if (type.endsWith('/*')) {
                return file.type.startsWith(type.slice(0, -1));
            }
            return file.type === type;
        });

        if (!isValidType) {
            return `Le type de fichier "${file.name}" n'est pas accepté`;
        }

        return null;
    };

    const createFilePreview = (file: File): Promise<string | undefined> => {
        return new Promise((resolve) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.readAsDataURL(file);
            } else {
                resolve(undefined);
            }
        });
    };

    const simulateUpload = async (file: File): Promise<void> => {
        return new Promise((resolve, reject) => {
            const duration = Math.random() * 3000 + 1000; // 1-4 seconds
            const interval = 100;
            let progress = 0;

            const timer = setInterval(() => {
                progress += (interval / duration) * 100;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(timer);
                    resolve();
                }
            }, interval);
        });
    };

    const handleFiles = useCallback(async (files: FileList | File[]) => {
        const fileArray = Array.from(files);

        // Check max files limit
        if (uploadedFiles.length + fileArray.length > maxFiles) {
            alert(`Vous ne pouvez pas télécharger plus de ${maxFiles} fichiers`);
            return;
        }

        setIsUploading(true);
        const newFiles: UploadedFile[] = [];

        for (const file of fileArray) {
            const error = validateFile(file);
            if (error) {
                alert(error);
                continue;
            }

            const preview = await createFilePreview(file);
            const uploadedFile: UploadedFile = {
                id: Math.random().toString(36).substr(2, 9),
                file,
                preview,
                progress: 0,
                status: 'uploading',
                size: file.size,
                type: file.type
            };

            newFiles.push(uploadedFile);
            setUploadedFiles(prev => [...prev, uploadedFile]);

            try {
                // Simulate upload progress
                await simulateUpload(file);

                setUploadedFiles(prev =>
                    prev.map(f =>
                        f.id === uploadedFile.id
                            ? { ...f, progress: 100, status: 'completed' as const }
                            : f
                    )
                );
            } catch (error) {
                setUploadedFiles(prev =>
                    prev.map(f =>
                        f.id === uploadedFile.id
                            ? { ...f, status: 'error' as const, error: 'Erreur lors du téléchargement' }
                            : f
                    )
                );
            }
        }

        setIsUploading(false);
        onFilesUploaded([...uploadedFiles, ...newFiles]);
    }, [uploadedFiles, maxFiles, maxSize, acceptedTypes, onFilesUploaded]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        if (e.dataTransfer.files) {
            handleFiles(e.dataTransfer.files);
        }
    }, [handleFiles]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFiles(e.target.files);
        }
    }, [handleFiles]);

    const removeFile = (fileId: string) => {
        setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    };

    const retryUpload = async (fileId: string) => {
        const file = uploadedFiles.find(f => f.id === fileId);
        if (!file) return;

        setUploadedFiles(prev =>
            prev.map(f =>
                f.id === fileId
                    ? { ...f, status: 'uploading' as const, progress: 0, error: undefined }
                    : f
            )
        );

        try {
            await simulateUpload(file.file);
            setUploadedFiles(prev =>
                prev.map(f =>
                    f.id === fileId
                        ? { ...f, progress: 100, status: 'completed' as const }
                        : f
                )
            );
        } catch (error) {
            setUploadedFiles(prev =>
                prev.map(f =>
                    f.id === fileId
                        ? { ...f, status: 'error' as const, error: 'Erreur lors du téléchargement' }
                        : f
                )
            );
        }
    };

    const FileItem: React.FC<{ file: UploadedFile }> = ({ file }) => {
        const Icon = getFileIcon(file.type);
        const isImage = file.type.startsWith('image/');

        return (
            <div className="bg-background-800 rounded-xl border border-background-700 p-4 hover:border-primary-500/30 transition-all duration-300">
                <div className="flex gap-3">
                    {/* File Preview/Icon */}
                    <div className="w-12 h-12 bg-background-700 rounded-lg flex-shrink-0 overflow-hidden">
                        {isImage && file.preview ? (
                            <img
                                src={file.preview}
                                alt={file.file.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Icon className="w-6 h-6 text-text-400" />
                            </div>
                        )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-text-100 text-sm truncate mb-1">
                            {file.file.name}
                        </h4>
                        <p className="text-xs text-text-400 mb-2">
                            {formatFileSize(file.size)} • {file.type}
                        </p>

                        {/* Progress Bar */}
                        {file.status === 'uploading' && (
                            <div className="w-full bg-background-700 rounded-full h-2 mb-2">
                                <div
                                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${file.progress}%` }}
                                />
                            </div>
                        )}

                        {/* Status */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {file.status === 'completed' && (
                                    <div className="flex items-center gap-1 text-success-400">
                                        <CheckCircle className="w-4 h-4" />
                                        <span className="text-xs">Terminé</span>
                                    </div>
                                )}
                                {file.status === 'error' && (
                                    <div className="flex items-center gap-1 text-error-400">
                                        <AlertCircle className="w-4 h-4" />
                                        <span className="text-xs">{file.error}</span>
                                    </div>
                                )}
                                {file.status === 'uploading' && (
                                    <div className="flex items-center gap-1 text-primary-400">
                                        <div className="w-4 h-4 border-2 border-primary-400/30 border-t-primary-400 rounded-full animate-spin" />
                                        <span className="text-xs">Téléchargement...</span>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1">
                                {file.status === 'completed' && (
                                    <>
                                        <button className="p-1 text-text-400 hover:text-primary-400 transition-colors">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button className="p-1 text-text-400 hover:text-primary-400 transition-colors">
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                                {file.status === 'error' && (
                                    <button
                                        onClick={() => retryUpload(file.id)}
                                        className="px-2 py-1 bg-primary-500 hover:bg-primary-600 text-white text-xs rounded transition-colors"
                                    >
                                        Réessayer
                                    </button>
                                )}
                                <button
                                    onClick={() => removeFile(file.id)}
                                    className="p-1 text-text-400 hover:text-error-400 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={cn('w-full', className)}>
            {/* Upload Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    'relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300',
                    isDragOver
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-background-600 hover:border-primary-500/50 hover:bg-background-800/50'
                )}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple={multiple}
                    accept={acceptedTypes.join(',')}
                    onChange={handleFileInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="space-y-4">
                    <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto">
                        <Upload className="w-8 h-8 text-primary-400" />
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-text-100 mb-2">
                            Glissez vos fichiers ici
                        </h3>
                        <p className="text-text-400 mb-4">
                            ou cliquez pour sélectionner des fichiers
                        </p>
                        <p className="text-sm text-text-500">
                            Maximum {maxFiles} fichiers • {maxSize}MB par fichier
                        </p>
                    </div>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105"
                    >
                        Choisir des fichiers
                    </button>
                </div>
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
                <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-bold text-text-100">
                            Fichiers téléchargés ({uploadedFiles.length})
                        </h4>
                        {uploadedFiles.length > 0 && (
                            <button
                                onClick={() => setUploadedFiles([])}
                                className="text-sm text-text-400 hover:text-error-400 transition-colors"
                            >
                                Tout supprimer
                            </button>
                        )}
                    </div>

                    <div className="space-y-3">
                        {uploadedFiles.map((file) => (
                            <FileItem key={file.id} file={file} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
