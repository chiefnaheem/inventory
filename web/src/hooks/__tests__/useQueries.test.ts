import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useStores, useStoreDetails, useProducts } from '../useQueries';
import { api } from '../../lib/api';

vi.mock('../../lib/api', () => ({
    api: {
        getStores: vi.fn(),
        getStoreDetails: vi.fn(),
        getProducts: vi.fn(),
    },
}));

function wrapper() {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return ({ children }: { children: React.ReactNode }) =>
        React.createElement(QueryClientProvider, { client: queryClient }, children);
}

beforeEach(() => {
    vi.resetAllMocks();
});

describe('useStores', () => {
    it('returns stores on success', async () => {
        const stores = [{ id: '1', name: 'Store A' }];
        vi.mocked(api.getStores).mockResolvedValue(stores as any);

        const { result } = renderHook(() => useStores(), { wrapper: wrapper() });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual(stores);
    });

    it('uses queryKey ["stores"]', async () => {
        vi.mocked(api.getStores).mockResolvedValue([]);
        const { result } = renderHook(() => useStores(), { wrapper: wrapper() });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(api.getStores).toHaveBeenCalledOnce();
    });

    it('surfaces errors', async () => {
        vi.mocked(api.getStores).mockRejectedValue(new Error('Network error'));
        const { result } = renderHook(() => useStores(), { wrapper: wrapper() });
        await waitFor(() => expect(result.current.isError).toBe(true));
        expect((result.current.error as Error).message).toBe('Network error');
    });
});

describe('useStoreDetails', () => {
    it('fetches store details when id is provided', async () => {
        const store = { id: '42', name: 'Store B' };
        vi.mocked(api.getStoreDetails).mockResolvedValue(store as any);

        const { result } = renderHook(() => useStoreDetails('42'), { wrapper: wrapper() });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(api.getStoreDetails).toHaveBeenCalledWith('42');
        expect(result.current.data).toEqual(store);
    });

    it('does not fetch when id is undefined', async () => {
        const { result } = renderHook(() => useStoreDetails(undefined), { wrapper: wrapper() });

        // Query is disabled — stays in pending state without fetching
        expect(result.current.fetchStatus).toBe('idle');
        expect(api.getStoreDetails).not.toHaveBeenCalled();
    });
});

describe('useProducts', () => {
    it('fetches products with params', async () => {
        const response = { data: [{ id: '1', name: 'Widget' }], meta: { total: 1, page: 1, limit: 10, totalPages: 1 } };
        vi.mocked(api.getProducts).mockResolvedValue(response as any);

        const params = { page: 1, limit: 10 };
        const { result } = renderHook(() => useProducts(params), { wrapper: wrapper() });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(api.getProducts).toHaveBeenCalledWith(params);
        expect(result.current.data).toEqual(response);
    });

    it('surfaces errors', async () => {
        vi.mocked(api.getProducts).mockRejectedValue(new Error('Failed'));
        const { result } = renderHook(() => useProducts({}), { wrapper: wrapper() });
        await waitFor(() => expect(result.current.isError).toBe(true));
    });
});
