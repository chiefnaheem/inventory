import React from 'react';
import type { Store } from '../../types';

interface FilterState {
    storeId: string;
    category: string;
    inStock: string;
    minPrice: string;
    maxPrice: string;
}

interface ProductFiltersProps {
    filters: FilterState;
    onChange: (filters: FilterState) => void;
    stores: Store[];
    categories: string[];
}

const emptyFilters: FilterState = {
    storeId: '',
    category: '',
    inStock: '',
    minPrice: '',
    maxPrice: '',
};

export const hasActiveFilters = (filters: FilterState) =>
    Object.values(filters).some(v => v !== '');

export const ProductFilters: React.FC<ProductFiltersProps> = ({ filters, onChange, stores, categories }) => {
    const update = (key: keyof FilterState, value: string) => {
        onChange({ ...filters, [key]: value });
    };

    return (
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <label className="text-sm text-muted">Store:</label>
                    <select
                        className="input"
                        style={{ width: 'auto', minWidth: '160px' }}
                        value={filters.storeId}
                        onChange={(e) => update('storeId', e.target.value)}
                    >
                        <option value="">All Stores</option>
                        {stores.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <label className="text-sm text-muted">Category:</label>
                    <select
                        className="input"
                        style={{ width: 'auto', minWidth: '160px' }}
                        value={filters.category}
                        onChange={(e) => update('category', e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {categories.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <label className="text-sm text-muted">Stock:</label>
                    <select
                        className="input"
                        style={{ width: 'auto', minWidth: '130px' }}
                        value={filters.inStock}
                        onChange={(e) => update('inStock', e.target.value)}
                    >
                        <option value="">All</option>
                        <option value="true">In Stock</option>
                        <option value="false">Out of Stock</option>
                    </select>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <label className="text-sm text-muted">Price:</label>
                    <input
                        type="number"
                        className="input"
                        placeholder="Min"
                        min="0"
                        style={{ width: '100px' }}
                        value={filters.minPrice}
                        onChange={(e) => update('minPrice', e.target.value)}
                    />
                    <span className="text-sm text-muted">–</span>
                    <input
                        type="number"
                        className="input"
                        placeholder="Max"
                        min="0"
                        style={{ width: '100px' }}
                        value={filters.maxPrice}
                        onChange={(e) => update('maxPrice', e.target.value)}
                    />
                </div>

                {hasActiveFilters(filters) && (
                    <button
                        className="btn btn-secondary text-sm"
                        onClick={() => onChange(emptyFilters)}
                    >
                        Clear All Filters
                    </button>
                )}
            </div>
        </div>
    );
};
