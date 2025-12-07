import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
    it('renders without crashing', () => {
        render(<App />);
        // We can check if basic routing elements are present or if header is present
        // Since App has routing, we might need to check if one of the initial route components renders
        // or just check if the container renders.
        // However, App renders providers and Router.
        // Let's check for something that should definitely be there or just that it doesn't throw.
        expect(document.body).toBeInTheDocument();
    });
});
