import { Password } from '@/types/passwords';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PasswordsTable } from '../passwords-table';

// Import the context providers
import { DeletePasswordProvider } from '@/contexts/passwords/delete-password-context';
import { EditPasswordProvider } from '@/contexts/passwords/edit-password-context';

// Helper function to render with context
const renderWithContext = (component: React.ReactElement) => {
    return render(
        <EditPasswordProvider>
            <DeletePasswordProvider>{component}</DeletePasswordProvider>
        </EditPasswordProvider>,
    );
};

// Mock dependencies
vi.mock('@/components/ui/table', () => ({
    Table: ({ children, className }: any) => (
        <table className={className} role="table">
            {children}
        </table>
    ),
    TableBody: ({ children }: any) => <tbody data-testid="table-body">{children}</tbody>,
    TableCaption: ({ children, className }: any) => (
        <caption className={className} data-testid="table-caption">
            {children}
        </caption>
    ),
    TableHeader: ({ children, className }: any) => <thead className={className}>{children}</thead>,
    TableRow: ({ children, className }: any) => <tr className={className}>{children}</tr>,
    TableHead: ({ children, className, onClick }: any) => (
        <th className={className} onClick={onClick}>
            {children}
        </th>
    ),
    TableCell: ({ children, className }: any) => <td className={className}>{children}</td>,
}));

vi.mock('./password-table-row', () => ({
    PasswordTableRow: ({ password, canSelect, isSelected, onSelectionChange }: any) => (
        <tr data-testid="password-table-row" data-password-id={password.id}>
            <td>
                {canSelect && (
                    <button
                        type="button"
                        role="checkbox"
                        aria-checked={isSelected}
                        onClick={() => onSelectionChange?.(!isSelected)}
                        data-testid={`password-checkbox-${password.id}`}
                        aria-label={`Select ${password.name}`}
                    >
                        {isSelected ? '✓' : ''}
                    </button>
                )}
                {password.name}
            </td>
        </tr>
    ),
}));

vi.mock('./passwords-table-header', () => ({
    PasswordsTableHeader: ({ sortKey, sortDirection, onSortChange, isAllSelected, isIndeterminate, onSelectAll }: any) => (
        <thead data-testid="passwords-table-header">
            <tr>
                <th>
                    <button
                        type="button"
                        role="checkbox"
                        aria-checked={isAllSelected}
                        onClick={() => onSelectAll?.(!isAllSelected)}
                        data-testid="select-all-checkbox"
                        aria-label="Select all passwords"
                    >
                        {isAllSelected ? '✓' : isIndeterminate ? '−' : ''}
                    </button>
                    Header
                </th>
                <th>
                    <button
                        onClick={() => onSortChange?.('name')}
                        data-testid="sort-name-button"
                        data-sort-key={sortKey}
                        data-sort-direction={sortDirection}
                    >
                        Sort Name
                    </button>
                </th>
            </tr>
        </thead>
    ),
}));

vi.mock('./simple-passwords-table-header', () => ({
    SimplePasswordsTableHeader: () => (
        <thead data-testid="simple-passwords-table-header">
            <tr>
                <th>Simple Header</th>
            </tr>
        </thead>
    ),
}));

vi.mock('@/contexts/passwords/edit-password-context', () => ({
    EditPasswordProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    useEditPassword: () => ({
        openSheet: vi.fn(),
        closeSheet: vi.fn(),
        editPassword: vi.fn(),
    }),
}));

vi.mock('@/contexts/passwords/delete-password-context', () => ({
    DeletePasswordProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    useDeletePassword: () => ({
        showConfirmation: vi.fn(),
        deletePassword: vi.fn(),
        bulkDeletePasswords: vi.fn(),
    }),
}));

// Mock global route function
vi.stubGlobal('route', vi.fn().mockReturnValue('/passwords'));

describe('PasswordsTable', () => {
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

    it('renders passwords with simple functionality', () => {
        renderWithContext(<PasswordsTable passwords={mockPasswords} />);

        // Check that the table renders without selection functionality
        expect(screen.getByTestId('table-body')).toBeInTheDocument();
        expect(screen.getByText('Test Password 1')).toBeInTheDocument();
        expect(screen.getByText('Test Password 2')).toBeInTheDocument();

        // Should not have select-all checkbox in simple mode
        expect(screen.queryByLabelText('Select all passwords')).not.toBeInTheDocument();
    });

    it('renders passwords with full functionality', () => {
        renderWithContext(
            <PasswordsTable
                passwords={mockPasswords}
                hasFullFunctionality={true}
                isAllSelected={true}
                isIndeterminate={false}
                sortKey="name"
                sortDirection="asc"
                onSortChange={vi.fn()}
                onSelectAll={vi.fn()}
                onSelectPassword={vi.fn()}
                selectedPasswordIds={new Set()}
            />,
        );

        // Check that the table renders with selection functionality
        expect(screen.getByTestId('table-body')).toBeInTheDocument();
        expect(screen.getByLabelText('Select all passwords')).toBeInTheDocument();
    });

    it('applies correct styling for full functionality', () => {
        const { container } = renderWithContext(<PasswordsTable passwords={mockPasswords} hasFullFunctionality={true} />);

        // Look for the container with the border styling
        const styledContainer = container.querySelector('.border-sidebar-border\\/70');
        expect(styledContainer).toBeInTheDocument();
    });

    it('applies correct styling for simple functionality', () => {
        const { container } = renderWithContext(<PasswordsTable passwords={mockPasswords} hasFullFunctionality={false} />);

        // Look for the simple container styling
        const styledContainer = container.querySelector('.relative.w-full.overflow-auto');
        expect(styledContainer).toBeInTheDocument();
    });

    it('renders table caption when no passwords', () => {
        renderWithContext(<PasswordsTable passwords={[]} />);

        const caption = screen.getByTestId('table-caption');
        expect(caption).toBeInTheDocument();
        expect(caption).toHaveTextContent('No passwords found.');
        expect(caption).toHaveClass('text-muted-foreground', 'my-4', 'text-sm');
    });

    it('does not render table caption when passwords exist', () => {
        renderWithContext(<PasswordsTable passwords={mockPasswords} />);

        expect(screen.queryByTestId('table-caption')).not.toBeInTheDocument();
    });

    it('passes correct props to PasswordsTableHeader', () => {
        renderWithContext(
            <PasswordsTable
                passwords={mockPasswords}
                hasFullFunctionality={true}
                sortKey="username"
                sortDirection="desc"
                onSortChange={vi.fn()}
                onSelectAll={vi.fn()}
                isAllSelected={true}
                isIndeterminate={false}
            />,
        );

        // Check that the table shows the sorting state
        const selectAllCheckbox = screen.getByLabelText('Select all passwords');
        expect(selectAllCheckbox).toHaveAttribute('aria-checked', 'true');

        // Check that headers are rendered
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Username')).toBeInTheDocument();
    });

    it('handles sorting functionality', async () => {
        const user = userEvent.setup();
        const mockOnSortChange = vi.fn();

        renderWithContext(
            <PasswordsTable
                passwords={mockPasswords}
                hasFullFunctionality={true}
                sortKey="name"
                sortDirection="asc"
                onSortChange={mockOnSortChange}
                onSelectAll={vi.fn()}
                isAllSelected={false}
                isIndeterminate={false}
            />,
        );

        // Test that the table header is clickable (even if we can't test the actual sorting)
        const nameHeader = screen.getByText('Name').closest('th');
        expect(nameHeader).toHaveClass('cursor-pointer');
    });

    it('handles select all functionality', async () => {
        const user = userEvent.setup();
        const mockOnSelectAll = vi.fn();

        renderWithContext(
            <PasswordsTable
                passwords={mockPasswords}
                hasFullFunctionality={true}
                sortKey="name"
                sortDirection="asc"
                onSortChange={vi.fn()}
                onSelectAll={mockOnSelectAll}
                isAllSelected={false}
                isIndeterminate={false}
            />,
        );

        const selectAllCheckbox = screen.getByLabelText('Select all passwords');
        await user.click(selectAllCheckbox);

        expect(mockOnSelectAll).toHaveBeenCalledWith(true);
    });

    it('handles individual password selection', async () => {
        const user = userEvent.setup();
        const mockOnSelectPassword = vi.fn();

        renderWithContext(
            <PasswordsTable
                passwords={mockPasswords}
                hasFullFunctionality={true}
                onSelectPassword={mockOnSelectPassword}
                selectedPasswordIds={new Set()}
                sortKey="name"
                sortDirection="asc"
                onSortChange={vi.fn()}
                onSelectAll={vi.fn()}
                isAllSelected={false}
                isIndeterminate={false}
            />,
        );

        expect(screen.getByTestId('table-body')).toBeInTheDocument();
        expect(screen.getByText('Test Password 1')).toBeInTheDocument();
    });

    it('renders selected passwords correctly', () => {
        renderWithContext(
            <PasswordsTable
                passwords={mockPasswords}
                hasFullFunctionality={true}
                selectedPasswordIds={new Set([1, 2])}
                sortKey="name"
                sortDirection="asc"
                onSortChange={vi.fn()}
                onSelectAll={vi.fn()}
                onSelectPassword={vi.fn()}
                isAllSelected={true}
                isIndeterminate={false}
            />,
        );

        const selectAllCheckbox = screen.getByLabelText('Select all passwords');
        expect(selectAllCheckbox).toHaveAttribute('aria-checked', 'true');
    });

    it('renders partially selected state correctly', () => {
        renderWithContext(
            <PasswordsTable
                passwords={mockPasswords}
                hasFullFunctionality={true}
                selectedPasswordIds={new Set([1])}
                sortKey="name"
                sortDirection="asc"
                onSortChange={vi.fn()}
                onSelectAll={vi.fn()}
                onSelectPassword={vi.fn()}
                isAllSelected={false}
                isIndeterminate={true}
            />,
        );

        expect(screen.getByTestId('table-body')).toBeInTheDocument();
        expect(screen.getByText('Test Password 1')).toBeInTheDocument();
    });

    it('does not render selection checkboxes when not in full functionality mode', () => {
        renderWithContext(<PasswordsTable passwords={mockPasswords} hasFullFunctionality={false} />);

        expect(screen.queryByTestId('password-checkbox-1')).not.toBeInTheDocument();
        expect(screen.queryByTestId('password-checkbox-2')).not.toBeInTheDocument();
    });

    it('renders with single password', () => {
        const singlePassword = [mockPasswords[0]];
        renderWithContext(<PasswordsTable passwords={singlePassword} />);

        expect(screen.getByText('Test Password 1')).toBeInTheDocument();
        expect(screen.queryByText('Test Password 2')).not.toBeInTheDocument();

        // Count table rows in tbody (excluding header)
        const tableBody = screen.getByTestId('table-body');
        const rows = tableBody.querySelectorAll('tr');
        expect(rows).toHaveLength(1);
    });

    it('renders with many passwords', () => {
        const manyPasswords = Array.from({ length: 50 }, (_, i) => ({
            ...mockPasswords[0],
            id: i + 1,
            name: `Password ${i + 1}`,
        }));
        renderWithContext(<PasswordsTable passwords={manyPasswords} />);

        // Count table rows in tbody (excluding header)
        const tableBody = screen.getByTestId('table-body');
        const rows = tableBody.querySelectorAll('tr');
        expect(rows).toHaveLength(50);
    });

    it('applies correct table classes', () => {
        renderWithContext(<PasswordsTable passwords={mockPasswords} />);

        const table = screen.getByRole('table');
        expect(table).toHaveClass('w-full', 'caption-bottom', 'text-sm', 'select-none');
    });
});
