import { fireEvent, render, screen } from '@testing-library/react';
import { KeyRound, Lock } from 'lucide-react';
import { SmartRadioGroup } from '../smart-radio-group';

describe('SmartRadioGroup', () => {
    const options = [
        { label: 'Option A', value: 'a', icon: KeyRound },
        { label: 'Option B', value: 'b', icon: Lock },
    ];

    it('renders all options with correct labels', () => {
        render(<SmartRadioGroup options={options} value="a" onChange={() => {}} />);

        expect(screen.getByText('Option A')).toBeInTheDocument();
        expect(screen.getByText('Option B')).toBeInTheDocument();
    });

    it('applies selected style to the active value', () => {
        render(<SmartRadioGroup options={options} value="b" onChange={() => {}} />);

        const selectedButton = screen.getByText('Option B').closest('button');
        expect(selectedButton).toHaveClass('bg-white'); // or dark:bg-neutral-700 depending on theme
    });

    it('calls onChange when a different option is clicked', () => {
        const handleChange = vi.fn();

        render(<SmartRadioGroup options={options} value="a" onChange={handleChange} />);

        const button = screen.getByText('Option B').closest('button')!;
        fireEvent.click(button);

        expect(handleChange).toHaveBeenCalledWith('b');
        expect(handleChange).toHaveBeenCalledTimes(1);
    });
});
