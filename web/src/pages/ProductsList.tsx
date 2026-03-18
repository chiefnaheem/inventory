import { useState, useRef, useEffect } from 'react';
import { useProducts, useStores } from '../hooks/useQueries';
import { Filter, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { Loader, ErrorState } from '../components/ui/States';
import { ProductTable } from '../components/features/ProductTable';
import { ProductModal } from '../components/features/ProductModal';
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

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const { data: stores } = useStores();
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

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

    const { data, isLoading, error } = useProducts({ page, limit, search: debouncedSearch });

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
                    <button className="btn btn-secondary">
                        <Filter size={16} /> Filters
                    </button>
                </div>
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
