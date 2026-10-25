import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import VelourLayout from '@/layouts/velour-layout';

export interface LegalSection {
    id: string;
    title: string;
    body: ReactNode;
}

interface LegalPageProps {
    title: string;
    lede?: ReactNode;
    updated: string;
    sections: LegalSection[];
    description?: string;
    children?: ReactNode;
}

/** Ссылки между юридическими страницами — одинаковые названия везде (М3). */
export const LEGAL_LINKS = [
    { href: '/delivery', label: 'Delivery' },
    { href: '/returns', label: 'Returns & withdrawal' },
    { href: '/terms', label: 'Terms of sale' },
    { href: '/privacy', label: 'Privacy policy' },
    { href: '/cookies', label: 'Cookies' },
    { href: '/legal-notice', label: 'Legal notice & contact' },
];

/**
 * Юридические страницы в «тихом» регистре: простой язык, крупный кегль, оглавление.
 * Поэтичный тон — для главной и журнала; здесь важнее ясность (аудит, «Единый голос»).
 */
export default function LegalPage({ title, lede, updated, sections, description, children }: LegalPageProps) {
    return (
        <VelourLayout title={title} description={description ?? `${title} — VELOUR`}>
            <section className="px-[6vw] pb-24 pt-36 md:pt-44">
                <h1 className="font-display text-5xl font-light leading-[0.95] text-ivory md:text-7xl">{title}</h1>
                {lede && <div className="mt-6 max-w-2xl font-sans text-lg leading-relaxed text-ivory/80">{lede}</div>}
                <p className="mt-4 font-sans text-sm text-mute">Last updated: {updated}</p>

                <div className="mt-14 grid gap-12 lg:grid-cols-[220px_1fr] lg:gap-20">
                    <nav aria-label="On this page" className="hidden lg:sticky lg:top-32 lg:block lg:self-start">
                        <ul className="space-y-2 font-sans text-sm text-mute">
                            {sections.map((s) => (
                                <li key={s.id}>
                                    <a href={`#${s.id}`} className="hover:text-ivory">
                                        {s.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="max-w-3xl">
                        {sections.map((s) => (
                            <section key={s.id} id={s.id} className="scroll-mt-32 border-b border-ivory/10 py-8 first:pt-0">
                                <h2 className="font-display text-3xl font-light text-ivory">{s.title}</h2>
                                <div className="legal-body mt-4">{s.body}</div>
                            </section>
                        ))}
                        {children}

                        <nav aria-label="Legal" className="mt-12 flex flex-wrap gap-x-6 gap-y-2 font-sans text-sm text-mute">
                            {LEGAL_LINKS.map((l) => (
                                <Link key={l.href} href={l.href} className="underline-offset-4 hover:text-ivory hover:underline">
                                    {l.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            </section>
        </VelourLayout>
    );
}
