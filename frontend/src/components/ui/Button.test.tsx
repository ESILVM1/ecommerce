import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByText('Click me'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies default variant styling', () => {
    render(<Button>Default Button</Button>);
    const button = screen.getByText('Default Button');
    
    expect(button).toHaveClass('bg-primary-600');
  });

  it('applies outline variant styling', () => {
    render(<Button variant="outline">Outline Button</Button>);
    const button = screen.getByText('Outline Button');
    
    expect(button).toHaveClass('border');
    expect(button).toHaveClass('bg-white');
  });

  it('applies destructive variant styling', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByText('Delete');
    
    expect(button).toHaveClass('bg-red-600');
  });

  it('applies different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByText('Small')).toHaveClass('h-9');
    
    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByText('Large')).toHaveClass('h-11');
  });

  it('shows loading state', () => {
    render(<Button isLoading>Submit</Button>);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Submit')).not.toBeInTheDocument();
  });

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    
    expect(screen.getByText('Disabled')).toBeDisabled();
  });

  it('disables button when loading', () => {
    render(<Button isLoading>Loading</Button>);
    
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('prevents click when disabled', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick} disabled>Disabled</Button>);
    await user.click(screen.getByText('Disabled'));
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    
    expect(screen.getByText('Custom')).toHaveClass('custom-class');
  });
});
