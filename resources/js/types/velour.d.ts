export interface AuthUser {
    id: number;
    name: string;
    email: string;
}

export interface PrivacyProps {
    /** Скрытный режим: blur превью, нейтральный header. */
    discreet: boolean;
    ageVerified: boolean;
    /** Нейтральный сайт для быстрого выхода. */
    exitUrl: string;
}

/** Юридические реквизиты продавца (config/velour.php → company). */
export interface CompanyProps {
    name: string;
    address: string;
    reg_number: string;
    email: string;
    phone: string;
    vat_number: string;
    returns_address: string;
}

export interface ShopProps {
    currency: string;
    shippingFlatCents: number;
    freeShippingFromCents: number;
    /** «incl. VAT» или пусто. */
    vatNote: string | null;
    dispatchDays: string;
    countries: Record<string, { name: string; transit: string }>;
}

/** Shared props из HandleInertiaRequests::share(). */
export interface SharedProps {
    name: string;
    auth: { user: AuthUser | null };
    privacy: PrivacyProps;
    company: CompanyProps;
    shop: ShopProps;
    navCategories?: Array<{ slug: string; name: string }>;
    flash: { status: string | null };
    cartCount: number;
    [key: string]: unknown;
}
