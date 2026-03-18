import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginationMeta } from '../../types';

interface PaginationProps {
    meta: PaginationMeta;
    onPageChange: (page: number) => void;
}

export function getPageNumbers(current: number, total: number): (number | '...')[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (current > 3) pages.push('...');
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i);
    }
    if (current < total - 2) pages.push('...');
    pages.push(total);
    return pages;
}

export const Pagination: React.FC<PaginationProps> = ({ meta, onPageChange }) => {
    const { total, page, limit, totalPages } = meta;

    if (total === 0) return null;

    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);

    return (
        <div className="flex items-center justify-between" style={{ padding: '1rem' }}>
            <span className="text-sm text-muted">
                Showing {start}–{end} of {total} results
            </span>
            <div className="flex items-center gap-2">
                <button
                    className="btn btn-secondary text-sm"
                    disabled={page === 1}
                    onClick={() => onPageChange(page - 1)}
                >
                    <ChevronLeft size={16} /> Prev
                </button>
                {getPageNumbers(page, totalPages).map((p, i) => (
                    p === '...' ? (
                        <span key={`ellipsis-${i}`} className="text-sm text-muted" style={{ padding: '0 0.25rem' }}>...</span>
                    ) : (
                        <button
                            key={p}
                            className={`btn text-sm ${p === page ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => onPageChange(p)}
                        >
                            {p}
                        </button>
                    )
                ))}
                <button
                    className="btn btn-secondary text-sm"
                    disabled={page >= totalPages}
                    onClick={() => onPageChange(page + 1)}
                >
                    Next <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};
