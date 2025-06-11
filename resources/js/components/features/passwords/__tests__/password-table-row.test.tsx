import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PasswordTableRow } from '../password-table-row';

// Mock global route function
vi.stubGlobal('route', vi.fn().mockReturnValue('/passwords'));

// Mock dependencies
vi.mock('@/components/ui/checkbox', () => ({
    Checkbox: ({ checked, onCheckedChange, 'aria-label': ariaLabel }: any) => (
        <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onCheckedChange?.(e.target.checked)}
            aria-label={ariaLabel}
            data-testid="password-checkbox"
        />
    ),
}));

vi.mock('@/components/ui/table', () => ({
    TableCell: ({ children, className, onClick }: any) => (
        <td className={className} onClick={onClick}>
            {children}
        </td>
    ),
    TableRow: ({ children, className, onClick }: any) => (
        <tr className={className} onClick={onClick} data-testid="table-row">
            {children}
        </tr>
    ),
}));

vi.mock('@/lib/utils', () => ({
    cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

vi.mock('lucide-react', () => ({
    Folder: () => <span data-testid="folder-icon">Folder</span>,
    KeyRound: () => <span data-testid="keyround-icon">KeyRound</span>,
    Terminal: () => <span data-testid="terminal-icon">Terminal</span>,
    User: () => <span data-testid="user-icon">User</span>,
    TerminalSquare: () => <span data-testid="terminal-square-icon">TerminalSquare</span>,
    MoreHorizontal: () => <span data-testid="more-horizontal-icon">MoreHorizontal</span>,
    Edit: () => <span data-testid="edit-icon">Edit</span>,
    Trash2: () => <span data-testid="trash-icon">Trash2</span>,
    LockKeyhole: () => <span data-testid="lock-keyhole-icon">LockKeyhole</span>,
    Copy: () => <span data-testid="copy-icon">Copy</span>,
    History: () => <span data-testid="history-icon">History</span>,
    ShieldCheck: () => <span data-testid="shield-check-icon">ShieldCheck</span>,
    Eye: () => <span data-testid="eye-icon">Eye</span>,
    EyeOff: () => <span data-testid="eye-off-icon">EyeOff</span>,
    LinkIcon: () => <span data-testid="link-icon">LinkIcon</span>,
    Timer: () => <span data-testid="timer-icon">Timer</span>,
    StickyNote: () => <span data-testid="sticky-note-icon">StickyNote</span>,
    XIcon: () => <span data-testid="x-icon">XIcon</span>,
}));

vi.mock('./password-row-actions', () => ({
    PasswordRowActions: ({ password }: any) => (
        <div data-testid="password-row-actions" data-password-id={password.id}>
            Password Actions
        </div>
    ),
}));

vi.mock('./view-password-sheet', () => ({
    ViewPasswordSheet: ({ password, open, setOpen }: any) => (
        <div data-testid="view-password-sheet" data-password-id={password.id} data-open={open}>
            <button onClick={() => setOpen(false)} data-testid="close-sheet">
                Close Sheet
            </button>
        </div>
    ),
}));

// Mock context providers
vi.mock('@/contexts/passwords/edit-password-context', () => ({
    useEditPassword: () => ({
        openSheet: vi.fn(),
        closeSheet: vi.fn(),
        editPassword: vi.fn(),
    }),
}));

vi.mock('@/contexts/passwords/delete-password-context', () => ({
    useDeletePassword: () => ({
        showConfirmation: vi.fn(),
        deletePassword: vi.fn(),
        bulkDeletePasswords: vi.fn(),
    }),
}));

const mockRegularPassword = {
    id: 1,
    name: 'GitHub Account',
    type: 'normal' as const,
    username: 'john.doe',
    password: 'encrypted_password',
    copied: 5,
    expires_at_formatted: '2024-12-31',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
    folder: {
        id: 1,
        name: 'work',
        featured: false,
        passwords_count: 5,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
    },
    last_used_at_formatted: '2 days ago',
};

const mockSSHPassword = {
    id: 2,
    name: 'Production Server',
    type: 'ssh' as const,
    username: 'root',
    password: 'encrypted_ssh_key',
    copied: 2,
    expires_at_formatted: 'Never',
    created_at: new Date('2024-01-02'),
    updated_at: new Date('2024-01-02'),
    folder: undefined,
    last_used_at_formatted: 'Never',
};

const mockPasswordWithoutFolder = {
    id: 3,
    name: 'Personal Email',
    type: 'normal' as const,
    username: 'user@example.com',
    password: 'encrypted_password_2',
    copied: 1,
    expires_at_formatted: '2024-12-31',
    created_at: new Date('2024-01-03'),
    updated_at: new Date('2024-01-03'),
    folder: undefined,
    last_used_at_formatted: '1 week ago',
};

describe('PasswordTableRow', () => {
    it('renders regular password correctly', () => {
        render(<PasswordTableRow password={mockRegularPassword} />);

        expect(screen.getByText('GitHub Account')).toBeInTheDocument();
        expect(screen.getByText('john.doe')).toBeInTheDocument();
        expect(screen.getAllByTestId('keyround-icon')[0]).toBeInTheDocument();
        expect(screen.getByText('2 days ago')).toBeInTheDocument();
    });

    it('renders SSH password with terminal icon', () => {
        render(<PasswordTableRow password={mockSSHPassword} />);

        expect(screen.getByText('Production Server')).toBeInTheDocument();
        expect(screen.getByTestId('terminal-icon')).toBeInTheDocument();
    });

    it('renders password with folder information', () => {
        render(<PasswordTableRow password={mockRegularPassword} />);

        expect(screen.getByTestId('folder-icon')).toBeInTheDocument();
        expect(screen.getByText('work')).toBeInTheDocument();
    });

    it('renders password without folder with dash', () => {
        render(<PasswordTableRow password={mockPasswordWithoutFolder} />);

        expect(screen.getByText('-')).toBeInTheDocument();
        expect(screen.queryByTestId('folder-icon')).not.toBeInTheDocument();
    });

    it('renders checkbox when canSelect is true', () => {
        render(<PasswordTableRow password={mockRegularPassword} canSelect={true} isSelected={false} onSelectionChange={vi.fn()} />);

        expect(screen.getByTestId('password-checkbox')).toBeInTheDocument();
    });

    it('does not render checkbox when canSelect is false', () => {
        render(<PasswordTableRow password={mockRegularPassword} canSelect={false} />);

        expect(screen.queryByTestId('password-checkbox')).not.toBeInTheDocument();
    });

    it('handles checkbox selection correctly', async () => {
        const user = userEvent.setup();
        const onSelectionChange = vi.fn();

        render(<PasswordTableRow password={mockRegularPassword} canSelect={true} isSelected={false} onSelectionChange={onSelectionChange} />);

        const checkbox = screen.getByTestId('password-checkbox');
        await user.click(checkbox);

        expect(onSelectionChange).toHaveBeenCalledWith(true);
    });

    it('shows selected state correctly', () => {
        render(<PasswordTableRow password={mockRegularPassword} canSelect={true} isSelected={true} onSelectionChange={vi.fn()} />);

        const checkbox = screen.getByTestId('password-checkbox');
        expect(checkbox).toBeChecked();

        const row = screen.getByTestId('table-row');
        expect(row).toHaveClass('bg-accent/50');
    });

    it('opens view sheet when row is clicked', async () => {
        const user = userEvent.setup();
        render(<PasswordTableRow password={mockRegularPassword} />);

        const row = screen.getByTestId('table-row');
        await user.click(row);

        expect(row).toBeInTheDocument();
    });

    it('prevents row click when checkbox is clicked', async () => {
        const user = userEvent.setup();
        const onSelectionChange = vi.fn();

        render(<PasswordTableRow password={mockRegularPassword} canSelect={true} isSelected={false} onSelectionChange={onSelectionChange} />);

        const checkbox = screen.getByTestId('password-checkbox');
        await user.click(checkbox);

        expect(onSelectionChange).toHaveBeenCalledWith(true);
    });

    it('closes view sheet when close button is clicked', async () => {
        render(<PasswordTableRow password={mockRegularPassword} />);

        expect(screen.getByTestId('table-row')).toBeInTheDocument();
    });

    it('renders password row actions', () => {
        render(<PasswordTableRow password={mockRegularPassword} />);

        const actionButtons = screen.getAllByRole('button');
        expect(actionButtons.length).toBeGreaterThan(0);
    });

    it('applies correct styling to table row', () => {
        render(<PasswordTableRow password={mockRegularPassword} />);

        const row = screen.getByTestId('table-row');
        expect(row).toHaveClass('min-h-20', 'cursor-pointer');
    });

    it('sets correct aria-label for checkbox', () => {
        render(<PasswordTableRow password={mockRegularPassword} canSelect={true} onSelectionChange={vi.fn()} />);

        const checkbox = screen.getByTestId('password-checkbox');
        expect(checkbox).toHaveAttribute('aria-label', 'Select password GitHub Account');
    });

    it('handles username truncation correctly', () => {
        const longUsernamePassword = {
            ...mockRegularPassword,
            username: 'very.long.username.that.should.be.truncated@example.com',
        };

        render(<PasswordTableRow password={longUsernamePassword} />);

        const usernameCell = screen.getByText(longUsernamePassword.username).closest('td');
        expect(usernameCell).toHaveClass('max-w-20', 'truncate');
    });

    it('capitalizes password name correctly', () => {
        const lowercasePassword = {
            ...mockRegularPassword,
            name: 'github account',
        };

        render(<PasswordTableRow password={lowercasePassword} />);

        const nameElement = screen.getByText('github account').closest('span');
        expect(nameElement).toHaveClass('font-semibold', 'capitalize');
    });

    it('capitalizes folder name correctly', () => {
        render(<PasswordTableRow password={mockRegularPassword} />);

        const folderElement = screen.getByText('work').closest('span');
        expect(folderElement).toHaveClass('capitalize');
    });
});
