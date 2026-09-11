/** Типы Inertia props каталога, корзины и заказа. Держать в синхроне с App\Http\Resources. */

export interface MediaProps {
    url: string;
    alt: string | null;
    kind?: 'image' | 'video' | 'poster';
    /** Кадр абстрактный — можно показать без blur даже в скрытном режиме. */
    discreetSafe: boolean;
    meta?: { w?: number; h?: number; blurhash?: string } | null;
}

export interface ProductCard {
    id: number;
    slug: string;
    name: string;
    tagline: string | null;
    priceFromCents: number;
    currency: string;
    inStock: boolean;
    isBodySafe: boolean;
    cover: MediaProps | null;
}

export interface SensoryValue {
    key: string;
    label: string;
    value: number | string | boolean;
    valueLabel: string | null;
    scale: { min: number; max: number; labels: Record<string, string> } | null;
}

export interface VariantProps {
    id: number;
    sku: string;
    name: string;
    options: Record<string, string> | null;
    priceCents: number;
    inStock: boolean;
    isDefault: boolean;
}

export interface ProductDetail {
    id: number;
    slug: string;
    name: string;
    tagline: string | null;
    description: string | null;
    story: string | null;
    care: string | null;
    materials: string[];
    isBodySafe: boolean;
    /** Производитель — заполняется при импорте из чужого каталога. */
    brand: string | null;
    currency: string;
    priceFromCents: number;
    category: { slug: string; name: string };
    sensory: SensoryValue[];
    variants: VariantProps[];
    media: MediaProps[];
}

export interface FilterDefinition {
    key: string;
    label: string;
    type: 'scale' | 'enum' | 'bool';
    scale: { min: number; max: number; labels: Record<string, string> } | null;
    options: Array<{ value: string; label: string }> | null;
}

export interface CartItemProps {
    id: number;
    qty: number;
    unitPriceCents: number;
    totalCents: number;
    maxQty: number;
    variant: { id: number; name: string; sku: string };
    product: { slug: string; name: string; cover: MediaProps | null };
}

export interface CartProps {
    currency: string;
    itemCount: number;
    subtotalCents: number;
    shippingCents: number;
    totalCents: number;
    freeShippingFromCents: number;
    items: CartItemProps[];
}

export interface OrderSummary {
    number: string;
    status: string;
    statusLabel: string;
    email: string;
    currency: string;
    totalCents: number;
    isDiscreetPackaging: boolean;
    statementDescriptor: string | null;
    items: Array<{ name: string; variant: string | null; qty: number; totalCents: number }>;
}

/** Laravel Paginator in JsonResource::collection wrapper. */
export interface Paginated<T> {
    data: T[];
    links?: Array<{ url: string | null; label: string; active: boolean }> | { first?: string; last?: string; prev?: string; next?: string };
    meta?: {
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
        links?: Array<{ url: string | null; label: string; active: boolean }>;
    };
    current_page?: number;
    last_page?: number;
    total?: number;
    per_page?: number;
}
