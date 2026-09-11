import { useEffect, useRef } from 'react';
import { quickExit, usePrivacy } from '@/lib/velour';

/** Кнопка + двойное нажатие Esc: мгновенно уводит на нейтральный сайт. */
export default function QuickExit() {
    const { exitUrl } = usePrivacy();
    const lastEsc = useRef(0);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            const now = Date.now();
            if (now - lastEsc.current < 600) quickExit(exitUrl);
            lastEsc.current = now;
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [exitUrl]);

    return (
        <button
            type="button"
            onClick={() => quickExit(exitUrl)}
            title="Double Esc works too"
            className="font-sans text-xs font-light text-mute underline-offset-4 transition-colors hover:text-ivory hover:underline"
        >
            Quick exit
        </button>
    );
}
