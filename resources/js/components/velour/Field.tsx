import type { InputHTMLAttributes } from 'react';

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

/** Поле формы: подпись сверху, нижняя линия вместо рамки, ошибка — тёплым розовым. */
export default function Field({ label, error, className = '', id, ...rest }: FieldProps) {
    const inputId = id ?? rest.name;

    return (
        <label htmlFor={inputId} className={`block ${className}`}>
            <span className="font-sans text-xs font-light tracking-wide text-mute">{label}</span>
            <input
                id={inputId}
                className={`mt-2 w-full border-0 border-b bg-transparent px-0 py-2 font-sans text-base font-light text-ivory outline-none transition-colors placeholder:text-mute/50 focus:border-gold ${
                    error ? 'border-rose' : 'border-ivory/20'
                }`}
                {...rest}
            />
            {error && <span className="mt-1 block font-sans text-xs font-light text-rose">{error}</span>}
        </label>
    );
}
