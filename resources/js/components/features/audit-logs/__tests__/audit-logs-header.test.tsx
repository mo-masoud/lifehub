import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AuditLogsHeader } from '../audit-logs-header';

// Mock dependencies
vi.mock('@/components/shared/heading', () => ({
    default: ({ title, description, icon }: any) => (
        <div data-testid="heading">
            <h1>{title}</h1>
            <p>{description}</p>
            <div data-testid="icon">{icon?.name || 'Icon'}</div>
        </div>
    ),
}));

vi.mock('@/components/ui/button', () => ({
    Button: ({ children, asChild, size, variant, className }: any) => <div className={`button ${variant} ${size} ${className}`}>{children}</div>,
}));

vi.mock('@inertiajs/react', () => ({
    Link: ({ href, children, prefetch }: any) => (
        <a href={href} data-prefetch={prefetch} data-testid="refresh-link">
            {children}
        </a>
    ),
}));

vi.mock('lucide-react', () => ({
    FileText: { name: 'FileText' },
    RefreshCcw: () => <span data-testid="refresh-icon">RefreshCcw</span>,
}));

// Mock global route function
vi.stubGlobal('route', vi.fn().mockReturnValue('/passwords/audit-logs'));

describe('AuditLogsHeader', () => {
    it('renders the header with correct title and description', () => {
        render(<AuditLogsHeader />);

        expect(screen.getByText('Audit Logs')).toBeInTheDocument();
        expect(screen.getByText('View password activity history and security events.')).toBeInTheDocument();
        expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('renders the refresh button with correct link', () => {
        render(<AuditLogsHeader />);

        const refreshLink = screen.getByTestId('refresh-link');
        expect(refreshLink).toBeInTheDocument();
        expect(refreshLink).toHaveAttribute('href', '/passwords/audit-logs');
        expect(refreshLink).toHaveAttribute('data-prefetch', 'true');
        expect(screen.getByTestId('refresh-icon')).toBeInTheDocument();
    });

    it('applies correct CSS classes to refresh button', () => {
        render(<AuditLogsHeader />);

        const refreshButton = screen.getByTestId('refresh-link').closest('.button');
        expect(refreshButton).toHaveClass('ghost', 'hidden', 'md:inline-flex');
    });

    it('renders heading with FileText icon', () => {
        render(<AuditLogsHeader />);

        const icon = screen.getByTestId('icon');
        expect(icon).toHaveTextContent('FileText');
    });

    it('calls route function with correct parameters', () => {
        render(<AuditLogsHeader />);

        expect(vi.mocked(route)).toHaveBeenCalledWith('passwords.audit-logs.index');
    });

    it('renders layout structure correctly', () => {
        render(<AuditLogsHeader />);

        // Just check that both main elements are present
        const heading = screen.getByTestId('heading');
        const refreshLink = screen.getByTestId('refresh-link');

        expect(heading).toBeInTheDocument();
        expect(refreshLink).toBeInTheDocument();
    });

    it('renders without any props', () => {
        // This component doesn't take any props
        expect(() => render(<AuditLogsHeader />)).not.toThrow();
    });

    it('has accessible heading structure', () => {
        render(<AuditLogsHeader />);

        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toHaveTextContent('Audit Logs');
    });

    it('refresh icon is properly integrated', () => {
        render(<AuditLogsHeader />);

        const refreshIcon = screen.getByTestId('refresh-icon');
        expect(refreshIcon).toBeInTheDocument();
        expect(refreshIcon).toHaveTextContent('RefreshCcw');
    });
});
