import React from 'react';
import { Store as StoreIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Store } from '../../types';

interface StoreCardProps {
    store: Store;
}

export const StoreCard: React.FC<StoreCardProps> = ({ store }) => {
    return (
        <Link to={`/stores/${store.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div className="flex items-center gap-2 mb-4">
                    <StoreIcon size={24} style={{ color: 'var(--brand-primary)' }} />
                    <h2>{store.name}</h2>
                </div>
                <p className="text-muted text-sm">{store.location || 'No location specified'}</p>
                <div style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
                    <span className="btn btn-secondary w-full" style={{ width: '100%', textAlign: 'center', display: 'block' }}>Manage Inventory</span>
                </div>
            </div>
        </Link>
    );
};
