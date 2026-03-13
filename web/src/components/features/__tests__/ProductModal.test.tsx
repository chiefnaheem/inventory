import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { ProductModal } from '../ProductModal';
import { api } from '../../../lib/api';
import type { Product, Store } from '../../../types';

vi.mock('../../../lib/api', () => ({
    api: {
        createProduct: vi.fn(),
        updateProduct: vi.fn(),
    },
}));

const stores: Store[] = [
    { id: 's1', name: 'Store One', location: 'Lagos', createdAt: '', updatedAt: '' },
    { id: 's2', name: 'Store Two', location: 'Abuja', createdAt: '', updatedAt: '' },
];

const existingProduct: Product = {
    id: 'p1',
    storeId: 's1',
    name: 'Widget',
    category: 'Tools',
    price: 9.99,
    quantity: 5,
    createdAt: '',
    updatedAt: '',
};

function renderModal(props: Partial<React.ComponentProps<typeof ProductModal>> = {}) {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(
        React.createElement(
            QueryClientProvider,
            { client: queryClient },
            React.createElement(ProductModal, {
                isOpen: true,
                onClose: vi.fn(),
                stores,
                ...props,
            })
        )
    );
}

beforeEach(() => {
    vi.resetAllMocks();
});

describe('ProductModal', () => {
    it('renders nothing when isOpen is false', () => {
        renderModal({ isOpen: false });
        expect(screen.queryByText('Add Product')).toBeNull();
    });

    it('shows "Add Product" title in create mode', () => {
        renderModal();
        expect(screen.getByText('Add Product')).toBeInTheDocument();
    });

    it('shows "Edit Product" title in edit mode', () => {
        renderModal({ product: existingProduct });
        expect(screen.getByText('Edit Product')).toBeInTheDocument();
    });

    it('pre-fills form fields when editing', () => {
        renderModal({ product: existingProduct });
        expect(screen.getByDisplayValue('Widget')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Tools')).toBeInTheDocument();
        expect(screen.getByDisplayValue('9.99')).toBeInTheDocument();
        expect(screen.getByDisplayValue('5')).toBeInTheDocument();
    });

    it('starts with empty fields in create mode', () => {
        renderModal();
        const textInputs = screen.getAllByRole('textbox');
        textInputs.forEach(input => expect(input).toHaveValue(''));
    });

    it('calls onClose when Cancel is clicked', async () => {
        const onClose = vi.fn();
        renderModal({ onClose });
        await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(onClose).toHaveBeenCalledOnce();
    });

    it('calls onClose when the X button is clicked', async () => {
        const onClose = vi.fn();
        renderModal({ onClose });
        // X button has no label — find by its position near the title
        const buttons = screen.getAllByRole('button');
        const closeBtn = buttons.find(b => !b.textContent?.match(/cancel|save/i));
        await userEvent.click(closeBtn!);
        expect(onClose).toHaveBeenCalledOnce();
    });

    it('calls api.createProduct on submit in create mode', async () => {
        vi.mocked(api.createProduct).mockResolvedValue(existingProduct);
        const onClose = vi.fn();
        renderModal({ onClose, defaultStoreId: 's1' });

        const [nameInput, categoryInput] = screen.getAllByRole('textbox');
        const [priceInput, quantityInput] = screen.getAllByRole('spinbutton');

        await userEvent.type(nameInput, 'New Item');
        await userEvent.type(categoryInput, 'Gadgets');
        await userEvent.type(priceInput, '15.50');
        await userEvent.type(quantityInput, '3');

        await userEvent.click(screen.getByRole('button', { name: 'Save Product' }));

        await waitFor(() => expect(api.createProduct).toHaveBeenCalledOnce());
        const call = vi.mocked(api.createProduct).mock.calls[0][0];
        expect(call.name).toBe('New Item');
        expect(call.category).toBe('Gadgets');
        expect(call.price).toBe(15.5);
        expect(call.quantity).toBe(3);
    });

    it('calls api.updateProduct on submit in edit mode', async () => {
        vi.mocked(api.updateProduct).mockResolvedValue(existingProduct);
        renderModal({ product: existingProduct });

        await userEvent.click(screen.getByRole('button', { name: 'Save Product' }));

        await waitFor(() => expect(api.updateProduct).toHaveBeenCalledOnce());
        expect(vi.mocked(api.updateProduct).mock.calls[0][0]).toBe('p1');
    });

    it('renders store options in the dropdown', () => {
        renderModal();
        expect(screen.getByRole('option', { name: 'Store One' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Store Two' })).toBeInTheDocument();
    });
});
