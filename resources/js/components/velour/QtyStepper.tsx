interface QtyStepperProps {
    value: number;
    max: number;
    onChange: (qty: number) => void;
    disabled?: boolean;
}

export default function QtyStepper({ value, max, onChange, disabled = false }: QtyStepperProps) {
    const btn = 'h-10 w-10 font-sans text-lg font-light text-mute transition-colors hover:text-ivory disabled:opacity-30';

    return (
        <div className="inline-flex items-center border border-ivory/15">
            <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={disabled || value <= 1} aria-label="Fewer">
                −
            </button>
            <span className="w-10 text-center font-display text-xl text-ivory tabular-nums">{value}</span>
            <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={disabled || value >= max} aria-label="More">
                +
            </button>
        </div>
    );
}
