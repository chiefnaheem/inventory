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

type FormErrors = Partial<Record<'name' | 'category' | 'price' | 'quantity' | 'storeId', string>>;

export function validate(formData: { name: string; category: string; price: string; quantity: string; storeId: string }): FormErrors {
    const errors: FormErrors = {};

    if (!formData.name.trim()) errors.name = 'Name is required.';
    else if (formData.name.trim().length > 200) errors.name = 'Name must be 200 characters or less.';

    if (!formData.category.trim()) errors.category = 'Category is required.';
    else if (formData.category.trim().length > 100) errors.category = 'Category must be 100 characters or less.';

    const price = Number(formData.price);
    if (!formData.price) errors.price = 'Price is required.';
    else if (isNaN(price) || price <= 0) errors.price = 'Price must be greater than 0.';
    else if (price > 1_000_000) errors.price = 'Price cannot exceed 1,000,000.';

    const qty = Number(formData.quantity);
    if (formData.quantity === '') errors.quantity = 'Quantity is required.';
    else if (isNaN(qty) || qty < 0 || !Number.isInteger(qty)) errors.quantity = 'Quantity must be a whole number (0 or more).';
    else if (qty > 1_000_000) errors.quantity = 'Quantity cannot exceed 1,000,000.';

    if (!formData.storeId) errors.storeId = 'Please select a store.';

    return errors;
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

    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<Set<string>>(new Set());
    const [submitted, setSubmitted] = useState(false);

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
        setErrors({});
        setTouched(new Set());
        setSubmitted(false);
    }, [product, defaultStoreId, stores, isOpen]);

    useEffect(() => {
        if (submitted || touched.size > 0) {
            const newErrors = validate(formData);
            const visible: FormErrors = {};
            for (const key of Object.keys(newErrors) as (keyof FormErrors)[]) {
                if (submitted || touched.has(key)) {
                    visible[key] = newErrors[key];
                }
            }
            setErrors(visible);
        }
    }, [formData, touched, submitted]);

    const mutation = useMutation({
        mutationFn: (data: any) => isEditing ? api.updateProduct(product!.id, data) : api.createProduct(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['store'] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            onClose();
        }
    });

    const handleBlur = (field: string) => {
        setTouched(prev => new Set(prev).add(field));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        const allErrors = validate(formData);
        setErrors(allErrors);

        if (Object.keys(allErrors).length > 0) return;

        mutation.mutate({
            ...formData,
            name: formData.name.trim(),
            category: formData.category.trim(),
            price: Number(formData.price),
            quantity: Number(formData.quantity)
        });
    };

    if (!isOpen) return null;

    const hasError = (field: keyof FormErrors) => !!errors[field];

    return (
        <div style={overlayStyle} role="dialog" aria-modal="true" aria-label={isEditing ? 'Edit Product' : 'Add Product'}>
            <div style={modalStyle} className="card">
                <div className="flex items-center justify-between mb-4">
                    <h2>{isEditing ? 'Edit Product' : 'Add Product'}</h2>
                    <button onClick={onClose} aria-label="Close modal" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <fieldset disabled={mutation.isPending} style={{ border: 'none', padding: 0, margin: 0 }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label className="text-sm text-muted">Name</label>
                            <input
                                type="text"
                                maxLength={200}
                                className="input"
                                style={hasError('name') ? inputErrorStyle : undefined}
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                onBlur={() => handleBlur('name')}
                            />
                            {hasError('name') && <span style={errorTextStyle}>{errors.name}</span>}
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label className="text-sm text-muted">Category</label>
                            <input
                                type="text"
                                maxLength={100}
                                className="input"
                                style={hasError('category') ? inputErrorStyle : undefined}
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                onBlur={() => handleBlur('category')}
                            />
                            {hasError('category') && <span style={errorTextStyle}>{errors.category}</span>}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <label className="text-sm text-muted">Price ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    max="1000000"
                                    className="input"
                                    style={hasError('price') ? inputErrorStyle : undefined}
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    onBlur={() => handleBlur('price')}
                                />
                                {hasError('price') && <span style={errorTextStyle}>{errors.price}</span>}
                            </div>
                            <div style={{ flex: 1 }}>
                                <label className="text-sm text-muted">Quantity</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="1000000"
                                    step="1"
                                    className="input"
                                    style={hasError('quantity') ? inputErrorStyle : undefined}
                                    value={formData.quantity}
                                    onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                                    onBlur={() => handleBlur('quantity')}
                                />
                                {hasError('quantity') && <span style={errorTextStyle}>{errors.quantity}</span>}
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label className="text-sm text-muted">Store</label>
                            <select
                                className="input"
                                style={hasError('storeId') ? inputErrorStyle : undefined}
                                value={formData.storeId}
                                onChange={e => setFormData({ ...formData, storeId: e.target.value })}
                                onBlur={() => handleBlur('storeId')}
                            >
                                <option value="" disabled>Select a store</option>
                                {stores.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                            {hasError('storeId') && <span style={errorTextStyle}>{errors.storeId}</span>}
                        </div>
                    </fieldset>

                    <div className="flex justify-between items-center">
                        {mutation.isError && (
                            <span className="text-sm" style={{ color: 'var(--danger-color)' }}>
                                {(mutation.error as Error)?.message || 'Failed to save product.'}
                            </span>
                        )}
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

const inputErrorStyle: React.CSSProperties = {
    borderColor: 'var(--danger-color)',
};

const errorTextStyle: React.CSSProperties = {
    color: 'var(--danger-color)',
    fontSize: '0.75rem',
    marginTop: '0.25rem',
    display: 'block',
};
