import { describe, it, expect } from 'vitest';
import { getPageNumbers } from '../components/ui/Pagination';

describe('getPageNumbers', () => {
    it('returns all pages when total <= 7', () => {
        expect(getPageNumbers(1, 1)).toEqual([1]);
        expect(getPageNumbers(1, 5)).toEqual([1, 2, 3, 4, 5]);
        expect(getPageNumbers(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it('truncates with ellipsis at the start when current page is near end', () => {
        const result = getPageNumbers(9, 10);
        expect(result).toEqual([1, '...', 8, 9, 10]);
    });

    it('truncates with ellipsis at the end when current page is near start', () => {
        const result = getPageNumbers(2, 10);
        expect(result).toEqual([1, 2, 3, '...', 10]);
    });

    it('truncates both sides when current page is in the middle', () => {
        const result = getPageNumbers(5, 10);
        expect(result).toEqual([1, '...', 4, 5, 6, '...', 10]);
    });

    it('handles page 1 of many', () => {
        const result = getPageNumbers(1, 20);
        expect(result[0]).toBe(1);
        expect(result[result.length - 1]).toBe(20);
    });

    it('handles last page', () => {
        const result = getPageNumbers(20, 20);
        expect(result[0]).toBe(1);
        expect(result[result.length - 1]).toBe(20);
    });

    it('always includes first and last page', () => {
        for (let current = 1; current <= 15; current++) {
            const result = getPageNumbers(current, 15);
            expect(result[0]).toBe(1);
            expect(result[result.length - 1]).toBe(15);
        }
    });
});
