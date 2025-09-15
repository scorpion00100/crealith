import React, { useState } from 'react';
import { useAppDispatch } from '@/store';
import { addNotification } from '@/store/slices/notificationSlice';
import {
  Upload,
  X,
  FileText,
  Image,
  DollarSign,
  Tag,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { FileUploadZone } from '@/components/marketplace/FileUploadZone';
import { useImageUpload } from '@/hooks/useImageUpload';
import { productService } from '@/services/product.service';

interface ProductUploadFormProps {
  onSuccess?: () => void;
  productId?: string; // Pour l'édition
}

interface FormData {
  title: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  file: File | null;
  thumbnail: File | null;
}

interface FormErrors {
  title?: string;
  description?: string;
  price?: string;
  category?: string;
  tags?: string;
  file?: string;
  thumbnail?: string;
}

const categories = [
  { id: 'templates', name: 'Templates' },
  { id: 'graphics', name: 'Graphiques' },
  { id: 'ebooks', name: 'E-books' },
  { id: 'code', name: 'Code' },
  { id: 'audio', name: 'Audio' },
  { id: 'video', name: 'Vidéo' }
];

const allowedFileTypes = [
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'image/svg+xml',
  'text/plain',
  'application/json',
  'text/css',
  'text/html',
  'application/javascript'
];

const allowedImageTypes = [
  'image/jpeg',
  'image/png',
  'image/webp'
];

export const ProductUploadForm: React.FC<ProductUploadFormProps> = ({
  onSuccess,
  productId
}) => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    price: 0,
    category: '',
    tags: [],
    file: null,
    thumbnail: null
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // Upload hooks
  const {
    isUploading: isUploadingImage,
    uploadedImages: uploadedThumbnails,
    uploadImage: uploadThumbnail,
    clearImages: clearThumbs,
  } = useImageUpload({
    folder: '/crealith/products',
    acceptedFileTypes: allowedImageTypes,
  });

  const {
    isUploading: isUploadingFile,
    uploadedImages: uploadedFiles,
    uploadImage: uploadMainFile,
    clearImages: clearFiles,
  } = useImageUpload({
    folder: '/crealith/files',
    acceptedFileTypes: allowedFileTypes,
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Le prix doit être supérieur à 0';
    }

    if (!formData.category) {
      newErrors.category = 'La catégorie est requise';
    }

    if (!formData.file) {
      newErrors.file = 'Le fichier est requis';
    }

    if (!formData.thumbnail) {
      newErrors.thumbnail = 'La miniature est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileSelected = (file: File, type: 'file' | 'thumbnail') => {
    const allowedTypes = type === 'file' ? allowedFileTypes : allowedImageTypes;
    const maxSize = type === 'file' ? 50 * 1024 * 1024 : 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        [type]: type === 'file'
          ? 'Type de fichier non supporté. Utilisez PDF, ZIP, SVG, etc.'
          : 'Type d\'image non supporté. Utilisez JPEG, PNG, ou WebP.'
      }));
      return;
    }

    if (file.size > maxSize) {
      setErrors(prev => ({
        ...prev,
        [type]: type === 'file'
          ? 'Le fichier est trop volumineux (max 50MB)'
          : 'L\'image est trop volumineuse (max 5MB)'
      }));
      return;
    }

    setFormData(prev => ({ ...prev, [type]: file }));
    setErrors(prev => ({ ...prev, [type]: undefined }));

    if (type === 'thumbnail') {
      const reader = new FileReader();
      reader.onload = e => setThumbnailPreview((e.target?.result as string) || null);
      reader.readAsDataURL(file);
    }
  };

  const handleTagAdd = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload des fichiers si nécessaire
      let thumbnailUrl: string | undefined;
      let fileUrl: string | undefined;

      if (formData.thumbnail) {
        const thumbRes = await uploadThumbnail(formData.thumbnail, formData.title.replace(/\s+/g, '_'));
        thumbnailUrl = thumbRes.url;
      }

      if (formData.file) {
        const fileRes = await uploadMainFile(formData.file, formData.title.replace(/\s+/g, '_'));
        fileUrl = fileRes.url;
      }

      // Création ou mise à jour du produit
      const payload = {
        title: formData.title,
        description: formData.description,
        price: String(formData.price),
        category: { id: formData.category, name: '' },
        tags: formData.tags,
        thumbnailUrl,
        fileUrl,
        fileType: formData.file?.type,
        fileSize: formData.file?.size,
        status: 'draft',
      } as any;

      if (productId) {
        await productService.updateProduct(productId, payload);
      } else {
        await productService.createProduct(payload);
      }

      clearThumbs();
      clearFiles();

      dispatch(addNotification({
        type: 'success',
        message: productId ? 'Le produit a été mis à jour avec succès' : 'Le produit a été créé avec succès',
        duration: 3000,
      }));

      onSuccess?.();
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Une erreur est survenue lors de la sauvegarde',
        duration: 4000,
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return '📄';
      case 'zip': return '📦';
      case 'svg': return '🎨';
      case 'txt': return '📝';
      case 'json': return '⚙️';
      case 'css': return '🎨';
      case 'html': return '🌐';
      case 'js': return '⚡';
      default: return '📎';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Titre */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Titre du produit *
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => {
            setFormData(prev => ({ ...prev, title: e.target.value }));
            setErrors(prev => ({ ...prev, title: undefined }));
          }}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.title ? 'border-red-300' : 'border-gray-300'
            }`}
          placeholder="Ex: Template WordPress Premium"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.title}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          id="description"
          rows={4}
          value={formData.description}
          onChange={(e) => {
            setFormData(prev => ({ ...prev, description: e.target.value }));
            setErrors(prev => ({ ...prev, description: undefined }));
          }}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.description ? 'border-red-300' : 'border-gray-300'
            }`}
          placeholder="Décrivez votre produit en détail..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.description}
          </p>
        )}
      </div>

      {/* Prix et Catégorie */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
            Prix (€) *
          </label>
          <div className="relative">
            <input
              type="number"
              id="price"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }));
                setErrors(prev => ({ ...prev, price: undefined }));
              }}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.price ? 'border-red-300' : 'border-gray-300'
                }`}
              placeholder="0.00"
            />
            <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>
          {errors.price && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.price}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Catégorie *
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, category: e.target.value }));
              setErrors(prev => ({ ...prev, category: undefined }));
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.category ? 'border-red-300' : 'border-gray-300'
              }`}
          >
            <option value="">Sélectionner une catégorie</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.category}
            </p>
          )}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags (max 5)
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleTagRemove(tag)}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ajouter un tag..."
            disabled={formData.tags.length >= 5}
          />
          <button
            type="button"
            onClick={handleTagAdd}
            disabled={!tagInput.trim() || formData.tags.length >= 5}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Tag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Fichier principal (Drag & Drop) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fichier principal *
        </label>
        <FileUploadZone
          onFilesUploaded={(files) => {
            const first = files[0]?.file;
            if (first) {
              handleFileSelected(first, 'file');
            }
          }}
          maxFiles={1}
          multiple={false}
          acceptedTypes={allowedFileTypes}
          className="bg-white"
        />
        {formData.file && (
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-700">
            <span className="text-2xl">{getFileIcon(formData.file.name)}</span>
            <span className="font-medium">{formData.file.name}</span>
            <span className="text-gray-500">{(formData.file.size / 1024 / 1024).toFixed(2)} MB</span>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>
        )}
        {errors.file && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.file}
          </p>
        )}
      </div>

      {/* Miniature (Drag & Drop) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Miniature *
        </label>
        <FileUploadZone
          onFilesUploaded={(files) => {
            const first = files[0];
            if (first?.file) {
              handleFileSelected(first.file, 'thumbnail');
              if (first.preview) setThumbnailPreview(first.preview);
            }
          }}
          maxFiles={1}
          multiple={false}
          acceptedTypes={allowedImageTypes}
          className="bg-white"
        />
        {(formData.thumbnail || thumbnailPreview) && (
          <div className="mt-2 flex items-center gap-3">
            <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
              {thumbnailPreview ? (
                <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Image className="w-8 h-8 text-blue-500" />
              )}
            </div>
            {formData.thumbnail && (
              <div className="text-sm text-gray-700">
                <div className="font-medium">{formData.thumbnail.name}</div>
                <div className="text-gray-500">{(formData.thumbnail.size / 1024 / 1024).toFixed(2)} MB</div>
              </div>
            )}
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>
        )}
        {errors.thumbnail && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.thumbnail}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => onSuccess?.()}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Enregistrement...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>{productId ? 'Mettre à jour' : 'Créer le produit'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
