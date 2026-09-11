import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

type Phase = 'idle' | 'cover' | 'reveal';

/**
 * Занавес должен успеть закрыть экран до подмены страницы.
 * Длительности живут здесь, а в CSS уходят переменными — чтобы движение
 * и таймеры нельзя было развести по разным значениям.
 */
const COVER_MS = 620;
const REVEAL_MS = 900;

/**
 * Переход между страницами: занавес из бордо проходит сверху вниз.
 *
 * Он не «уезжает обратно», а продолжает движение и уходит за нижний край —
 * это читается как смена кадра, а не как закрывшаяся и открывшаяся дверь.
 * Пока экран закрыт, Inertia успевает подменить компонент, поэтому переход
 * между разделами выглядит одним движением, а не мерцанием.
 *
 * При `prefers-reduced-motion` компонент не рендерится вовсе.
 */
export default function PageCurtain() {
    const [enabled, setEnabled] = useState(false);
    const [phase, setPhase] = useState<Phase>('idle');
    // Первый кадр после жёсткой загрузки: занавес уже лежит на экране и уходит вниз.
    const [instant, setInstant] = useState(true);

    const startedAt = useRef(0);
    const timers = useRef<number[]>([]);
    const frames = useRef<number[]>([]);
    const covering = useRef(false);

    const clearTimers = () => {
        timers.current.forEach(clearTimeout);
        timers.current = [];
        frames.current.forEach(cancelAnimationFrame);
        frames.current = [];
    };

    /*
     * Браузер не запустит переход, если снять `transition: none` и сдвинуть
     * занавес в одной и той же перерисовке: он увидит только конечное
     * положение и поставит его мгновенно. Поэтому сначала отдаём кадр на
     * включение перехода и только потом трогаем transform.
     */
    const nextFrame = (fn: () => void) => {
        const id = requestAnimationFrame(() => {
            const inner = requestAnimationFrame(fn);
            frames.current.push(inner);
        });
        frames.current.push(id);
    };

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        setEnabled(true);
    }, []);

    // Вход на сайт: занавес снимается один раз при первой отрисовке.
    useEffect(() => {
        if (!enabled) return;

        // Занавес уже лежит на экране (instant), поэтому его только снимаем.
        setPhase('cover');
        nextFrame(() => {
            setInstant(false);
            nextFrame(() => setPhase('reveal'));
        });

        const done = window.setTimeout(() => {
            setInstant(true);
            setPhase('idle');
        }, REVEAL_MS + 220);
        timers.current.push(done);

        return clearTimers;
    }, [enabled]);

    useEffect(() => {
        if (!enabled) return;

        const cover = () => {
            clearTimers();
            covering.current = true;
            setInstant(false);
            nextFrame(() => {
                startedAt.current = performance.now();
                setPhase('cover');
            });
        };

        const reveal = () => {
            if (!covering.current) return;
            covering.current = false;

            // Быстрый ответ сервера не должен обрывать занавес на середине.
            const rest = Math.max(0, COVER_MS - (performance.now() - startedAt.current));

            const a = window.setTimeout(() => setPhase('reveal'), rest);
            const b = window.setTimeout(() => {
                setInstant(true);
                setPhase('idle');
            }, rest + REVEAL_MS);
            timers.current.push(a, b);
        };

        const offStart = router.on('start', cover);
        const offFinish = router.on('finish', reveal);

        return () => {
            offStart();
            offFinish();
            clearTimers();
        };
    }, [enabled]);

    if (!enabled) return null;

    return (
        <div
            className={`page-curtain page-curtain--${phase} ${instant ? 'page-curtain--instant' : ''}`}
            style={{ '--cover': `${COVER_MS}ms`, '--reveal': `${REVEAL_MS}ms` } as React.CSSProperties}
            aria-hidden
        >
            <span className="page-curtain__mark">V</span>
        </div>
    );
}
