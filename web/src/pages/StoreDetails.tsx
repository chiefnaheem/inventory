import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStoreDetails } from '../hooks/useQueries';
import { useDeleteProduct } from '../hooks/useDeleteProduct';
import { ArrowLeft } from 'lucide-react';
import { Loader, ErrorState } from '../components/ui/States';
import { AlertBanner } from '../components/ui/AlertBanner';
import { ProductTable } from '../components/features/ProductTable';
import { ProductModal } from '../components/features/ProductModal';
import type { Product, Store } from '../types';

export default function StoreDetails() {
    const { id } = useParams<{ id: string }>();
    const { data: store, isLoading, error } = useStoreDetails(id);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const { deleteProduct, deleteError, clearDeleteError } = useDeleteProduct([['store', id!]]);

    const openAddModal = () => { setEditingProduct(null); setIsModalOpen(true); };
    const openEditModal = (product: Product) => { setEditingProduct(product); setIsModalOpen(true); };

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

            {deleteError && <AlertBanner message={deleteError} onDismiss={clearDeleteError} />}

            <div className="flex items-center justify-between mb-4 mt-4" style={{ marginTop: '2rem' }}>
                <h2>Inventory</h2>
                <button className="btn btn-primary" onClick={openAddModal}>Add Product</button>
            </div>

            <ProductTable
                products={(store.products as Product[]) || []}
                emptyMessage="No products in this store."
                hideStoreColumn={true}
                onEdit={openEditModal}
                onDelete={(product) => deleteProduct(product.id)}
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
