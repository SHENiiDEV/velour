import { useEffect, useState } from 'react';
import { useShared } from '@/lib/velour';

/** Короткое подтверждение действия снизу экрана. Одно, тихое, само исчезает. */
export default function Toast() {
    const { flash } = useShared();
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!flash?.status) return;
        setMessage(flash.status);
        const t = window.setTimeout(() => setMessage(null), 2800);
        return () => window.clearTimeout(t);
    }, [flash?.status]);

    if (!message) return null;

    return (
        <div
            role="status"
            className="toast-enter fixed bottom-8 left-1/2 z-40 border border-gold/40 bg-surface/90 px-6 py-3 font-sans text-sm font-light text-ivory backdrop-blur"
        >
            {message}
        </div>
    );
}
