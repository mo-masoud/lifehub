// File: resources/js/components/shared/forms/__tests__/date-input.test.tsx

import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { DateInput } from '../date-input';

describe('DateInput', () => {
    it('renders with placeholder if no value is provided', () => {
        render(<DateInput onChange={() => {}} placeholder="Pick a date" />);
        expect(screen.getByText('Pick a date')).toBeInTheDocument();
    });

    it('renders with formatted date if value is provided', () => {
        const date = new Date(2024, 5, 10); // June 10, 2024
        render(<DateInput value={date} onChange={() => {}} />);
        expect(screen.getByText('June 10th, 2024')).toBeInTheDocument(); // 'PPP' format
    });

    it('opens the calendar when clicked and calls onChange on date select', () => {
        const onChange = vi.fn();
        render(<DateInput onChange={onChange} />);

        // Open calendar
        fireEvent.click(screen.getByRole('button'));

        // Expect calendar popup to appear
        expect(document.querySelector('[role="dialog"],[data-radix-popper-content-wrapper]')).toBeInTheDocument();

        // Simulate selecting today's date
        const today = new Date();
        const todayDateString = today.getDate().toString();

        const dayButton = screen.getAllByText(todayDateString).find((btn) => btn.tagName.toLowerCase() === 'button');

        if (dayButton) {
            fireEvent.click(dayButton);
            expect(onChange).toHaveBeenCalled();
        }
    });
});
