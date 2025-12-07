import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
    it('merges class names correctly', () => {
        // Basic merging
        expect(cn('w-full', 'h-full')).toBe('w-full h-full');

        // Tailwind merge
        expect(cn('p-2', 'p-4')).toBe('p-4');

        // Conditional logic
        expect(cn('bloack', true && 'hidden', false && 'flex')).toBe('bloack hidden');
    });
});
