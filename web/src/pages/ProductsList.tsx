import { useState, useEffect } from 'react';
import { useProducts, useStores, useCategories } from '../hooks/useQueries';
import { useDeleteProduct } from '../hooks/useDeleteProduct';
import { Filter } from 'lucide-react';
import { Loader, ErrorState } from '../components/ui/States';
import { SearchBar } from '../components/ui/SearchBar';
import { Pagination } from '../components/ui/Pagination';
import { AlertBanner } from '../components/ui/AlertBanner';
import { ProductTable } from '../components/features/ProductTable';
import { ProductModal } from '../components/features/ProductModal';
import { ProductFilters } from '../components/features/ProductFilters';
import type { Product } from '../types';

export default function ProductsList() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        storeId: '', category: '', inStock: '', minPrice: '', maxPrice: '',
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const { data: stores } = useStores();
    const { data: categories } = useCategories();
    const { deleteProduct, deleteError, clearDeleteError } = useDeleteProduct();

    useEffect(() => { setPage(1); }, [search, filters]);

    const { data, isLoading, error } = useProducts({
        page, limit: 10,
        search: search || undefined,
        storeId: filters.storeId || undefined,
        category: filters.category || undefined,
        minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
        inStock: filters.inStock || undefined,
    });

    const openAddModal = () => { setEditingProduct(null); setIsModalOpen(true); };
    const openEditModal = (product: Product) => { setEditingProduct(product); setIsModalOpen(true); };

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h1>All Products</h1>
                <button className="btn btn-primary" onClick={openAddModal}>Add Product</button>
            </div>

            <div className="card mb-4">
                <div className="flex items-center gap-4">
                    <SearchBar
                        value={search}
                        onChange={setSearch}
                        placeholder="Search products by name..."
                    />
                    <button className="btn btn-secondary" onClick={() => setShowFilters(!showFilters)}>
                        <Filter size={16} /> Filters
                    </button>
                </div>
                {showFilters && (
                    <ProductFilters
                        filters={filters}
                        onChange={setFilters}
                        stores={stores || []}
                        categories={categories || []}
                    />
                )}
            </div>

            {deleteError && <AlertBanner message={deleteError} onDismiss={clearDeleteError} />}

            {isLoading && !data ? (
                <Loader text="Loading products..." />
            ) : error ? (
                <ErrorState message="Failed to load products." />
            ) : (
                <>
                    <ProductTable
                        products={data?.data || []}
                        onEdit={openEditModal}
                        onDelete={(product) => deleteProduct(product.id)}
                    />
                    {data?.meta && <Pagination meta={data.meta} onPageChange={setPage} />}
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
