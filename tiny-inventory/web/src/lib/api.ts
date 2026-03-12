import type { Store, Product, PaginatedResponse, ProductQueryParams } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const api = {
    getStores: async (): Promise<Store[]> => {
        const res = await fetch(`${API_URL}/stores`);
        if (!res.ok) throw new Error('Failed to fetch stores');
        return res.json();
    },

    getStoreDetails: async (id: string): Promise<Store> => {
        const res = await fetch(`${API_URL}/stores/${id}`);
        if (!res.ok) throw new Error('Failed to fetch store details');
        return res.json();
    },

    getProducts: async (params?: ProductQueryParams): Promise<PaginatedResponse<Product>> => {
        const query = new URLSearchParams(params as any).toString();
        const res = await fetch(`${API_URL}/products?${query}`);
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
    },

    createProduct: async (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
        const res = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to create product');
        return res.json();
    },

    updateProduct: async (id: string, data: Partial<Product>): Promise<Product> => {
        const res = await fetch(`${API_URL}/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update product');
        return res.json();
    },

    deleteProduct: async (id: string): Promise<void> => {
        const res = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete product');
        return res.json();
    }
};
