import { describe, it, expect } from 'vitest';
import { validate } from '../components/features/ProductModal';

const validForm = {
    name: 'MacBook Pro',
    category: 'Laptops',
    price: '2499.99',
    quantity: '15',
    storeId: 'abc-123',
};

describe('validate', () => {
    it('returns no errors for valid form data', () => {
        expect(validate(validForm)).toEqual({});
    });

    it('requires name', () => {
        const result = validate({ ...validForm, name: '' });
        expect(result.name).toBe('Name is required.');
    });

    it('requires name after trimming whitespace', () => {
        const result = validate({ ...validForm, name: '   ' });
        expect(result.name).toBe('Name is required.');
    });

    it('rejects name over 200 characters', () => {
        const result = validate({ ...validForm, name: 'a'.repeat(201) });
        expect(result.name).toBe('Name must be 200 characters or less.');
    });

    it('requires category', () => {
        const result = validate({ ...validForm, category: '' });
        expect(result.category).toBe('Category is required.');
    });

    it('rejects category over 100 characters', () => {
        const result = validate({ ...validForm, category: 'a'.repeat(101) });
        expect(result.category).toBe('Category must be 100 characters or less.');
    });

    it('requires price', () => {
        const result = validate({ ...validForm, price: '' });
        expect(result.price).toBe('Price is required.');
    });

    it('rejects zero price', () => {
        const result = validate({ ...validForm, price: '0' });
        expect(result.price).toBe('Price must be greater than 0.');
    });

    it('rejects negative price', () => {
        const result = validate({ ...validForm, price: '-10' });
        expect(result.price).toBe('Price must be greater than 0.');
    });

    it('rejects price over 1,000,000', () => {
        const result = validate({ ...validForm, price: '1000001' });
        expect(result.price).toBe('Price cannot exceed 1,000,000.');
    });

    it('requires quantity', () => {
        const result = validate({ ...validForm, quantity: '' });
        expect(result.quantity).toBe('Quantity is required.');
    });

    it('rejects negative quantity', () => {
        const result = validate({ ...validForm, quantity: '-1' });
        expect(result.quantity).toBe('Quantity must be a whole number (0 or more).');
    });

    it('rejects decimal quantity', () => {
        const result = validate({ ...validForm, quantity: '3.5' });
        expect(result.quantity).toBe('Quantity must be a whole number (0 or more).');
    });

    it('allows zero quantity', () => {
        const result = validate({ ...validForm, quantity: '0' });
        expect(result.quantity).toBeUndefined();
    });

    it('requires storeId', () => {
        const result = validate({ ...validForm, storeId: '' });
        expect(result.storeId).toBe('Please select a store.');
    });

    it('returns multiple errors at once', () => {
        const result = validate({ name: '', category: '', price: '', quantity: '', storeId: '' });
        expect(Object.keys(result)).toHaveLength(5);
    });
});
