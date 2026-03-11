import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Link } from 'react-router-dom';
import { Store } from 'lucide-react';

export default function StoresMap() {
    const { data: stores, isLoading, error } = useQuery({
        queryKey: ['stores'],
        queryFn: api.getStores
    });

    if (isLoading) {
        return (
            <div className="empty-state">
                <div className="loader mb-4"></div>
                <p>Loading stores...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="empty-state">
                <p style={{ color: 'var(--danger-color)' }}>Failed to load stores.</p>
                <p className="text-sm text-muted mt-4">Make sure the backend is running.</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h1>Retail Stores Dashboard</h1>
            </div>

            {stores?.length === 0 ? (
                <div className="empty-state card">
                    <Store size={48} className="mb-4 text-muted" />
                    <h3>No stores found</h3>
                    <p className="text-muted mt-4">Run the seed script to populate data.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {stores?.map((store: any) => (
                        <Link key={store.id} to={`/stores/${store.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <div className="flex items-center gap-2 mb-4">
                                    <Store size={24} style={{ color: 'var(--brand-primary)' }} />
                                    <h2>{store.name}</h2>
                                </div>
                                <p className="text-muted text-sm">{store.location || 'No location specified'}</p>
                                <div style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
                                    <span className="btn btn-secondary w-full" style={{ width: '100%' }}>Manage Inventory</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
