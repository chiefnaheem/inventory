import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Store, ProductQueryParams, PaginatedResponse, Product } from '../types';

export const useStores = () => {
    return useQuery<Store[]>({
        queryKey: ['stores'],
        queryFn: api.getStores
    });
};

export const useStoreDetails = (id: string | undefined) => {
    return useQuery<Store>({
        queryKey: ['store', id],
        queryFn: () => api.getStoreDetails(id as string),
        enabled: !!id,
    });
};

export const useCategories = () => {
    return useQuery<string[]>({
        queryKey: ['categories'],
        queryFn: api.getCategories,
    });
};

export const useProducts = (params: ProductQueryParams) => {
    return useQuery<PaginatedResponse<Product>>({
        queryKey: ['products', params],
        queryFn: () => api.getProducts(params),
        placeholderData: (prev) => prev,
    });
};
