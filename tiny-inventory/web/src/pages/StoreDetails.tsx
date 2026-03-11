import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Store, ArrowLeft } from 'lucide-react';

export default function StoreDetails() {
    const { id } = useParams<{ id: string }>();

    const { data: store, isLoading, error } = useQuery({
        queryKey: ['store', id],
        queryFn: () => api.getStoreDetails(id as string),
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <div className="empty-state">
                <div className="loader mb-4"></div>
            </div>
        );
    }

    if (error || !store) {
        return (
            <div className="empty-state">
                <p style={{ color: 'var(--danger-color)' }}>Failed to load store details.</p>
                <Link to="/stores" className="btn btn-secondary mt-4">Go Back</Link>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center gap-4 mb-4">
                <Link to="/stores" className="btn btn-secondary">
                    <ArrowLeft size={16} />
                </Link>
                <h1>{store.name}</h1>
            </div>

            <div className="card mb-4" style={{ display: 'flex', gap: '2rem' }}>
                <div>
                    <p className="text-sm text-muted">Total Products</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{store.totalProducts || 0}</p>
                </div>
                <div>
                    <p className="text-sm text-muted">Inventory Value</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>${(store.inventoryValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
            </div>

            <div className="flex items-center justify-between mb-4 mt-4" style={{ marginTop: '2rem' }}>
                <h2>Inventory</h2>
                <button className="btn btn-primary">Add Product</button>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {store.products?.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }} className="text-muted">
                                    No products in this store.
                                </td>
                            </tr>
                        ) : (
                            store.products?.map((product: any) => (
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
                                    <td>
                                        <button className="btn btn-secondary text-sm">Edit</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
