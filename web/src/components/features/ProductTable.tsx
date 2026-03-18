import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { Product } from '../../types';

interface ProductTableProps {
    products: Product[];
    emptyMessage?: string;
    hideStoreColumn?: boolean;
    onEdit?: (product: Product) => void;
    onDelete?: (product: Product) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
    products,
    emptyMessage = 'No products found.',
    hideStoreColumn = false,
    onEdit,
    onDelete
}) => {
    const [confirmingId, setConfirmingId] = useState<string | null>(null);

    const handleDelete = (product: Product) => {
        if (confirmingId === product.id) {
            onDelete?.(product);
            setConfirmingId(null);
        } else {
            setConfirmingId(product.id);
        }
    };

    return (
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        {!hideStoreColumn && <th>Store</th>}
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.length === 0 ? (
                        <tr>
                            <td colSpan={hideStoreColumn ? 5 : 6} style={{ textAlign: 'center', padding: '2rem' }} className="text-muted">
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        products.map((product) => (
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
                                {!hideStoreColumn && <td className="text-muted">{product.store?.name}</td>}
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            className="btn btn-secondary text-sm"
                                            onClick={() => onEdit?.(product)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn text-sm"
                                            style={{
                                                backgroundColor: confirmingId === product.id ? 'var(--danger-color)' : 'transparent',
                                                color: confirmingId === product.id ? '#fff' : 'var(--danger-color)',
                                                border: '1px solid var(--danger-color)',
                                            }}
                                            onClick={() => handleDelete(product)}
                                            onBlur={() => setConfirmingId(null)}
                                        >
                                            <Trash2 size={14} />
                                            {confirmingId === product.id ? 'Confirm' : 'Delete'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};
