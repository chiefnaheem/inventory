import { useState } from 'react';
import { useProducts } from '../hooks/useQueries';
import { Filter, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Loader, ErrorState } from '../components/ui/States';
import { ProductTable } from '../components/features/ProductTable';

export default function ProductsList() {
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setTimeout(() => setDebouncedSearch(e.target.value), 300);
    };

    const { data, isLoading, error } = useProducts({ page, limit, search: debouncedSearch });

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h1>All Products</h1>
            </div>

            <div className="card mb-4">
                <div className="flex items-center gap-4">
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="text"
                            className="input"
                            placeholder="Search products by name..."
                            style={{ paddingLeft: '2.5rem' }}
                            value={search}
                            onChange={handleSearchChange}
                        />
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
                    <ProductTable products={data?.data || []} />

                    <div className="flex items-center justify-between" style={{ padding: '1rem' }}>
                        <span className="text-sm text-muted">
                            Showing {data?.data?.length || 0} of {data?.meta?.total || 0} results
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                className="btn btn-secondary text-sm"
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                <ChevronLeft size={16} /> Prev
                            </button>
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
        </div>
    );
}
