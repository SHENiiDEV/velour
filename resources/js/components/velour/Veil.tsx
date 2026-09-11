import { useState } from 'react';
import type { MediaProps } from '@/types/catalog';
import { usePrivacy } from '@/lib/velour';
import MaterialField, { type MaterialKey } from './MaterialField';

interface VeilProps {
    media: MediaProps | null;
    className?: string;
    /** Container aspect ratio, e.g. "4 / 5". */
    ratio?: string;
    sizes?: string;
    priority?: boolean;
}

/**
 * Image under "veil". In discreet mode, non-safe images are blurred until hover/touch.
 * Supports procedural Three.js material fields for material:* URLs.
 */
export default function Veil({ media, className = '', ratio = '4 / 5', sizes, priority = false }: VeilProps) {
    const { discreet } = usePrivacy();
    const [revealed, setRevealed] = useState(false);
    const veiled = discreet && media !== null && !media.discreetSafe && !revealed;

    const isMaterial = Boolean(media?.url?.startsWith('material:'));
    const materialName = isMaterial
        ? ((media?.url?.replace(/^material:/, '').split(':')[0] || 'silicone') as MaterialKey)
        : null;

    return (
        <div
            className={`relative overflow-hidden bg-surface ${className}`}
            style={{ aspectRatio: ratio }}
            onMouseEnter={() => discreet && setRevealed(true)}
            onMouseLeave={() => discreet && setRevealed(false)}
            onTouchStart={() => discreet && setRevealed(true)}
        >
            {isMaterial && materialName ? (
                <div className={`h-full w-full ${veiled ? 'discreet-veil' : ''}`}>
                    <MaterialField material={materialName} discreet={veiled} className="h-full w-full object-cover" />
                </div>
            ) : media?.url ? (
                <img
                    src={media.url}
                    alt={media.alt ?? ''}
                    loading={priority ? 'eager' : 'lazy'}
                    decoding="async"
                    sizes={sizes}
                    className={`breathe h-full w-full object-cover ${veiled ? 'discreet-veil' : ''}`}
                />
            ) : (
                <div className="h-full w-full bg-gradient-to-br from-graphite to-surface" aria-hidden />
            )}

            {veiled && (
                <span className="pointer-events-none absolute inset-x-0 bottom-4 text-center font-sans text-[11px] font-light tracking-wide text-ivory/60">
                    hover to reveal
                </span>
            )}
        </div>
    );
}
