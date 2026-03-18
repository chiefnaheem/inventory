import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '../lib/api';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function jsonResponse(data: unknown, status = 200) {
    return Promise.resolve({
        ok: status >= 200 && status < 300,
        status,
        statusText: status === 404 ? 'Not Found' : 'OK',
        json: () => Promise.resolve(data),
    });
}

beforeEach(() => {
    mockFetch.mockReset();
});

describe('api.getProducts', () => {
    it('strips undefined and empty params from query string', async () => {
        mockFetch.mockReturnValue(jsonResponse({ data: [], meta: {} }));

        await api.getProducts({ page: 1, limit: 10, search: '', storeId: undefined });

        const url = mockFetch.mock.calls[0][0] as string;
        expect(url).toContain('page=1');
        expect(url).toContain('limit=10');
        expect(url).not.toContain('search');
        expect(url).not.toContain('storeId');
    });

    it('includes params that have values', async () => {
        mockFetch.mockReturnValue(jsonResponse({ data: [], meta: {} }));

        await api.getProducts({ page: 2, limit: 10, search: 'mac', storeId: 'abc' });

        const url = mockFetch.mock.calls[0][0] as string;
        expect(url).toContain('search=mac');
        expect(url).toContain('storeId=abc');
    });
});

describe('api error handling', () => {
    it('throws with server error message when available', async () => {
        mockFetch.mockReturnValue(Promise.resolve({
            ok: false,
            status: 404,
            statusText: 'Not Found',
            json: () => Promise.resolve({ message: 'Product not found' }),
        }));

        await expect(api.getStores()).rejects.toThrow('Product not found');
    });

    it('falls back to statusText when no body message', async () => {
        mockFetch.mockReturnValue(Promise.resolve({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            json: () => Promise.reject(),
        }));

        await expect(api.getStores()).rejects.toThrow('Internal Server Error');
    });
});

describe('api.deleteProduct', () => {
    it('handles 204 No Content response', async () => {
        mockFetch.mockReturnValue(Promise.resolve({
            ok: true,
            status: 204,
            json: () => Promise.reject('should not parse'),
        }));

        const result = await api.deleteProduct('abc-123');
        expect(result).toBeUndefined();
    });
});
