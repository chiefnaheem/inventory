import { useParams, Link } from 'react-router-dom';
import { useStoreDetails } from '../hooks/useQueries';
import { ArrowLeft } from 'lucide-react';
import { Loader, ErrorState } from '../components/ui/States';
import { ProductTable } from '../components/features/ProductTable';
import type { Product } from '../types';

export default function StoreDetails() {
    const { id } = useParams<{ id: string }>();
    const { data: store, isLoading, error } = useStoreDetails(id);

    if (isLoading) return <Loader />;

    if (error || !store) {
        return (
            <ErrorState message="Failed to load store details.">
                <Link to="/stores" className="btn btn-secondary mt-4">Go Back</Link>
            </ErrorState>
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
                    <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                        ${(store.inventoryValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between mb-4 mt-4" style={{ marginTop: '2rem' }}>
                <h2>Inventory</h2>
                <button className="btn btn-primary">Add Product</button>
            </div>

            <ProductTable
                products={(store.products as Product[]) || []}
                emptyMessage="No products in this store."
                hideStoreColumn={true}
            />
        </div>
    );
}
