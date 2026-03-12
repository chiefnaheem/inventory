import type { Store, Product, PaginatedResponse, ProductQueryParams } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });
    if (!res.ok) {
        throw new Error(`API Error: ${res.statusText}`);
    }
    return res.json();
}

export const api = {
    getStores: () => fetchApi<Store[]>('/stores'),
    getStoreDetails: (id: string) => fetchApi<Store>(`/stores/${id}`),
    getProducts: (params?: ProductQueryParams) => {
        const query = new URLSearchParams(params as any).toString();
        return fetchApi<PaginatedResponse<Product>>(`/products?${query}`);
    },
    createProduct: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) =>
        fetchApi<Product>('/products', { method: 'POST', body: JSON.stringify(data) }),
    updateProduct: (id: string, data: Partial<Product>) =>
        fetchApi<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteProduct: (id: string) =>
        fetchApi<void>(`/products/${id}`, { method: 'DELETE' })
};
