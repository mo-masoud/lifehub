import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FoldersTable } from '../folders-table';

// Mock child components
vi.mock('../folder-table-row', () => ({
    FolderTableRow: ({ folder, isSelected, onSelectionChange }: any) => (
        <tr data-testid={`folder-row-${folder.id}`}>
            <td>{folder.name}</td>
            <td>
                <input type="checkbox" checked={isSelected} onChange={() => onSelectionChange()} data-testid={`folder-checkbox-${folder.id}`} />
            </td>
        </tr>
    ),
}));

vi.mock('../folders-table-header', () => ({
    FoldersTableHeader: ({ onSortChange, onSelectAll, isAllSelected }: any) => (
        <thead data-testid="folders-table-header">
            <tr>
                <th>
                    <button onClick={() => onSortChange('name')} data-testid="sort-name-button">
                        Sort by Name
                    </button>
                </th>
                <th>
                    <input type="checkbox" checked={isAllSelected} onChange={onSelectAll} data-testid="select-all-checkbox" />
                </th>
            </tr>
        </thead>
    ),
}));

vi.mock('@/components/ui/table', () => ({
    TableBody: ({ children }: any) => <tbody>{children}</tbody>,
    TableCaption: ({ children, className }: any) => <caption className={className}>{children}</caption>,
}));

const mockFolders = [
    {
        id: 1,
        name: 'Work',
        featured: false,
        passwords_count: 5,
        created_at: new Date('2024-01-01T00:00:00Z'),
        updated_at: new Date('2024-01-01T00:00:00Z'),
    },
    {
        id: 2,
        name: 'Personal',
        featured: true,
        passwords_count: 3,
        created_at: new Date('2024-01-02T00:00:00Z'),
        updated_at: new Date('2024-01-02T00:00:00Z'),
    },
];

const defaultProps = {
    folders: mockFolders,
    sortKey: 'name' as const,
    sortDirection: 'asc' as const,
    onSortChange: vi.fn(),
    selectedFolderIds: new Set<number>(),
    onSelectAll: vi.fn(),
    onSelectFolder: vi.fn(),
    isAllSelected: false,
    isIndeterminate: false,
};

describe('FoldersTable', () => {
    it('renders the table structure correctly', () => {
        render(<FoldersTable {...defaultProps} />);

        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getByTestId('folders-table-header')).toBeInTheDocument();

        // tbody is rendered by our TableBody mock
        const tbody = screen.getByRole('table').querySelector('tbody');
        expect(tbody).toBeInTheDocument();
    });

    it('renders all folders', () => {
        render(<FoldersTable {...defaultProps} />);

        mockFolders.forEach((folder) => {
            expect(screen.getByTestId(`folder-row-${folder.id}`)).toBeInTheDocument();
        });
    });

    it('displays empty state when no folders', () => {
        render(<FoldersTable {...defaultProps} folders={[]} />);

        expect(screen.getByText('No folders found.')).toBeInTheDocument();
    });

    it('passes correct props to FoldersTableHeader', () => {
        render(<FoldersTable {...defaultProps} isAllSelected={true} isIndeterminate={true} />);

        const selectAllCheckbox = screen.getByTestId('select-all-checkbox');
        expect(selectAllCheckbox).toBeChecked();
    });

    it('handles sort change correctly', async () => {
        const user = userEvent.setup();
        const onSortChange = vi.fn();

        render(<FoldersTable {...defaultProps} onSortChange={onSortChange} />);

        await user.click(screen.getByTestId('sort-name-button'));
        expect(onSortChange).toHaveBeenCalledWith('name');
    });

    it('handles select all correctly', async () => {
        const user = userEvent.setup();
        const onSelectAll = vi.fn();

        render(<FoldersTable {...defaultProps} onSelectAll={onSelectAll} />);

        await user.click(screen.getByTestId('select-all-checkbox'));
        expect(onSelectAll).toHaveBeenCalled();
    });

    it('handles individual folder selection correctly', async () => {
        const user = userEvent.setup();
        const onSelectFolder = vi.fn();

        render(<FoldersTable {...defaultProps} onSelectFolder={onSelectFolder} />);

        await user.click(screen.getByTestId('folder-checkbox-1'));
        expect(onSelectFolder).toHaveBeenCalledWith(1);
    });

    it('shows selected folders with correct styling', () => {
        const selectedFolderIds = new Set([1]);

        render(<FoldersTable {...defaultProps} selectedFolderIds={selectedFolderIds} />);

        const checkbox = screen.getByTestId('folder-checkbox-1');
        expect(checkbox).toBeChecked();

        const unselectedCheckbox = screen.getByTestId('folder-checkbox-2');
        expect(unselectedCheckbox).not.toBeChecked();
    });

    it('handles different sort directions', () => {
        const { rerender } = render(<FoldersTable {...defaultProps} sortDirection="asc" />);
        expect(screen.getByTestId('folders-table-header')).toBeInTheDocument();

        rerender(<FoldersTable {...defaultProps} sortDirection="desc" />);
        expect(screen.getByTestId('folders-table-header')).toBeInTheDocument();
    });

    it('handles different sort keys', () => {
        const { rerender } = render(<FoldersTable {...defaultProps} sortKey="name" />);
        expect(screen.getByTestId('folders-table-header')).toBeInTheDocument();

        rerender(<FoldersTable {...defaultProps} sortKey="created_at" />);
        expect(screen.getByTestId('folders-table-header')).toBeInTheDocument();
    });

    it('applies correct CSS classes for styling', () => {
        render(<FoldersTable {...defaultProps} />);

        // Get the outer container div, not the div closest to table
        const container = screen.getByRole('table').closest('div')?.parentElement;
        expect(container).toHaveClass(
            'border-sidebar-border/70',
            'dark:border-sidebar-border',
            'mt-8',
            'max-h-[calc(100%-180px)]',
            'overflow-auto',
            'rounded-md',
            'border',
            'md:max-h-[calc(100%-120px)]',
        );
    });

    it('renders table with correct attributes', () => {
        render(<FoldersTable {...defaultProps} />);

        const table = screen.getByRole('table');
        expect(table).toHaveClass('w-full', 'caption-bottom', 'text-sm', 'select-none');
    });
});
