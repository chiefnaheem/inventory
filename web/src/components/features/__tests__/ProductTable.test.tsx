import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductTable } from '../ProductTable';
import type { Product } from '../../../types';

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
    id: '1',
    storeId: 's1',
    name: 'Widget',
    category: 'Tools',
    price: 19.99,
    quantity: 20,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    store: { name: 'Main Store' },
    ...overrides,
});

describe('ProductTable', () => {
    it('renders product rows', () => {
        render(<ProductTable products={[makeProduct()]} />);
        expect(screen.getByText('Widget')).toBeInTheDocument();
        expect(screen.getByText('Tools')).toBeInTheDocument();
        expect(screen.getByText('$19.99')).toBeInTheDocument();
        expect(screen.getByText('20')).toBeInTheDocument();
    });

    it('shows empty message when no products', () => {
        render(<ProductTable products={[]} emptyMessage="Nothing here" />);
        expect(screen.getByText('Nothing here')).toBeInTheDocument();
    });

    it('uses default empty message', () => {
        render(<ProductTable products={[]} />);
        expect(screen.getByText('No products found.')).toBeInTheDocument();
    });

    it('shows Store column by default', () => {
        render(<ProductTable products={[makeProduct()]} />);
        expect(screen.getByRole('columnheader', { name: 'Store' })).toBeInTheDocument();
        expect(screen.getByText('Main Store')).toBeInTheDocument();
    });

    it('hides Store column when hideStoreColumn=true', () => {
        render(<ProductTable products={[makeProduct()]} hideStoreColumn />);
        expect(screen.queryByRole('columnheader', { name: 'Store' })).toBeNull();
        expect(screen.queryByText('Main Store')).toBeNull();
    });

    it('calls onEdit with the product when Edit is clicked', async () => {
        const onEdit = vi.fn();
        const product = makeProduct();
        render(<ProductTable products={[product]} onEdit={onEdit} />);

        await userEvent.click(screen.getByRole('button', { name: 'Edit' }));

        expect(onEdit).toHaveBeenCalledOnce();
        expect(onEdit).toHaveBeenCalledWith(product);
    });

    it('renders multiple products', () => {
        const products = [
            makeProduct({ id: '1', name: 'Alpha' }),
            makeProduct({ id: '2', name: 'Beta' }),
        ];
        render(<ProductTable products={products} />);
        expect(screen.getByText('Alpha')).toBeInTheDocument();
        expect(screen.getByText('Beta')).toBeInTheDocument();
    });

    it('highlights low-stock quantity with danger color', () => {
        const product = makeProduct({ quantity: 5 });
        render(<ProductTable products={[product]} />);
        const qtyCell = screen.getByText('5');
        expect(qtyCell).toHaveStyle({ color: 'var(--danger-color)' });
    });

    it('does not apply danger color for stock >= 10', () => {
        const product = makeProduct({ quantity: 10 });
        render(<ProductTable products={[product]} />);
        const qtyCell = screen.getByText('10');
        expect(qtyCell).not.toHaveStyle({ color: 'var(--danger-color)' });
    });
});
