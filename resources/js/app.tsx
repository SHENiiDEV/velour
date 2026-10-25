// Шрифты — со своего домена, а не с Google Fonts: без передачи IP третьей стороне до согласия (аудит, В8).
import '@fontsource/cormorant-garamond/300.css';
import '@fontsource/cormorant-garamond/300-italic.css';
import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/cormorant-garamond/400-italic.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/jost/300.css';
import '@fontsource/jost/400.css';
import '@fontsource/jost/500.css';
import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { DISCREET_TITLE, installDiscreetHistory } from './lib/velour';

const appName = import.meta.env.VITE_APP_NAME || 'VELOUR';

/** «NOVA» → «NOVA — VELOUR». Без дубля, если страница уже назвала бренд; в скрытном режиме — нейтрально. */
function pageTitle(title: string): string {
    if (!title) return appName;
    if (title === DISCREET_TITLE || title.includes(appName)) return title;
    return `${title} — ${appName}`;
}

createInertiaApp({
    title: pageTitle,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    // Занавес (PageCurtain) закрывает переход сам; полоска нужна только
    // если ответ задержался дольше секунды — и тогда она золотая, не серая.
    progress: {
        color: '#C6A15B',
        delay: 1000,
    },
});

// This will set light / dark mode on load...
initializeTheme();

// В скрытном режиме внутренние переходы не копят историю браузера.
installDiscreetHistory();
