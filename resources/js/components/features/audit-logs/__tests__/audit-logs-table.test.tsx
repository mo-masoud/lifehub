import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuditLogsTable } from '../audit-logs-table';

// Mock dependencies
const mockAuditLogs = [
    {
        id: 1,
        password_id: 123,
        user_id: 1,
        action: 'created' as const,
        ip_address: '192.168.1.1',
        context: 'Test context',
        metadata: { name: 'Test Password' },
        created_at: new Date('2024-01-01T00:00:00Z'),
        updated_at: new Date('2024-01-01T00:00:00Z'),
        created_at_formatted: '2024-01-01 12:00:00',
        action_display: 'Created',
        masked_password_name: 'Test ***word',
    },
    {
        id: 2,
        password_id: 456,
        user_id: 1,
        action: 'updated' as const,
        ip_address: '192.168.1.2',
        context: 'Another context',
        metadata: { name: 'Test Folder' },
        created_at: new Date('2024-01-02T00:00:00Z'),
        updated_at: new Date('2024-01-02T00:00:00Z'),
        created_at_formatted: '2024-01-02 12:00:00',
        action_display: 'Updated',
        masked_password_name: 'Test F***er',
    },
];

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

describe('AuditLogsTable', () => {
    const defaultProps = {
        sortKey: 'created_at' as const,
        sortDirection: 'desc' as const,
        onSortChange: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders audit logs', () => {
        render(<AuditLogsTable auditLogs={mockAuditLogs} {...defaultProps} />);

        // Check that the table renders with actual structure
        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getByTestId('table-body')).toBeInTheDocument();

        // Check for actual audit log content
        expect(screen.getByText('Created')).toBeInTheDocument();
        expect(screen.getByText('Updated')).toBeInTheDocument();
        expect(screen.getByText('Test ***word')).toBeInTheDocument();
        expect(screen.getByText('Test F***er')).toBeInTheDocument();
    });

    it('renders empty state when no audit logs', () => {
        render(<AuditLogsTable auditLogs={[]} {...defaultProps} />);

        const caption = screen.getByTestId('table-caption');
        expect(caption).toBeInTheDocument();
        expect(caption).toHaveTextContent('No audit logs found.');
    });

    it('applies correct table classes', () => {
        render(<AuditLogsTable auditLogs={mockAuditLogs} {...defaultProps} />);

        const table = screen.getByRole('table');
        expect(table).toHaveClass('w-full', 'caption-bottom', 'text-sm');
    });

    it('renders single audit log', () => {
        const singleLog = [mockAuditLogs[0]];

        render(<AuditLogsTable auditLogs={singleLog} {...defaultProps} />);

        // Check for the single audit log content
        expect(screen.getByText('Created')).toBeInTheDocument();
        expect(screen.getByText('Test ***word')).toBeInTheDocument();
        expect(screen.queryByText('Updated')).not.toBeInTheDocument();
    });
});
