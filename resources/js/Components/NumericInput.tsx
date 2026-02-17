import { ChangeEvent, KeyboardEvent, ClipboardEvent, InputHTMLAttributes } from 'react';

interface NumericInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
    value: string | number;
    onChange: (value: string) => void;
    decimal?: boolean;
}

export default function NumericInput({ value, onChange, decimal = false, ...props }: NumericInputProps) {
    const pattern = decimal ? /^[0-9]*\.?[0-9]*$/ : /^[0-9]*$/;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === '' || pattern.test(val)) {
            onChange(val);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        const allowed = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
        if (allowed.includes(e.key)) return;
        if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x', 'z'].includes(e.key.toLowerCase())) return;

        if (decimal && e.key === '.') {
            if (String(value).includes('.')) {
                e.preventDefault();
            }
            return;
        }

        if (!/^[0-9]$/.test(e.key)) {
            e.preventDefault();
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        const pasted = e.clipboardData.getData('text');
        if (!pattern.test(pasted)) {
            e.preventDefault();
        }
    };

    return (
        <input
            {...props}
            type="text"
            inputMode={decimal ? 'decimal' : 'numeric'}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
        />
    );
}
