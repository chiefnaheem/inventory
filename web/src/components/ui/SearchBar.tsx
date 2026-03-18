import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    debounceMs?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    value: debouncedValue,
    onChange,
    placeholder = 'Search...',
    debounceMs = 300,
}) => {
    const [localValue, setLocalValue] = useState('');
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

    useEffect(() => {
        return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
    }, []);

    useEffect(() => {
        if (debouncedValue === '' && localValue !== '') setLocalValue('');
    }, [debouncedValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setLocalValue(val);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => onChange(val), debounceMs);
    };

    const clear = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setLocalValue('');
        onChange('');
    };

    return (
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', color: 'var(--text-secondary)' }} />
            <input
                type="text"
                className="input"
                placeholder={placeholder}
                style={{ paddingLeft: '2.5rem', paddingRight: localValue ? '2.5rem' : '1rem', width: '100%' }}
                value={localValue}
                onChange={handleChange}
            />
            {localValue && (
                <button
                    onClick={clear}
                    aria-label="Clear search"
                    style={{ position: 'absolute', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}
                >
                    <X size={16} />
                </button>
            )}
        </div>
    );
};
