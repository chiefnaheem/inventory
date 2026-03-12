import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { X } from 'lucide-react';
import type { Product, Store } from '../../types';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product?: Product | null;
    defaultStoreId?: string;
    stores?: Store[];
}

export const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, product, defaultStoreId, stores = [] }) => {
    const queryClient = useQueryClient();
    const isEditing = !!product;

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        quantity: '',
        storeId: defaultStoreId || ''
    });

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                category: product.category,
                price: String(product.price),
                quantity: String(product.quantity),
                storeId: product.storeId
            });
        } else {
            setFormData({
                name: '',
                category: '',
                price: '',
                quantity: '',
                storeId: defaultStoreId || (stores[0]?.id ?? '')
            });
        }
    }, [product, defaultStoreId, stores, isOpen]);

    const mutation = useMutation({
        mutationFn: (data: any) => isEditing ? api.updateProduct(product!.id, data) : api.createProduct(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['store'] });
            onClose();
        }
    });

    if (!isOpen) return null;

    return (
        <div style={overlayStyle}>
            <div style={modalStyle} className="card">
                <div className="flex items-center justify-between mb-4">
                    <h2>{isEditing ? 'Edit Product' : 'Add Product'}</h2>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={(e) => {
                    e.preventDefault();
                    mutation.mutate({
                        ...formData,
                        price: Number(formData.price),
                        quantity: Number(formData.quantity)
                    });
                }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label className="text-sm text-muted">Name</label>
                        <input required type="text" className="input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label className="text-sm text-muted">Category</label>
                            <input required type="text" className="input" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label className="text-sm text-muted">Price ($)</label>
                            <input required type="number" step="0.01" min="0" className="input" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className="text-sm text-muted">Quantity</label>
                            <input required type="number" min="0" step="1" className="input" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label className="text-sm text-muted">Store</label>
                        <select required className="input" value={formData.storeId} onChange={e => setFormData({ ...formData, storeId: e.target.value })}>
                            <option value="" disabled>Select a store</option>
                            {stores.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-between items-center">
                        {mutation.isError && <span className="text-sm" style={{ color: 'var(--danger-color)' }}>Failed to save product.</span>}
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={mutation.isPending}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
                                {mutation.isPending ? 'Saving...' : 'Save Product'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)'
};

const modalStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '500px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};
