import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '../api';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function mockResponse(body: unknown, ok = true, statusText = 'OK') {
    return Promise.resolve({
        ok,
        statusText,
        json: () => Promise.resolve(body),
    } as Response);
}

beforeEach(() => {
    mockFetch.mockReset();
});

describe('api.getStores', () => {
    it('calls /stores and returns data', async () => {
        const stores = [{ id: '1', name: 'Store A' }];
        mockFetch.mockReturnValue(mockResponse(stores));

        const result = await api.getStores();

        expect(mockFetch).toHaveBeenCalledOnce();
        expect(mockFetch.mock.calls[0][0]).toMatch(/\/stores$/);
        expect(result).toEqual(stores);
    });

    it('throws on non-ok response', async () => {
        mockFetch.mockReturnValue(mockResponse(null, false, 'Internal Server Error'));
        await expect(api.getStores()).rejects.toThrow('API Error: Internal Server Error');
    });
});

describe('api.getStoreDetails', () => {
    it('calls /stores/:id', async () => {
        const store = { id: '42', name: 'Store B' };
        mockFetch.mockReturnValue(mockResponse(store));

        const result = await api.getStoreDetails('42');

        expect(mockFetch.mock.calls[0][0]).toMatch(/\/stores\/42$/);
        expect(result).toEqual(store);
    });
});

describe('api.getProducts', () => {
    it('calls /products with no params', async () => {
        mockFetch.mockReturnValue(mockResponse({ data: [], meta: {} }));

        await api.getProducts();

        expect(mockFetch.mock.calls[0][0]).toMatch(/\/products\?$/);
    });

    it('serialises query params into the URL', async () => {
        mockFetch.mockReturnValue(mockResponse({ data: [], meta: {} }));

        await api.getProducts({ page: 2, limit: 10, search: 'apple', storeId: 'abc' });

        const url: string = mockFetch.mock.calls[0][0];
        expect(url).toContain('page=2');
        expect(url).toContain('limit=10');
        expect(url).toContain('search=apple');
        expect(url).toContain('storeId=abc');
    });
});

describe('api.createProduct', () => {
    it('POSTs to /products with JSON body', async () => {
        const product = { id: '1', name: 'Widget' };
        mockFetch.mockReturnValue(mockResponse(product));

        const payload = { name: 'Widget', category: 'Tools', price: 9.99, quantity: 5, storeId: 's1' };
        await api.createProduct(payload);

        const [url, options] = mockFetch.mock.calls[0];
        expect(url).toMatch(/\/products$/);
        expect(options.method).toBe('POST');
        expect(JSON.parse(options.body)).toEqual(payload);
        expect(options.headers['Content-Type']).toBe('application/json');
    });
});

describe('api.updateProduct', () => {
    it('PUTs to /products/:id with JSON body', async () => {
        mockFetch.mockReturnValue(mockResponse({ id: '5', name: 'Updated' }));

        await api.updateProduct('5', { name: 'Updated' });

        const [url, options] = mockFetch.mock.calls[0];
        expect(url).toMatch(/\/products\/5$/);
        expect(options.method).toBe('PUT');
        expect(JSON.parse(options.body)).toEqual({ name: 'Updated' });
    });
});

describe('api.deleteProduct', () => {
    it('DELETEs /products/:id', async () => {
        mockFetch.mockReturnValue(mockResponse(null));

        await api.deleteProduct('7');

        const [url, options] = mockFetch.mock.calls[0];
        expect(url).toMatch(/\/products\/7$/);
        expect(options.method).toBe('DELETE');
    });
});
