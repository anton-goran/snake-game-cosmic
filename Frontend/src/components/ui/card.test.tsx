import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './card';

describe('Card', () => {
    it('renders content correctly', () => {
        render(
            <Card>
                <CardHeader>
                    <CardTitle>Card Title</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Card Content</p>
                </CardContent>
                <CardFooter>
                    <button>Action</button>
                </CardFooter>
            </Card>
        );

        expect(screen.getByText('Card Title')).toBeInTheDocument();
        expect(screen.getByText('Card Content')).toBeInTheDocument();
        expect(screen.getByText('Action')).toBeInTheDocument();
    });
});
