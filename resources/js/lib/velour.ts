import { router, usePage } from '@inertiajs/react';
import type { SharedProps, ShopProps } from '@/types/velour';

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

const SHOP_FALLBACK: ShopProps = {
    currency: 'EUR',
    shippingFlatCents: 590,
    freeShippingFromCents: 9000,
    vatNote: 'incl. VAT',
    dispatchDays: '1–2',
    countries: {},
};

/** Условия доставки и пометка НДС из shared props. */
export function useShop(): ShopProps {
    return useShared().shop ?? SHOP_FALLBACK;
}

/** Имя варианта для покупателя: служебные «Default Title»/«Standard» не показываем (М2). */
export function variantLabel(name: string | null | undefined): string | null {
    if (!name) return null;
    return /^(default title|standard)$/i.test(name.trim()) ? null : name;
}

export function prefersReducedMotion(): boolean {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Нейтральный заголовок вкладки в скрытном режиме — без названия магазина. */
export const DISCREET_TITLE = 'Untitled';

/**
 * В скрытном режиме каждый внутренний переход заменяет запись истории (replace),
 * а не добавляет новую: после «Quick exit» кнопка «Назад» уводит максимум
 * на одну страницу магазина, а не на всю цепочку просмотренных.
 */
let discreetNow = false;

export function installDiscreetHistory() {
    router.on('navigate', (event) => {
        const props = event.detail.page.props as { privacy?: { discreet?: boolean } };
        discreetNow = Boolean(props.privacy?.discreet);
    });
    router.on('before', (event) => {
        if (discreetNow && event.detail.visit.method === 'get') {
            event.detail.visit.replace = true;
        }
    });
}

/** Layout сообщает текущее состояние (на случай первой загрузки до события navigate). */
export function syncDiscreet(value: boolean) {
    discreetNow = value;
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
