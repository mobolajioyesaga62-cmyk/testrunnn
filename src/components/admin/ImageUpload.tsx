import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  multiple?: boolean;
  maxFiles?: number;
}

export default function ImageUpload({ 
  value, 
  onChange, 
  label = 'Upload Images', 
  placeholder = 'https://example.com/image.jpg',
  multiple = false,
  maxFiles = 5
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList) => {
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).slice(0, maxFiles);
    const imageFiles = validFiles.filter(file => 
      file.type.startsWith('image/') && 
      (file.type.includes('jpeg') || file.type.includes('png') || file.type.includes('webp'))
    );

    if (imageFiles.length === 0) {
      alert('Please select valid image files (JPG, PNG, WebP)');
      return;
    }

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of imageFiles) {
        const fileName = `products/${Date.now()}-${file.name}`;
        
        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('Upload error:', error);
          throw error;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        if (publicUrl) {
          uploadedUrls.push(publicUrl);
        }
      }

      if (uploadedUrls.length > 0) {
        const finalUrls = multiple ? [...(value || []), ...uploadedUrls] : uploadedUrls[0];
        onChange(multiple ? finalUrls.join(',') : finalUrls);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    handleFileSelect(files);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const removeImage = (index: number) => {
    if (multiple && value) {
      const urls = value.split(',');
      const newUrls = urls.filter((_, i) => i !== index);
      onChange(newUrls.join(','));
    } else {
      onChange('');
    }
  };

  const currentUrls = value ? value.split(',') : [];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      <div 
        className={`
          relative border-2 border-dashed border-gray-300 rounded-lg p-6
          ${dragActive ? 'border-amber-500 bg-amber-50' : 'border-gray-300'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-amber-400'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ display: 'none' }}
        />

        <div className="text-center">
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mb-4"></div>
              <p className="text-sm text-gray-600">Uploading images...</p>
              <p className="text-xs text-gray-500">Please don't close this window</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="text-4xl text-gray-400 mb-4" size={48} />
              <p className="text-lg font-medium text-gray-900 mb-2">
                {multiple ? 'Drop images here' : 'Drop image here'}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                or click to browse
              </p>
              <div className="flex gap-2 text-xs text-gray-600">
                <span>• JPG, PNG, WebP</span>
                {multiple && <span> • Max {maxFiles} files</span>}
                <span> • Max 5MB per file</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={openFileDialog}
                disabled={uploading}
              >
                <Upload size={16} className="mr-2" />
                Choose Files
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Current Images */}
      {currentUrls.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-900">Uploaded Images</h4>
            <p className="text-xs text-gray-500">
              {multiple ? `${currentUrls.length} images` : '1 image'}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {currentUrls.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove image"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* URL Input as fallback */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Or enter image URL directly:
        </label>
        <input
          type="url"
          value={multiple ? '' : (value || '')}
          onChange={(e) => {
            const url = e.target.value.trim();
            if (url && !multiple) {
              onChange(url);
            }
          }}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
        />
      </div>
    </div>
  );
}
