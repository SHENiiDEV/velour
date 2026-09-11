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

/** Shared props из HandleInertiaRequests::share(). */
export interface SharedProps {
    name: string;
    auth: { user: AuthUser | null };
    privacy: PrivacyProps;
    flash: { status: string | null };
    cartCount: number;
    [key: string]: unknown;
}
