import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Filter, ChevronLeft, ChevronRight, Search } from 'lucide-react';

export default function ProductsList() {
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search input
    // In a real app we'd use useDebounce hook, but doing it simple here
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        // Simple timeout for demo
        setTimeout(() => setDebouncedSearch(e.target.value), 300);
    };

    const { data, isLoading, error } = useQuery({
        queryKey: ['products', { page, limit, search: debouncedSearch }],
        queryFn: () => api.getProducts({ page, limit, search: debouncedSearch }),
        // Keep previous data while fetching new page for smooth UX
        placeholderData: (prev) => prev,
    });

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
                <div className="empty-state">
                    <div className="loader mb-4"></div>
                    <p>Loading products...</p>
                </div>
            ) : error ? (
                <div className="empty-state">
                    <p style={{ color: 'var(--danger-color)' }}>Failed to load products.</p>
                </div>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Store</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.data?.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }} className="text-muted">
                                        No products found.
                                    </td>
                                </tr>
                            ) : (
                                data?.data?.map((product: any) => (
                                    <tr key={product.id}>
                                        <td style={{ fontWeight: 500 }}>{product.name}</td>
                                        <td>
                                            <span style={{ padding: '0.25rem 0.5rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '1rem', fontSize: '0.75rem' }}>
                                                {product.category}
                                            </span>
                                        </td>
                                        <td>${product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td>
                                            <span style={{ color: product.quantity < 10 ? 'var(--danger-color)' : 'inherit' }}>
                                                {product.quantity}
                                            </span>
                                        </td>
                                        <td className="text-muted">{product.store?.name}</td>
                                        <td>
                                            <button className="btn btn-secondary text-sm">Edit</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

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
                </div>
            )}
        </div>
    );
}
