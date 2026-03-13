import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState, Loader, ErrorState } from '../States';

describe('EmptyState', () => {
    it('renders the title', () => {
        render(<EmptyState title="Nothing here" />);
        expect(screen.getByText('Nothing here')).toBeInTheDocument();
    });

    it('renders optional description', () => {
        render(<EmptyState title="T" description="Some description" />);
        expect(screen.getByText('Some description')).toBeInTheDocument();
    });

    it('renders optional icon', () => {
        render(<EmptyState title="T" icon={<span data-testid="icon" />} />);
        expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('renders children', () => {
        render(<EmptyState title="T"><button>Action</button></EmptyState>);
        expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });

    it('does not render description section when omitted', () => {
        const { container } = render(<EmptyState title="T" />);
        expect(container.querySelector('p')).toBeNull();
    });
});

describe('Loader', () => {
    it('shows default loading text', () => {
        render(<Loader />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('shows custom text', () => {
        render(<Loader text="Fetching data..." />);
        expect(screen.getByText('Fetching data...')).toBeInTheDocument();
    });
});

describe('ErrorState', () => {
    it('shows default error message', () => {
        render(<ErrorState />);
        expect(screen.getByText('An error occurred.')).toBeInTheDocument();
    });

    it('shows custom message', () => {
        render(<ErrorState message="Something went wrong" />);
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('shows optional subMessage', () => {
        render(<ErrorState message="Oops" subMessage="Please try again" />);
        expect(screen.getByText('Please try again')).toBeInTheDocument();
    });

    it('renders children', () => {
        render(<ErrorState><button>Retry</button></ErrorState>);
        expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    });
});
