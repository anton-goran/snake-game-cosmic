import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

const TestComponent = () => {
    const { loading, user } = useAuth();
    if (loading) return <div>Loading...</div>;
    return <div>{user ? 'Logged In' : 'Logged Out'}</div>;
};

describe('AuthContext', () => {
    it('provides initial state', async () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        // Should initially be loading (async check for persistent user)
        expect(screen.getByText('Loading...')).toBeInTheDocument();

        // After effect resolves, should show logged out (mock default)
        await waitFor(() => {
            expect(screen.getByText('Logged Out')).toBeInTheDocument();
        });
    });
});
