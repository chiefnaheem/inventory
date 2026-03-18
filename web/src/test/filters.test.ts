import { describe, it, expect } from 'vitest';
import { hasActiveFilters } from '../components/features/ProductFilters';

describe('hasActiveFilters', () => {
    it('returns false when all filters are empty', () => {
        expect(hasActiveFilters({
            storeId: '', category: '', inStock: '', minPrice: '', maxPrice: '',
        })).toBe(false);
    });

    it('returns true when storeId is set', () => {
        expect(hasActiveFilters({
            storeId: 'abc', category: '', inStock: '', minPrice: '', maxPrice: '',
        })).toBe(true);
    });

    it('returns true when price range is set', () => {
        expect(hasActiveFilters({
            storeId: '', category: '', inStock: '', minPrice: '10', maxPrice: '',
        })).toBe(true);
    });

    it('returns true when inStock is set', () => {
        expect(hasActiveFilters({
            storeId: '', category: '', inStock: 'true', minPrice: '', maxPrice: '',
        })).toBe(true);
    });
});
