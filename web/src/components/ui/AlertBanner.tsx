import React from 'react';

interface AlertBannerProps {
    message: string;
    onDismiss: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ message, onDismiss }) => {
    return (
        <div className="card mb-4" style={{ borderLeft: '3px solid var(--danger-color)', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-sm" style={{ color: 'var(--danger-color)' }}>{message}</span>
            <button className="btn btn-secondary text-sm" onClick={onDismiss}>Dismiss</button>
        </div>
    );
};
