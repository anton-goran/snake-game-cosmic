import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Login from './Login';
import { AuthProvider } from '@/contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';

describe('Login', () => {
    it('renders login form correctly', () => {
        render(
            <AuthProvider>
                <BrowserRouter>
                    <Login />
                </BrowserRouter>
            </AuthProvider>
        );

        expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });
});
