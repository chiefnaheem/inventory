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
        const body = await res.json().catch(() => null);
        const message = body?.message || res.statusText || 'Something went wrong';
        throw new Error(message);
    }
    if (res.status === 204) return undefined as T;
    return res.json();
}

export const api = {
    getStores: () => fetchApi<Store[]>('/stores'),
    getStoreDetails: (id: string) => fetchApi<Store>(`/stores/${id}`),
    getProducts: (params?: ProductQueryParams) => {
        const filtered: Record<string, string> = {};
        if (params) {
            for (const [key, value] of Object.entries(params)) {
                if (value !== undefined && value !== '') {
                    filtered[key] = String(value);
                }
            }
        }
        const query = new URLSearchParams(filtered).toString();
        return fetchApi<PaginatedResponse<Product>>(`/products?${query}`);
    },
    createProduct: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) =>
        fetchApi<Product>('/products', { method: 'POST', body: JSON.stringify(data) }),
    updateProduct: (id: string, data: Partial<Product>) =>
        fetchApi<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteProduct: (id: string) =>
        fetchApi<void>(`/products/${id}`, { method: 'DELETE' })
};
