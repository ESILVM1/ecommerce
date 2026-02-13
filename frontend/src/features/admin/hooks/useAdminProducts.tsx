import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import { toast } from 'sonner';

export const useAdminProducts = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: adminService.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create product');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => 
      adminService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update product');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete product');
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: adminService.bulkDeleteProducts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Products deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete products');
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: ({ ids, updates }: { ids: number[]; updates: Record<string, any> }) =>
      adminService.bulkUpdateProducts(ids, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Products updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update products');
    },
  });

  return {
    createProduct: createMutation.mutate,
    createProductAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    
    updateProduct: updateMutation.mutate,
    updateProductAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    
    deleteProduct: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    
    bulkDeleteProducts: bulkDeleteMutation.mutate,
    isBulkDeleting: bulkDeleteMutation.isPending,
    
    bulkUpdateProducts: bulkUpdateMutation.mutate,
    isBulkUpdating: bulkUpdateMutation.isPending,
  };
};

// Hook to fetch a single product
export const useProduct = (id: number | null) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => adminService.getProduct(id!),
    enabled: !!id,
  });
};