import { usePage } from '@inertiajs/react';
import type { SharedProps } from '@/types/velour';

/**
 * Палитра для шейдера — те же значения, что в resources/css/app.css (@theme).
 * Меняешь токен — меняй здесь.
 */
export const palette = {
    void: '#100A0C',
    surface: '#1A1216',
    graphite: '#231A1F',
    wine: '#4E1224',
    rose: '#C24D59',
    gold: '#C6A15B',
    gold2: '#E6CB88',
    ivory: '#ECE3D6',
    mute: '#9E8E88',
} as const;

export function useShared(): Partial<SharedProps> {
    try {
        const page = usePage<SharedProps>();
        return page?.props || {};
    } catch {
        return {};
    }
}

export function usePrivacy() {
    const shared = useShared();
    return (
        shared.privacy || {
            discreet: false,
            ageVerified: false,
            exitUrl: 'https://www.google.com',
        }
    );
}

export function prefersReducedMotion(): boolean {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Быстрый выход: заменяем текущую запись истории, чтобы «назад» не вёл на VELOUR. */
export function quickExit(url?: string) {
    const target = url || 'https://www.google.com';
    try {
        window.history.replaceState(null, '', '/');
    } catch {
        /* noop */
    }
    window.location.replace(target);
}
