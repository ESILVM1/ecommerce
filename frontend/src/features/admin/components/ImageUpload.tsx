import React, { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value?: string | null; // URL of existing image
  onChange: (file: File | null) => void;
  error?: string;
}

export default function ImageUpload({ value, onChange, error }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_FORMATS.includes(file.type)) {
      return 'Invalid file format. Please upload JPEG, PNG, or WebP images.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size exceeds 5MB. Please upload a smaller image.';
    }
    return null;
  };

  const handleFile = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      setUploadError(error);
      return;
    }

    setUploadError(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Pass file to parent
    onChange(file);
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleRemove = useCallback(() => {
    setPreview(null);
    setUploadError(null);
    onChange(null);
  }, [onChange]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Product Image
      </label>
      
      {preview ? (
        <div className="relative w-full h-64 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50">
          <img 
            src={preview} 
            alt="Product preview" 
            className="w-full h-full object-contain"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg"
            title="Remove image"
          >
            <X size={20} />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative w-full h-64 border-2 border-dashed rounded-lg
            flex flex-col items-center justify-center
            transition-colors cursor-pointer
            ${isDragging 
              ? 'border-indigo-500 bg-indigo-50' 
              : 'border-gray-300 bg-gray-50 hover:border-gray-400'
            }
          `}
        >
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="flex flex-col items-center gap-2 pointer-events-none">
            {isDragging ? (
              <Upload className="text-indigo-500" size={48} />
            ) : (
              <ImageIcon className="text-gray-400" size={48} />
            )}
            
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                {isDragging ? 'Drop image here' : 'Drag and drop an image, or click to browse'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                JPEG, PNG, WebP (max 5MB)
              </p>
            </div>
          </div>
        </div>
      )}
      
      {(uploadError || error) && (
        <p className="text-sm text-red-600">
          {uploadError || error}
        </p>
      )}
    </div>
  );
}
