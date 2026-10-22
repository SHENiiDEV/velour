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
}

/** Shared props из HandleInertiaRequests::share(). */
export interface SharedProps {
    name: string;
    auth: { user: AuthUser | null };
    privacy: PrivacyProps;
    company: CompanyProps;
    flash: { status: string | null };
    cartCount: number;
    [key: string]: unknown;
}
