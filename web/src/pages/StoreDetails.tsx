import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useStoreDetails } from '../hooks/useQueries';
import { ArrowLeft } from 'lucide-react';
import { Loader, ErrorState } from '../components/ui/States';
import { ProductTable } from '../components/features/ProductTable';
import { ProductModal } from '../components/features/ProductModal';
import { api } from '../lib/api';
import type { Product, Store } from '../types';

export default function StoreDetails() {
    const { id } = useParams<{ id: string }>();
    const { data: store, isLoading, error } = useStoreDetails(id);
    const queryClient = useQueryClient();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const [deleteError, setDeleteError] = useState('');
    const deleteMutation = useMutation({
        mutationFn: (productId: string) => api.deleteProduct(productId),
        onSuccess: () => {
            setDeleteError('');
            queryClient.invalidateQueries({ queryKey: ['store', id] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onError: (err: Error) => {
            setDeleteError(err.message || 'Failed to delete product.');
        }
    });

    const openAddModal = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

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

            {deleteError && (
                <div className="card mb-4" style={{ borderLeft: '3px solid var(--danger-color)', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                    <span className="text-sm" style={{ color: 'var(--danger-color)' }}>{deleteError}</span>
                    <button className="btn btn-secondary text-sm" onClick={() => setDeleteError('')}>Dismiss</button>
                </div>
            )}

            <div className="flex items-center justify-between mb-4 mt-4" style={{ marginTop: '2rem' }}>
                <h2>Inventory</h2>
                <button className="btn btn-primary" onClick={openAddModal}>Add Product</button>
            </div>

            <ProductTable
                products={(store.products as Product[]) || []}
                emptyMessage="No products in this store."
                hideStoreColumn={true}
                onEdit={openEditModal}
                onDelete={(product) => deleteMutation.mutate(product.id)}
            />

            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={editingProduct}
                defaultStoreId={store.id}
                stores={[store as Store]}
            />
        </div>
    );
}
