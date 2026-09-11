import { Link } from '@inertiajs/react';

interface WordmarkProps {
    /** В скрытном режиме показываем нейтральные инициалы. */
    discreet?: boolean;
    className?: string;
}

export default function Wordmark({ discreet = false, className = '' }: WordmarkProps) {
    return (
        <Link href="/" className={`font-display text-2xl font-light tracking-[0.18em] text-ivory ${className}`} aria-label="VELOUR — home">
            {discreet ? 'V.' : 'VELOUR'}
        </Link>
    );
}
