export interface Store {
    id: string;
    name: string;
    location: string | null;
    createdAt: string;
    updatedAt: string;

    totalProducts?: number;
    inventoryValue?: number;

    products?: Product[];
}

export interface Product {
    id: string;
    storeId: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
    createdAt: string;
    updatedAt: string;

    store?: Partial<Store>;
}

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}

export interface ProductQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    storeId?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: string;
}
