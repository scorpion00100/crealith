import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
    it('renders button with text', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('handles click events', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click me</Button>);

        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('applies variant classes correctly', () => {
        render(<Button variant="primary">Primary Button</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('bg-primary-500');
    });

    it('applies size classes correctly', () => {
        render(<Button size="lg">Large Button</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('px-6', 'py-3');
    });

    it('can be disabled', () => {
        render(<Button disabled>Disabled Button</Button>);
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
    });

    it('shows loading state', () => {
        render(<Button loading>Loading Button</Button>);
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        expect(screen.getByText('Loading Button')).toBeInTheDocument();
    });

    it('renders as different HTML elements', () => {
        render(<Button as="a" href="/test">Link Button</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('href', '/test');
    });
});
