import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useDeleteProduct(extraInvalidateKeys?: string[][]) {
    const queryClient = useQueryClient();
    const [error, setError] = useState('');

    const mutation = useMutation({
        mutationFn: (id: string) => api.deleteProduct(id),
        onSuccess: () => {
            setError('');
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            extraInvalidateKeys?.forEach(key => {
                queryClient.invalidateQueries({ queryKey: key });
            });
        },
        onError: (err: Error) => {
            setError(err.message || 'Failed to delete product.');
        }
    });

    return { deleteProduct: mutation.mutate, deleteError: error, clearDeleteError: () => setError('') };
}
