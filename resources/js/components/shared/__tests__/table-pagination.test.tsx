import { Pagination } from '@/types';
import { BaseModel } from '@/types/base';
import { router } from '@inertiajs/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TablePagination } from '../table-pagination';

// Mock the dependencies
vi.mock('@inertiajs/react', () => ({
    router: {
        visit: vi.fn(),
    },
}));

vi.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, disabled, size, variant, ...props }: any) => (
        <button onClick={onClick} disabled={disabled} data-size={size} data-variant={variant} {...props}>
            {children}
        </button>
    ),
}));

vi.mock('@/components/ui/dropdown-menu', () => ({
    DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
    DropdownMenuContent: ({ children, align }: any) => (
        <div data-testid="dropdown-content" data-align={align}>
            {children}
        </div>
    ),
    DropdownMenuItem: ({ children, onClick, className }: any) => (
        <div data-testid="dropdown-item" onClick={onClick} className={className}>
            {children}
        </div>
    ),
    DropdownMenuTrigger: ({ children, asChild }: any) => (
        <div data-testid="dropdown-trigger" data-as-child={asChild}>
            {children}
        </div>
    ),
}));

vi.mock('lucide-react', () => ({
    ChevronDown: () => <div data-testid="chevron-down">ChevronDown</div>,
    ChevronsLeft: () => <div data-testid="chevrons-left">ChevronsLeft</div>,
    ChevronsRight: () => <div data-testid="chevrons-right">ChevronsRight</div>,
}));

// Make route function available globally
const mockRoute = vi.fn((name: string, params?: any) => `/route/${name}?${new URLSearchParams(params).toString()}`);
(global as any).route = mockRoute;

describe('TablePagination', () => {
    const mockPagination: Pagination<BaseModel> = {
        current_page: 2,
        from: 11,
        to: 20,
        total: 50,
        per_page: 10,
        last_page: 5,
        first_page_url: 'http://example.com?page=1',
        last_page_url: 'http://example.com?page=5',
        next_page_url: 'http://example.com?page=3',
        prev_page_url: 'http://example.com?page=1',
        path: 'http://example.com',
        data: [],
        links: [
            { url: null, label: '&laquo; Previous', active: false },
            { url: 'http://example.com?page=1', label: '1', active: false },
            { url: 'http://example.com?page=2', label: '2', active: true },
            { url: 'http://example.com?page=3', label: '3', active: false },
            { url: 'http://example.com?page=3', label: 'Next &raquo;', active: false },
        ],
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders pagination information correctly', () => {
        render(<TablePagination pagination={mockPagination} />);

        expect(screen.getByText('Showing 11 to 20 of 50 results.')).toBeInTheDocument();
    });

    it('renders per page dropdown with correct options', () => {
        render(<TablePagination pagination={mockPagination} perPage={10} />);

        expect(screen.getByText('Items per page:')).toBeInTheDocument();
        const dropdownTrigger = screen.getByTestId('dropdown-trigger');
        expect(dropdownTrigger.querySelector('button')).toHaveTextContent('10');
        expect(screen.getByTestId('chevron-down')).toBeInTheDocument();
    });

    it('renders navigation buttons', () => {
        render(<TablePagination pagination={mockPagination} />);

        const prevButton = screen.getByTestId('chevrons-left').parentElement;
        const nextButton = screen.getByTestId('chevrons-right').parentElement;

        expect(prevButton).toBeInTheDocument();
        expect(nextButton).toBeInTheDocument();
    });

    it('disables previous button when no prev_page_url', () => {
        const paginationNoPrev = { ...mockPagination, prev_page_url: undefined };
        render(<TablePagination pagination={paginationNoPrev} />);

        const prevButton = screen.getByTestId('chevrons-left').parentElement;
        expect(prevButton).toBeDisabled();
    });

    it('disables next button when no next_page_url', () => {
        const paginationNoNext = { ...mockPagination, next_page_url: undefined };
        render(<TablePagination pagination={paginationNoNext} />);

        const nextButton = screen.getByTestId('chevrons-right').parentElement;
        expect(nextButton).toBeDisabled();
    });

    it('handles previous page navigation', async () => {
        const user = userEvent.setup();
        render(<TablePagination pagination={mockPagination} />);

        const prevButton = screen.getByTestId('chevrons-left').parentElement as HTMLButtonElement;
        await user.click(prevButton);

        expect(vi.mocked(router.visit)).toHaveBeenCalledWith('/route/passwords.index?page=1', {
            preserveScroll: true,
            preserveState: true,
        });
    });

    it('handles next page navigation', async () => {
        const user = userEvent.setup();
        render(<TablePagination pagination={mockPagination} />);

        const nextButton = screen.getByTestId('chevrons-right').parentElement as HTMLButtonElement;
        await user.click(nextButton);

        expect(vi.mocked(router.visit)).toHaveBeenCalledWith('/route/passwords.index?page=3', {
            preserveScroll: true,
            preserveState: true,
        });
    });

    it('includes current filters in navigation', async () => {
        const user = userEvent.setup();
        const currentFilters = { search: 'test', folderId: '123' };

        render(<TablePagination pagination={mockPagination} currentFilters={currentFilters} />);

        const nextButton = screen.getByTestId('chevrons-right').parentElement as HTMLButtonElement;
        await user.click(nextButton);

        expect(vi.mocked(router.visit)).toHaveBeenCalledWith('/route/passwords.index?search=test&folderId=123&page=3', {
            preserveScroll: true,
            preserveState: true,
        });
    });

    it('uses custom route name', async () => {
        const user = userEvent.setup();
        render(<TablePagination pagination={mockPagination} routeName="custom.route" />);

        const nextButton = screen.getByTestId('chevrons-right').parentElement as HTMLButtonElement;
        await user.click(nextButton);

        expect(vi.mocked(router.visit)).toHaveBeenCalledWith('/route/custom.route?page=3', {
            preserveScroll: true,
            preserveState: true,
        });
    });

    it('calls onPerPageChange when provided', async () => {
        const user = userEvent.setup();
        const mockOnPerPageChange = vi.fn();

        render(<TablePagination pagination={mockPagination} perPage={10} onPerPageChange={mockOnPerPageChange} />);

        // Find and click on a dropdown item
        const dropdownItems = screen.getAllByTestId('dropdown-item');
        const item20 = dropdownItems.find((item) => item.textContent === '20');

        if (item20) {
            await user.click(item20);
            expect(mockOnPerPageChange).toHaveBeenCalledWith(20);
        }
    });

    it('applies custom className', () => {
        const { container } = render(<TablePagination pagination={mockPagination} className="custom-pagination-class" />);

        expect(container.firstChild).toHaveClass('custom-pagination-class');
    });

    it('filters out undefined and null values from navigation data', async () => {
        const user = userEvent.setup();
        const currentFilters = {
            search: 'test',
            emptyString: '',
            nullValue: null,
            undefinedValue: undefined,
            validNumber: 0,
        };

        render(<TablePagination pagination={mockPagination} currentFilters={currentFilters} />);

        const nextButton = screen.getByTestId('chevrons-right').parentElement as HTMLButtonElement;
        await user.click(nextButton);

        // Should only include search and validNumber, excluding empty, null, and undefined values
        expect(vi.mocked(router.visit)).toHaveBeenCalledWith('/route/passwords.index?search=test&validNumber=0&page=3', {
            preserveScroll: true,
            preserveState: true,
        });
    });

    it('renders all per page options', () => {
        render(<TablePagination pagination={mockPagination} perPage={10} />);

        // Check that dropdown contains all expected options
        const dropdownItems = screen.getAllByTestId('dropdown-item');
        expect(dropdownItems).toHaveLength(4); // 10, 20, 30, 50

        // Check the content without using getByText to avoid duplicates
        const itemTexts = dropdownItems.map((item) => item.textContent);
        expect(itemTexts).toEqual(['10', '20', '30', '50']);
    });

    it('highlights current per page selection', () => {
        render(<TablePagination pagination={mockPagination} perPage={20} />);

        const dropdownItems = screen.getAllByTestId('dropdown-item');
        const item20 = dropdownItems.find((item) => item.textContent === '20');

        expect(item20).toHaveClass('bg-accent', 'text-accent-foreground');
    });

    it('handles edge case with page 1', async () => {
        const user = userEvent.setup();
        const firstPagePagination = {
            ...mockPagination,
            current_page: 1,
            from: 1,
            to: 10,
            prev_page_url: undefined,
        };

        render(<TablePagination pagination={firstPagePagination} />);

        const prevButton = screen.getByTestId('chevrons-left').parentElement;
        expect(prevButton).toBeDisabled();
    });

    it('handles edge case with last page', async () => {
        const lastPagePagination = {
            ...mockPagination,
            current_page: 5,
            from: 41,
            to: 50,
            next_page_url: undefined,
        };

        render(<TablePagination pagination={lastPagePagination} />);

        const nextButton = screen.getByTestId('chevrons-right').parentElement;
        expect(nextButton).toBeDisabled();
    });

    it('handles pagination with single page', () => {
        const singlePagePagination = {
            ...mockPagination,
            current_page: 1,
            from: 1,
            to: 5,
            total: 5,
            last_page: 1,
            next_page_url: undefined,
            prev_page_url: undefined,
        };

        render(<TablePagination pagination={singlePagePagination} />);

        const prevButton = screen.getByTestId('chevrons-left').parentElement;
        const nextButton = screen.getByTestId('chevrons-right').parentElement;

        expect(prevButton).toBeDisabled();
        expect(nextButton).toBeDisabled();
        expect(screen.getByText('Showing 1 to 5 of 5 results.')).toBeInTheDocument();
    });
});
