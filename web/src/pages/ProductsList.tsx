import { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useProducts, useStores } from '../hooks/useQueries';
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
    const [showFilters, setShowFilters] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const queryClient = useQueryClient();
    const { data: stores } = useStores();
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.deleteProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['store'] });
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

    const { data, isLoading, error } = useProducts({ page, limit, search: debouncedSearch, storeId: selectedStoreId || undefined });

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
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <label className="text-sm text-muted">Store:</label>
                        <select
                            className="input"
                            style={{ width: 'auto', minWidth: '200px' }}
                            value={selectedStoreId}
                            onChange={(e) => { setSelectedStoreId(e.target.value); setPage(1); }}
                        >
                            <option value="">All Stores</option>
                            {stores?.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        {selectedStoreId && (
                            <button
                                className="btn btn-secondary text-sm"
                                onClick={() => { setSelectedStoreId(''); setPage(1); }}
                            >
                                Clear
                            </button>
                        )}
                    </div>
                )}
            </div>

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

                    <div className="flex items-center justify-between" style={{ padding: '1rem' }}>
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
                    </div>
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
