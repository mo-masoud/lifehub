import { Password } from '@/types/passwords';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RecentPasswordsList } from '../recent-passwords-list';

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

describe('RecentPasswordsList', () => {
    const mockPasswords: Password[] = [
        {
            id: 1,
            name: 'Test Password 1',
            username: 'user1',
            password: 'password1',
            type: 'normal',
            copied: 5,
            last_used_at_formatted: '2 days ago',
            expires_at_formatted: 'Never',
            created_at: new Date('2024-01-01T00:00:00Z'),
            updated_at: new Date('2024-01-01T00:00:00Z'),
        },
        {
            id: 2,
            name: 'Test Password 2',
            username: 'user2',
            password: 'password2',
            type: 'ssh',
            copied: 10,
            last_used_at_formatted: '1 day ago',
            expires_at_formatted: 'In 30 days',
            created_at: new Date('2024-01-02T00:00:00Z'),
            updated_at: new Date('2024-01-02T00:00:00Z'),
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders with passwords', () => {
        render(<RecentPasswordsList passwords={mockPasswords} />);

        expect(screen.getByText('Recently Used')).toBeInTheDocument();
        expect(screen.getByTestId('passwords-table')).toBeInTheDocument();
        expect(screen.getByText('Test Password 1')).toBeInTheDocument();
        expect(screen.getByText('Test Password 2')).toBeInTheDocument();
    });

    it('renders "View all" link with correct href', () => {
        render(<RecentPasswordsList passwords={mockPasswords} />);

        const viewAllLink = screen.getByRole('link', { name: 'View all' });
        expect(viewAllLink).toHaveAttribute('href', '/mock-route/passwords.index');
        expect(mockRoute).toHaveBeenCalledWith('passwords.index');
    });

    it('passes correct props to PasswordsTable', () => {
        render(<RecentPasswordsList passwords={mockPasswords} />);

        const passwordsTable = screen.getByTestId('passwords-table');
        expect(passwordsTable).toHaveAttribute('data-has-full-functionality', 'false');
    });

    it('renders empty state when no passwords', () => {
        render(<RecentPasswordsList passwords={[]} />);

        expect(screen.getByText('No recently used passwords')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
        expect(screen.queryByTestId('passwords-table')).not.toBeInTheDocument();
    });

    it('handles create button click in empty state', async () => {
        const user = userEvent.setup();
        render(<RecentPasswordsList passwords={[]} />);

        const createButton = screen.getByRole('button', { name: 'Create' });
        await user.click(createButton);

        expect(mockOpenSheet).toHaveBeenCalledTimes(1);
    });

    it('renders header section correctly', () => {
        render(<RecentPasswordsList passwords={mockPasswords} />);

        const header = screen.getByText('Recently Used');
        expect(header).toBeInTheDocument();
        expect(header.tagName).toBe('H3');
        expect(header).toHaveClass('text-lg', 'font-semibold');
    });

    it('applies correct styling classes', () => {
        const { container } = render(<RecentPasswordsList passwords={mockPasswords} />);

        const mainContainer = container.firstChild;
        expect(mainContainer).toHaveClass('space-y-4');
    });

    it('renders with single password', () => {
        const singlePassword = [mockPasswords[0]];
        render(<RecentPasswordsList passwords={singlePassword} />);

        expect(screen.getByTestId('passwords-table')).toBeInTheDocument();
        expect(screen.getByText('Test Password 1')).toBeInTheDocument();
        expect(screen.queryByText('Test Password 2')).not.toBeInTheDocument();
    });

    it('handles large number of passwords', () => {
        const manyPasswords = Array.from({ length: 50 }, (_, i) => ({
            ...mockPasswords[0],
            id: i + 1,
            name: `Password ${i + 1}`,
        }));

        render(<RecentPasswordsList passwords={manyPasswords} />);

        expect(screen.getByTestId('passwords-table')).toBeInTheDocument();
        expect(screen.getAllByTestId('password-item')).toHaveLength(50);
    });

    it('renders bordered container correctly', () => {
        render(<RecentPasswordsList passwords={mockPasswords} />);

        const borderedContainer = screen.getByTestId('passwords-table').parentElement?.parentElement?.parentElement;
        expect(borderedContainer).toHaveClass('border-sidebar-border/70', 'dark:border-sidebar-border', 'rounded-md', 'border');
    });

    it('renders scrollable container for passwords', () => {
        render(<RecentPasswordsList passwords={mockPasswords} />);

        const scrollableContainer = screen.getByTestId('passwords-table').parentElement;
        expect(scrollableContainer).toHaveClass('max-h-80', 'overflow-auto', 'rounded-md');
    });

    it('maintains accessibility with proper heading structure', () => {
        render(<RecentPasswordsList passwords={mockPasswords} />);

        const heading = screen.getByRole('heading', { level: 3, name: 'Recently Used' });
        expect(heading).toBeInTheDocument();
    });

    it('renders empty state with proper styling', () => {
        render(<RecentPasswordsList passwords={[]} />);

        const emptyStateContainer = screen.getByText('No recently used passwords').parentElement;
        expect(emptyStateContainer).toHaveClass('p-8', 'text-center');

        const emptyText = screen.getByText('No recently used passwords');
        expect(emptyText).toHaveClass('text-muted-foreground', 'text-sm');

        const createButton = screen.getByRole('button', { name: 'Create' });
        expect(createButton).toHaveClass('mt-4');
    });
});
