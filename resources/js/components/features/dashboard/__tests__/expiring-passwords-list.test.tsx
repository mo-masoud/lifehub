import { Password } from '@/types/passwords';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExpiringPasswordsList } from '../expiring-passwords-list';

// Mock dependencies
const mockOpenSheet = vi.fn();
const mockRoute = vi.fn((name: string) => `/mock-route/${name}`);

vi.mock('@/components/features/passwords/passwords-table', () => ({
    PasswordsTable: ({ passwords, hasFullFunctionality }: any) => (
        <div data-testid="passwords-table" data-has-full-functionality={hasFullFunctionality}>
            {passwords.map((password: Password) => (
                <div key={password.id} data-testid="password-item">
                    {password.name}
                </div>
            ))}
        </div>
    ),
}));

vi.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, className, asChild, variant }: any) => {
        const commonProps = { onClick, className, 'data-variant': variant };

        if (asChild && children?.type === 'a') {
            return (
                <a {...commonProps} href={children.props.href}>
                    {children.props.children}
                </a>
            );
        }

        return <button {...commonProps}>{children}</button>;
    },
}));

vi.mock('@/contexts', () => ({
    useCreatePassword: () => ({ openSheet: mockOpenSheet }),
}));

vi.mock('@inertiajs/react', () => ({
    Link: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Make route function available globally
(global as any).route = mockRoute;

describe('ExpiringPasswordsList', () => {
    const mockExpiringPasswords: Password[] = [
        {
            id: 1,
            name: 'Expiring Password 1',
            username: 'user1',
            password: 'password1',
            type: 'normal',
            copied: 8,
            last_used_at_formatted: '2 days ago',
            expires_at_formatted: 'In 3 days',
            is_expired_soon: true,
            created_at: new Date('2024-01-01T00:00:00Z'),
            updated_at: new Date('2024-01-01T00:00:00Z'),
        },
        {
            id: 2,
            name: 'Expiring Password 2',
            username: 'user2',
            password: 'password2',
            type: 'ssh',
            copied: 2,
            last_used_at_formatted: '1 day ago',
            expires_at_formatted: 'In 5 days',
            is_expired_soon: true,
            created_at: new Date('2024-01-02T00:00:00Z'),
            updated_at: new Date('2024-01-02T00:00:00Z'),
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders with expiring passwords', () => {
        render(<ExpiringPasswordsList passwords={mockExpiringPasswords} />);

        expect(screen.getByText('Expiring Soon')).toBeInTheDocument();
        expect(screen.getByTestId('passwords-table')).toBeInTheDocument();
        expect(screen.getByText('Expiring Password 1')).toBeInTheDocument();
        expect(screen.getByText('Expiring Password 2')).toBeInTheDocument();
    });

    it('renders "View all" link with correct href', () => {
        render(<ExpiringPasswordsList passwords={mockExpiringPasswords} />);

        const viewAllLink = screen.getByRole('link', { name: 'View all' });
        expect(viewAllLink).toHaveAttribute('href', '/mock-route/passwords.index');
        expect(mockRoute).toHaveBeenCalledWith('passwords.index', { expiry_filter: 'expires_soon' });
    });

    it('passes correct props to PasswordsTable', () => {
        render(<ExpiringPasswordsList passwords={mockExpiringPasswords} />);

        const passwordsTable = screen.getByTestId('passwords-table');
        expect(passwordsTable).toHaveAttribute('data-has-full-functionality', 'false');
    });

    it('renders empty state when no expiring passwords', () => {
        render(<ExpiringPasswordsList passwords={[]} />);

        expect(screen.getByText('No passwords expiring soon')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
        expect(screen.queryByTestId('passwords-table')).not.toBeInTheDocument();
    });

    it('handles create button click in empty state', async () => {
        const user = userEvent.setup();
        render(<ExpiringPasswordsList passwords={[]} />);

        const createButton = screen.getByRole('button', { name: 'Create' });
        await user.click(createButton);

        expect(mockOpenSheet).toHaveBeenCalledTimes(1);
    });

    it('renders header section correctly', () => {
        render(<ExpiringPasswordsList passwords={mockExpiringPasswords} />);

        const header = screen.getByText('Expiring Soon');
        expect(header).toBeInTheDocument();
        expect(header.tagName).toBe('H3');
        expect(header).toHaveClass('text-lg', 'font-semibold');
    });

    it('applies correct styling classes', () => {
        const { container } = render(<ExpiringPasswordsList passwords={mockExpiringPasswords} />);

        const mainContainer = container.firstChild;
        expect(mainContainer).toHaveClass('space-y-4');
    });

    it('renders with single expiring password', () => {
        const singlePassword = [mockExpiringPasswords[0]];
        render(<ExpiringPasswordsList passwords={singlePassword} />);

        expect(screen.getByTestId('passwords-table')).toBeInTheDocument();
        expect(screen.getByText('Expiring Password 1')).toBeInTheDocument();
        expect(screen.queryByText('Expiring Password 2')).not.toBeInTheDocument();
    });

    it('maintains accessibility with proper heading structure', () => {
        render(<ExpiringPasswordsList passwords={mockExpiringPasswords} />);

        const heading = screen.getByRole('heading', { level: 3, name: 'Expiring Soon' });
        expect(heading).toBeInTheDocument();
    });

    it('renders empty state with proper styling', () => {
        render(<ExpiringPasswordsList passwords={[]} />);

        const emptyStateContainer = screen.getByText('No passwords expiring soon').parentElement;
        expect(emptyStateContainer).toHaveClass('p-8', 'text-center');

        const emptyText = screen.getByText('No passwords expiring soon');
        expect(emptyText).toHaveClass('text-muted-foreground', 'text-sm');

        const createButton = screen.getByRole('button', { name: 'Create' });
        expect(createButton).toHaveClass('mt-4');
    });
});
