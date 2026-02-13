import { z } from 'zod';

// Constants matching the backend model choices
export const GENDER_OPTIONS = ['Men', 'Women', 'Boys', 'Girls', 'Unisex'] as const;
export const SEASON_OPTIONS = ['Spring', 'Summer', 'Fall', 'Winter'] as const;
export const USAGE_OPTIONS = ['Casual', 'Smart Casual', 'Formal', 'Party', 'Sports', 'Travel'] as const;

// Validation schema for product form
export const productSchema = z.object({
  id: z.number().positive().optional(), // Optional for create, required for edit
  product_display_name: z.string()
    .min(1, 'Product name is required')
    .max(255, 'Product name must be less than 255 characters'),
  
  description: z.string().optional().nullable(),
  
  gender: z.enum(GENDER_OPTIONS, {
    errorMap: () => ({ message: 'Please select a valid gender' }),
  }),
  
  master_category: z.string()
    .min(1, 'Master category is required')
    .max(100, 'Master category must be less than 100 characters'),
  
  sub_category: z.string()
    .min(1, 'Sub category is required')
    .max(100, 'Sub category must be less than 100 characters'),
  
  article_type: z.string()
    .min(1, 'Article type is required')
    .max(100, 'Article type must be less than 100 characters'),
  
  base_colour: z.string()
    .min(1, 'Base colour is required')
    .max(50, 'Base colour must be less than 50 characters'),
  
  season: z.enum(SEASON_OPTIONS, {
    errorMap: () => ({ message: 'Please select a valid season' }),
  }),
  
  year: z.number()
    .int('Year must be a whole number')
    .min(1900, 'Year must be after 1900')
    .max(2100, 'Year must be before 2100'),
  
  usage: z.enum(USAGE_OPTIONS, {
    errorMap: () => ({ message: 'Please select a valid usage type' }),
  }),
  
  price: z.number()
    .min(0, 'Price must be a positive number')
    .max(999999.99, 'Price is too high'),
  
  image: z.any().optional().nullable(), // File or null
});

export type ProductFormData = z.infer<typeof productSchema>;

// Helper function to convert form data to FormData for API submission
export const convertToFormData = (data: ProductFormData, imageFile?: File | null): FormData => {
  const formData = new FormData();
  
  // Add all fields except image
  Object.entries(data).forEach(([key, value]) => {
    if (key !== 'image' && value !== null && value !== undefined) {
      formData.append(key, String(value));
    }
  });
  
  // Add image file if provided
  if (imageFile) {
    formData.append('image', imageFile);
  }
  
  return formData;
};
