import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Loader2 } from 'lucide-react';
import { productSchema, type ProductFormData, GENDER_OPTIONS, SEASON_OPTIONS, USAGE_OPTIONS } from '../schemas/productSchema';
import ImageUpload from './ImageUpload';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData, imageFile: File | null) => Promise<void>;
  initialData?: ProductFormData | null;
  isLoading?: boolean;
}

export default function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: ProductFormModalProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const isEditMode = !!initialData?.id;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      product_display_name: '',
      description: '',
      gender: 'Unisex',
      master_category: '',
      sub_category: '',
      article_type: '',
      base_colour: '',
      season: 'Summer',
      year: new Date().getFullYear(),
      usage: 'Casual',
      price: 0,
    },
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({
        product_display_name: '',
        description: '',
        gender: 'Unisex',
        master_category: '',
        sub_category: '',
        article_type: '',
        base_colour: '',
        season: 'Summer',
        year: new Date().getFullYear(),
        usage: 'Casual',
        price: 0,
      });
    }
    setImageFile(null);
  }, [initialData, reset]);

  const handleFormSubmit = async (data: ProductFormData) => {
    await onSubmit(data, imageFile);
  };

  const handleClose = () => {
    if (!isSubmitting && !isLoading) {
      reset();
      setImageFile(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Product' : 'Create New Product'}
            </h2>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting || isLoading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Basic Information
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('product_display_name')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., Men's Classic Cotton T-Shirt"
                />
                {errors.product_display_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.product_display_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Product description..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (€) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('price', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0.00"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>
            </div>

            {/* Categorization */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Categorization
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('gender')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {GENDER_OPTIONS.map((gender) => (
                      <option key={gender} value={gender}>
                        {gender}
                      </option>
                    ))}
                  </select>
                  {errors.gender && (
                    <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Master Category <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('master_category')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., Apparel, Accessories"
                  />
                  {errors.master_category && (
                    <p className="mt-1 text-sm text-red-600">{errors.master_category.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sub Category <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('sub_category')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., Topwear, Footwear"
                  />
                  {errors.sub_category && (
                    <p className="mt-1 text-sm text-red-600">{errors.sub_category.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Article Type <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('article_type')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., T-Shirt, Jeans"
                  />
                  {errors.article_type && (
                    <p className="mt-1 text-sm text-red-600">{errors.article_type.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Attributes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Attributes
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base Colour <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('base_colour')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., Blue, Red"
                  />
                  {errors.base_colour && (
                    <p className="mt-1 text-sm text-red-600">{errors.base_colour.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Season <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('season')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {SEASON_OPTIONS.map((season) => (
                      <option key={season} value={season}>
                        {season}
                      </option>
                    ))}
                  </select>
                  {errors.season && (
                    <p className="mt-1 text-sm text-red-600">{errors.season.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    {...register('year', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder={new Date().getFullYear().toString()}
                  />
                  {errors.year && (
                    <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usage <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('usage')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {USAGE_OPTIONS.map((usage) => (
                      <option key={usage} value={usage}>
                        {usage}
                      </option>
                    ))}
                  </select>
                  {errors.usage && (
                    <p className="mt-1 text-sm text-red-600">{errors.usage.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Product Image
              </h3>
              
              <Controller
                name="image"
                control={control}
                render={({ field }) => (
                  <ImageUpload
                    value={initialData?.image as string}
                    onChange={(file) => {
                      setImageFile(file);
                      field.onChange(file);
                    }}
                    error={errors.image?.message as string}
                  />
                )}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting || isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {(isSubmitting || isLoading) && <Loader2 className="animate-spin" size={20} />}
                {isEditMode ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
