import React from 'react';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    children?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, children }) => {
    return (
        <div className="empty-state card">
            {icon && <div className="mb-4 text-muted">{icon}</div>}
            <h3>{title}</h3>
            {description && <p className="text-muted mt-4">{description}</p>}
            {children && <div className="mt-4">{children}</div>}
        </div>
    );
};

export const Loader: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => (
    <div className="empty-state">
        <div className="loader mb-4"></div>
        <p>{text}</p>
    </div>
);

export const ErrorState: React.FC<{ message?: string, subMessage?: string, children?: React.ReactNode }> = ({
    message = 'An error occurred.',
    subMessage,
    children
}) => (
    <div className="empty-state">
        <p style={{ color: 'var(--danger-color)' }}>{message}</p>
        {subMessage && <p className="text-sm text-muted mt-4">{subMessage}</p>}
        {children}
    </div>
);
