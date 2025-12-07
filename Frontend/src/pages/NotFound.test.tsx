import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NotFound from './NotFound';
import { BrowserRouter } from 'react-router-dom';

describe('NotFound', () => {
    it('renders 404 message', () => {
        // Mock useLocation since NotFound uses it
        vi.mock('react-router-dom', async () => {
            const actual = await vi.importActual('react-router-dom');
            return {
                ...actual,
                useLocation: () => ({ pathname: '/invalid-route' }),
            };
        });

        render(
            <BrowserRouter>
                <NotFound />
            </BrowserRouter>
        );

        expect(screen.getByText('404')).toBeInTheDocument();
        expect(screen.getByText('Oops! Page not found')).toBeInTheDocument();
        expect(screen.getByText('Return to Home')).toBeInTheDocument();
    });
});
