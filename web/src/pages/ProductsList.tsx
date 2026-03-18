import { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useProducts, useStores, useCategories } from '../hooks/useQueries';
import { ChevronLeft, ChevronRight, Search, X, Filter } from 'lucide-react';
import { Loader, ErrorState } from '../components/ui/States';
import { ProductTable } from '../components/features/ProductTable';
import { ProductModal } from '../components/features/ProductModal';
import { api } from '../lib/api';
import type { Product } from '../types';

function getPageNumbers(current: number, total: number): (number | '...')[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (current > 3) pages.push('...');
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i);
    }
    if (current < total - 2) pages.push('...');
    pages.push(total);
    return pages;
}

export default function ProductsList() {
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedStoreId, setSelectedStoreId] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [inStock, setInStock] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const queryClient = useQueryClient();
    const { data: stores } = useStores();
    const { data: categories } = useCategories();
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

    const [deleteError, setDeleteError] = useState('');
    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.deleteProduct(id),
        onSuccess: () => {
            setDeleteError('');
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['store'] });
        },
        onError: (err: Error) => {
            setDeleteError(err.message || 'Failed to delete product.');
        }
    });

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setDebouncedSearch(value), 300);
    };

    // Reset to page 1 when search changes
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    // Cleanup debounce timeout on unmount
    useEffect(() => {
        return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
    }, []);

    const clearSearch = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setSearch('');
        setDebouncedSearch('');
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const { data, isLoading, error } = useProducts({
        page, limit,
        search: debouncedSearch || undefined,
        storeId: selectedStoreId || undefined,
        category: selectedCategory || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        inStock: inStock || undefined,
    });

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h1>All Products</h1>
                <button className="btn btn-primary" onClick={openAddModal}>Add Product</button>
            </div>

            <div className="card mb-4">
                <div className="flex items-center gap-4">
                    <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <Search size={16} style={{ position: 'absolute', left: '1rem', color: 'var(--text-secondary)' }} />
                        <input
                            type="text"
                            className="input"
                            placeholder="Search products by name..."
                            style={{ paddingLeft: '2.5rem', paddingRight: search ? '2.5rem' : '1rem', width: '100%' }}
                            value={search}
                            onChange={handleSearchChange}
                        />
                        {search && (
                            <button
                                onClick={clearSearch}
                                aria-label="Clear search"
                                style={{ position: 'absolute', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    <button className="btn btn-secondary" onClick={() => setShowFilters(!showFilters)}>
                        <Filter size={16} /> Filters
                    </button>
                </div>
                {showFilters && (
                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <label className="text-sm text-muted">Store:</label>
                                <select
                                    className="input"
                                    style={{ width: 'auto', minWidth: '160px' }}
                                    value={selectedStoreId}
                                    onChange={(e) => { setSelectedStoreId(e.target.value); setPage(1); }}
                                >
                                    <option value="">All Stores</option>
                                    {stores?.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <label className="text-sm text-muted">Category:</label>
                                <select
                                    className="input"
                                    style={{ width: 'auto', minWidth: '160px' }}
                                    value={selectedCategory}
                                    onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                                >
                                    <option value="">All Categories</option>
                                    {categories?.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <label className="text-sm text-muted">Stock:</label>
                                <select
                                    className="input"
                                    style={{ width: 'auto', minWidth: '130px' }}
                                    value={inStock}
                                    onChange={(e) => { setInStock(e.target.value); setPage(1); }}
                                >
                                    <option value="">All</option>
                                    <option value="true">In Stock</option>
                                    <option value="false">Out of Stock</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <label className="text-sm text-muted">Price:</label>
                                <input
                                    type="number"
                                    className="input"
                                    placeholder="Min"
                                    min="0"
                                    style={{ width: '100px' }}
                                    value={minPrice}
                                    onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                                />
                                <span className="text-sm text-muted">–</span>
                                <input
                                    type="number"
                                    className="input"
                                    placeholder="Max"
                                    min="0"
                                    style={{ width: '100px' }}
                                    value={maxPrice}
                                    onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                                />
                            </div>

                            {(selectedStoreId || selectedCategory || inStock || minPrice || maxPrice) && (
                                <button
                                    className="btn btn-secondary text-sm"
                                    onClick={() => {
                                        setSelectedStoreId('');
                                        setSelectedCategory('');
                                        setInStock('');
                                        setMinPrice('');
                                        setMaxPrice('');
                                        setPage(1);
                                    }}
                                >
                                    Clear All Filters
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {deleteError && (
                <div className="card mb-4" style={{ borderLeft: '3px solid var(--danger-color)', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="text-sm" style={{ color: 'var(--danger-color)' }}>{deleteError}</span>
                    <button className="btn btn-secondary text-sm" onClick={() => setDeleteError('')}>Dismiss</button>
                </div>
            )}

            {isLoading && !data ? (
                <Loader text="Loading products..." />
            ) : error ? (
                <ErrorState message="Failed to load products." />
            ) : (
                <>
                    <ProductTable
                        products={data?.data || []}
                        onEdit={openEditModal}
                        onDelete={(product) => deleteMutation.mutate(product.id)}
                    />

                    {(data?.meta?.total || 0) > 0 && <div className="flex items-center justify-between" style={{ padding: '1rem' }}>
                        <span className="text-sm text-muted">
                            Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, data?.meta?.total || 0)} of {data?.meta?.total || 0} results
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                className="btn btn-secondary text-sm"
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                <ChevronLeft size={16} /> Prev
                            </button>
                            {getPageNumbers(page, data?.meta?.totalPages || 1).map((p, i) => (
                                p === '...' ? (
                                    <span key={`ellipsis-${i}`} className="text-sm text-muted" style={{ padding: '0 0.25rem' }}>...</span>
                                ) : (
                                    <button
                                        key={p}
                                        className={`btn text-sm ${p === page ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => setPage(p)}
                                    >
                                        {p}
                                    </button>
                                )
                            ))}
                            <button
                                className="btn btn-secondary text-sm"
                                disabled={page >= (data?.meta?.totalPages || 1)}
                                onClick={() => setPage(p => p + 1)}
                            >
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>}
                </>
            )}

            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={editingProduct}
                stores={stores || []}
            />
        </div>
    );
}
