import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { QuickTooltip } from '../quick-tooltip';

// Mock the tooltip components
vi.mock('@/components/ui/tooltip', () => ({
    Tooltip: ({ children }: any) => <div data-testid="tooltip">{children}</div>,
    TooltipContent: ({ children, className }: any) => (
        <div data-testid="tooltip-content" className={className}>
            {children}
        </div>
    ),
    TooltipTrigger: ({ children, asChild }: any) => (
        <div data-testid="tooltip-trigger" data-as-child={asChild}>
            {children}
        </div>
    ),
}));

describe('QuickTooltip', () => {
    it('renders with basic props', () => {
        render(
            <QuickTooltip content="Tooltip text">
                <button>Hover me</button>
            </QuickTooltip>,
        );

        expect(screen.getByTestId('tooltip')).toBeInTheDocument();
        expect(screen.getByTestId('tooltip-trigger')).toBeInTheDocument();
        expect(screen.getByTestId('tooltip-content')).toBeInTheDocument();
        expect(screen.getByText('Tooltip text')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument();
    });

    it('renders children correctly', () => {
        render(
            <QuickTooltip content="Help text">
                <span>Help icon</span>
            </QuickTooltip>,
        );

        expect(screen.getByText('Help icon')).toBeInTheDocument();
    });

    it('renders content in tooltip', () => {
        render(
            <QuickTooltip content="This is helpful information">
                <div>Trigger element</div>
            </QuickTooltip>,
        );

        expect(screen.getByText('This is helpful information')).toBeInTheDocument();
    });

    it('applies custom className to tooltip content', () => {
        render(
            <QuickTooltip content="Styled tooltip" className="custom-tooltip-class">
                <button>Styled button</button>
            </QuickTooltip>,
        );

        const tooltipContent = screen.getByTestId('tooltip-content');
        expect(tooltipContent).toHaveClass('custom-tooltip-class');
    });

    it('passes asChild prop to TooltipTrigger', () => {
        render(
            <QuickTooltip content="As child tooltip" asChild>
                <button>As child button</button>
            </QuickTooltip>,
        );

        const tooltipTrigger = screen.getByTestId('tooltip-trigger');
        expect(tooltipTrigger).toHaveAttribute('data-as-child', 'true');
    });

    it('defaults asChild to undefined when not provided', () => {
        render(
            <QuickTooltip content="Default tooltip">
                <button>Default button</button>
            </QuickTooltip>,
        );

        const tooltipTrigger = screen.getByTestId('tooltip-trigger');
        // Check that asChild is not passed when not provided (default behavior)
        expect(tooltipTrigger).not.toHaveAttribute('data-as-child');
    });

    it('renders with complex children', () => {
        render(
            <QuickTooltip content="Complex tooltip">
                <div>
                    <span>Icon</span>
                    <span>Label</span>
                </div>
            </QuickTooltip>,
        );

        expect(screen.getByText('Icon')).toBeInTheDocument();
        expect(screen.getByText('Label')).toBeInTheDocument();
        expect(screen.getByText('Complex tooltip')).toBeInTheDocument();
    });

    it('handles empty content gracefully', () => {
        render(
            <QuickTooltip content="">
                <button>Empty tooltip</button>
            </QuickTooltip>,
        );

        const tooltipContent = screen.getByTestId('tooltip-content');
        expect(tooltipContent).toBeInTheDocument();
        // The mock renders a <p> tag even when empty
        expect(tooltipContent.querySelector('p')).toBeInTheDocument();
    });

    it('renders multiple QuickTooltips independently', () => {
        render(
            <div>
                <QuickTooltip content="First tooltip">
                    <button>First button</button>
                </QuickTooltip>
                <QuickTooltip content="Second tooltip">
                    <button>Second button</button>
                </QuickTooltip>
            </div>,
        );

        expect(screen.getByText('First tooltip')).toBeInTheDocument();
        expect(screen.getByText('Second tooltip')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'First button' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Second button' })).toBeInTheDocument();
        expect(screen.getAllByTestId('tooltip')).toHaveLength(2);
    });

    it('works with different HTML elements as children', () => {
        const { rerender } = render(
            <QuickTooltip content="Button tooltip">
                <button>Button child</button>
            </QuickTooltip>,
        );

        expect(screen.getByRole('button')).toBeInTheDocument();

        rerender(
            <QuickTooltip content="Link tooltip">
                <a href="#test">Link child</a>
            </QuickTooltip>,
        );

        expect(screen.getByRole('link')).toBeInTheDocument();

        rerender(
            <QuickTooltip content="Div tooltip">
                <div>Div child</div>
            </QuickTooltip>,
        );

        expect(screen.getByText('Div child')).toBeInTheDocument();
    });

    it('handles long content', () => {
        const longContent =
            'This is a very long tooltip content that might wrap to multiple lines and should still be rendered correctly without any issues';

        render(
            <QuickTooltip content={longContent}>
                <button>Long tooltip</button>
            </QuickTooltip>,
        );

        expect(screen.getByText(longContent)).toBeInTheDocument();
    });

    it('renders with special characters in content', () => {
        const specialContent = 'Tooltip with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';

        render(
            <QuickTooltip content={specialContent}>
                <button>Special chars</button>
            </QuickTooltip>,
        );

        expect(screen.getByText(specialContent)).toBeInTheDocument();
    });
});
