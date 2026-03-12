import { Store as StoreIcon } from 'lucide-react';
import { useStores } from '../hooks/useQueries';
import { Loader, ErrorState, EmptyState } from '../components/ui/States';
import { StoreCard } from '../components/features/StoreCard';

export default function StoresMap() {
    const { data: stores, isLoading, error } = useStores();

    if (isLoading) return <Loader text="Loading stores..." />;

    if (error) {
        return (
            <ErrorState
                message="Failed to load stores."
                subMessage="Make sure the backend is running."
            />
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h1>Retail Stores Dashboard</h1>
            </div>

            {stores?.length === 0 ? (
                <EmptyState
                    icon={<StoreIcon size={48} />}
                    title="No stores found"
                    description="Run the seed script to populate data."
                />
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {stores?.map((store) => (
                        <StoreCard key={store.id} store={store as any} />
                    ))}
                </div>
            )}
        </div>
    );
}
