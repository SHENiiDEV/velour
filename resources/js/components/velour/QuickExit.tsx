import { useEffect, useRef } from 'react';
import { quickExit, usePrivacy } from '@/lib/velour';

interface QuickExitProps {
    /** Компактная кнопка для мобильной шапки — всегда на виду, одно касание. */
    compact?: boolean;
}

/**
 * Кнопка + двойное нажатие Esc: мгновенно уводит на нейтральный сайт.
 * Историю браузера сайт стереть не может — честно говорим об этом в подсказке.
 */
export default function QuickExit({ compact = false }: QuickExitProps) {
    const { exitUrl } = usePrivacy();
    const lastEsc = useRef(0);

    useEffect(() => {
        // Слушатель вешаем один раз — у компактной копии в шапке его нет.
        if (compact) return;

        const onKey = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return;

            // Esc, закрывающий диалог (эссе журнала, фильтры), не считается первым нажатием.
            if (e.defaultPrevented || document.querySelector('[role="dialog"][aria-modal="true"], [data-esc-capture]')) {
                lastEsc.current = 0;
                return;
            }

            const now = Date.now();
            if (now - lastEsc.current < 600) quickExit(exitUrl);
            lastEsc.current = now;
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [exitUrl, compact]);

    const hint = 'Leaves instantly (double Esc works too). Browsers keep their own history — a private window leaves no trace.';

    if (compact) {
        return (
            <button
                type="button"
                onClick={() => quickExit(exitUrl)}
                aria-label="Quick exit"
                title={hint}
                className="flex h-10 items-center rounded-full border border-ivory/15 bg-surface/50 px-3.5 font-sans text-xs font-normal text-ivory transition-colors hover:border-gold/40"
            >
                Exit
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={() => quickExit(exitUrl)}
            title={hint}
            className="font-sans text-xs font-normal text-mute underline-offset-4 transition-colors hover:text-ivory hover:underline"
        >
            Quick exit
        </button>
    );
}
