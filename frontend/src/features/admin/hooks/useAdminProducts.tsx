import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';

export const useAdminProducts = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: adminService.deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  return { deleteProduct: deleteMutation.mutate };
};