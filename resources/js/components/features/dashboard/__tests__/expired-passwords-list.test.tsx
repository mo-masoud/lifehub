import { Password } from '@/types/passwords';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExpiredPasswordsList } from '../expired-passwords-list';

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

describe('ExpiredPasswordsList', () => {
    const mockExpiredPasswords: Password[] = [
        {
            id: 1,
            name: 'Expired Password 1',
            username: 'user1',
            password: 'password1',
            type: 'normal',
            copied: 3,
            last_used_at_formatted: '10 days ago',
            expires_at_formatted: '5 days ago',
            is_expired: true,
            created_at: new Date('2024-01-01T00:00:00Z'),
            updated_at: new Date('2024-01-01T00:00:00Z'),
        },
        {
            id: 2,
            name: 'Expired Password 2',
            username: 'user2',
            password: 'password2',
            type: 'ssh',
            copied: 1,
            last_used_at_formatted: '15 days ago',
            expires_at_formatted: '3 days ago',
            is_expired: true,
            created_at: new Date('2024-01-02T00:00:00Z'),
            updated_at: new Date('2024-01-02T00:00:00Z'),
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders with expired passwords', () => {
        render(<ExpiredPasswordsList passwords={mockExpiredPasswords} />);

        expect(screen.getByText('Recently Expired')).toBeInTheDocument();
        expect(screen.getByTestId('passwords-table')).toBeInTheDocument();
        expect(screen.getByText('Expired Password 1')).toBeInTheDocument();
        expect(screen.getByText('Expired Password 2')).toBeInTheDocument();
    });

    it('renders "View all" link with correct href', () => {
        render(<ExpiredPasswordsList passwords={mockExpiredPasswords} />);

        const viewAllLink = screen.getByRole('link', { name: 'View all' });
        expect(viewAllLink).toHaveAttribute('href', '/mock-route/passwords.index');
        expect(mockRoute).toHaveBeenCalledWith('passwords.index', { expiry_filter: 'expired' });
    });

    it('passes correct props to PasswordsTable', () => {
        render(<ExpiredPasswordsList passwords={mockExpiredPasswords} />);

        const passwordsTable = screen.getByTestId('passwords-table');
        expect(passwordsTable).toHaveAttribute('data-has-full-functionality', 'false');
    });

    it('renders empty state when no expired passwords', () => {
        render(<ExpiredPasswordsList passwords={[]} />);

        expect(screen.getByText('No recently expired passwords')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
        expect(screen.queryByTestId('passwords-table')).not.toBeInTheDocument();
    });

    it('handles create button click in empty state', async () => {
        const user = userEvent.setup();
        render(<ExpiredPasswordsList passwords={[]} />);

        const createButton = screen.getByRole('button', { name: 'Create' });
        await user.click(createButton);

        expect(mockOpenSheet).toHaveBeenCalledTimes(1);
    });

    it('renders header section correctly', () => {
        render(<ExpiredPasswordsList passwords={mockExpiredPasswords} />);

        const header = screen.getByText('Recently Expired');
        expect(header).toBeInTheDocument();
        expect(header.tagName).toBe('H3');
        expect(header).toHaveClass('text-lg', 'font-semibold');
    });

    it('applies correct styling classes', () => {
        const { container } = render(<ExpiredPasswordsList passwords={mockExpiredPasswords} />);

        const mainContainer = container.firstChild;
        expect(mainContainer).toHaveClass('space-y-4');
    });

    it('renders with single expired password', () => {
        const singlePassword = [mockExpiredPasswords[0]];
        render(<ExpiredPasswordsList passwords={singlePassword} />);

        expect(screen.getByTestId('passwords-table')).toBeInTheDocument();
        expect(screen.getByText('Expired Password 1')).toBeInTheDocument();
        expect(screen.queryByText('Expired Password 2')).not.toBeInTheDocument();
    });

    it('maintains accessibility with proper heading structure', () => {
        render(<ExpiredPasswordsList passwords={mockExpiredPasswords} />);

        const heading = screen.getByRole('heading', { level: 3, name: 'Recently Expired' });
        expect(heading).toBeInTheDocument();
    });

    it('renders empty state with proper styling', () => {
        render(<ExpiredPasswordsList passwords={[]} />);

        const emptyStateContainer = screen.getByText('No recently expired passwords').parentElement;
        expect(emptyStateContainer).toHaveClass('p-8', 'text-center');

        const emptyText = screen.getByText('No recently expired passwords');
        expect(emptyText).toHaveClass('text-muted-foreground', 'text-sm');

        const createButton = screen.getByRole('button', { name: 'Create' });
        expect(createButton).toHaveClass('mt-4');
    });
});
