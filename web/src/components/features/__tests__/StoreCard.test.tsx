import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StoreCard } from '../StoreCard';
import type { Store } from '../../../types';

const makeStore = (overrides: Partial<Store> = {}): Store => ({
    id: 'store-1',
    name: 'Test Store',
    location: 'Lagos, Nigeria',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    ...overrides,
});

function renderCard(store: Store) {
    return render(
        <MemoryRouter>
            <StoreCard store={store} />
        </MemoryRouter>
    );
}

describe('StoreCard', () => {
    it('renders the store name', () => {
        renderCard(makeStore());
        expect(screen.getByText('Test Store')).toBeInTheDocument();
    });

    it('renders the store location', () => {
        renderCard(makeStore({ location: 'Abuja' }));
        expect(screen.getByText('Abuja')).toBeInTheDocument();
    });

    it('shows fallback text when location is null', () => {
        renderCard(makeStore({ location: null }));
        expect(screen.getByText('No location specified')).toBeInTheDocument();
    });

    it('links to the correct store route', () => {
        renderCard(makeStore({ id: 'store-42' }));
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/stores/store-42');
    });

    it('renders the Manage Inventory button', () => {
        renderCard(makeStore());
        expect(screen.getByText('Manage Inventory')).toBeInTheDocument();
    });
});
