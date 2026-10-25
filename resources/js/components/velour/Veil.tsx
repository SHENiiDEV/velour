import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import type { MediaProps } from '@/types/catalog';
import { usePrivacy } from '@/lib/velour';
import type { MaterialKey } from './MaterialField';

// three.js (~500 КБ) грузится только если реально нужен процедурный материал,
// а не на каждой странице с карточками товаров.
const MaterialField = lazy(() => import('./MaterialField'));

interface VeilProps {
    media: MediaProps | null;
    className?: string;
    /** Container aspect ratio, e.g. "4 / 5". */
    ratio?: string;
    sizes?: string;
    priority?: boolean;
    /**
     * contain — фото целиком, без обрезки (по умолчанию: исходники — квадратные
     * кадры с текстом, при cover от них оставались обрывки «KOM», «egel Ball Set»).
     */
    fit?: 'contain' | 'cover';
}

/** Сколько держим фото раскрытым после касания. */
const TOUCH_REVEAL_MS = 4000;

/**
 * Image under "veil". In discreet mode, images not explicitly marked safe are blurred.
 * Mouse: hover reveals. Touch: first tap reveals (navigation is held back),
 * second tap opens; the veil returns by itself after a few seconds.
 */
export default function Veil({ media, className = '', ratio = '4 / 5', sizes, priority = false, fit = 'contain' }: VeilProps) {
    const { discreet } = usePrivacy();
    const [revealed, setRevealed] = useState(false);
    const lastPointer = useRef<string>('mouse');
    const timer = useRef<number | undefined>(undefined);
    const veiled = discreet && media !== null && !media.discreetSafe && !revealed;

    useEffect(() => () => window.clearTimeout(timer.current), []);
    useEffect(() => {
        if (!discreet) setRevealed(false);
    }, [discreet]);

    const isMaterial = Boolean(media?.url?.startsWith('material:'));
    const materialName = isMaterial
        ? ((media?.url?.replace(/^material:/, '').split(':')[0] || 'silicone') as MaterialKey)
        : null;

    const revealForTouch = () => {
        setRevealed(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setRevealed(false), TOUCH_REVEAL_MS);
    };

    const fitClass = fit === 'contain' ? 'object-contain' : 'object-cover';

    return (
        <div
            className={`relative overflow-hidden bg-surface ${className}`}
            style={{ aspectRatio: ratio }}
            onPointerDown={(e) => {
                lastPointer.current = e.pointerType;
            }}
            onPointerEnter={(e) => discreet && e.pointerType === 'mouse' && setRevealed(true)}
            onPointerLeave={(e) => discreet && e.pointerType === 'mouse' && setRevealed(false)}
            onClickCapture={(e) => {
                // Касание по размытому фото: сначала раскрыть, не переходя по ссылке.
                if (veiled && lastPointer.current !== 'mouse') {
                    e.preventDefault();
                    e.stopPropagation();
                    revealForTouch();
                }
            }}
        >
            {isMaterial && materialName ? (
                <div className={`h-full w-full ${veiled ? 'discreet-veil' : ''}`}>
                    <Suspense fallback={<div className="h-full w-full bg-gradient-to-br from-graphite to-surface" aria-hidden />}>
                        <MaterialField material={materialName} discreet={veiled} className="h-full w-full object-cover" />
                    </Suspense>
                </div>
            ) : media?.url ? (
                <img
                    src={media.url}
                    alt={media.alt ?? ''}
                    loading={priority ? 'eager' : 'lazy'}
                    decoding="async"
                    sizes={sizes}
                    className={`breathe h-full w-full ${fitClass} ${veiled ? 'discreet-veil' : ''}`}
                />
            ) : (
                <div className="h-full w-full bg-gradient-to-br from-graphite to-surface" aria-hidden />
            )}

            {veiled && (
                <span className="pointer-events-none absolute inset-x-0 bottom-4 text-center font-sans text-[11px] font-light tracking-wide text-ivory/70">
                    <span className="hidden [@media(hover:hover)]:inline">hover to reveal</span>
                    <span className="[@media(hover:hover)]:hidden">tap to reveal</span>
                </span>
            )}
        </div>
    );
}
