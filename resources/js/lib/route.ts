/**
 * Минимальная замена Ziggy `route()` для страниц стартер-кита (auth/settings).
 * Ziggy в проекте не подключён — без этого /login и /register падали с
 * «ReferenceError: route is not defined» и показывали чёрный экран.
 */
const ROUTES = {
    home: '/',
    login: '/login',
    logout: '/logout',
    register: '/register',
    dashboard: '/dashboard',
    'password.request': '/forgot-password',
    'password.email': '/forgot-password',
    'password.store': '/reset-password',
    'password.confirm': '/confirm-password',
    'password.edit': '/settings/password',
    'password.update': '/settings/password',
    'verification.send': '/email/verification-notification',
    'profile.edit': '/settings/profile',
    'profile.update': '/settings/profile',
    'profile.destroy': '/settings/profile',
} as const;

export type RouteName = keyof typeof ROUTES;

export function route(name: RouteName): string {
    return ROUTES[name];
}
