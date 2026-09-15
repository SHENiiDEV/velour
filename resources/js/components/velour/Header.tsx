import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import DiscreetToggle from './DiscreetToggle';
import QuickExit from './QuickExit';
import Wordmark from './Wordmark';
import { usePrivacy, useShared } from '@/lib/velour';

const mainNav = [
    { href: '/catalog', label: 'Collection' },
    { href: '/journal', label: 'Journal' },
    { href: '/care', label: 'Care' },
];

const categories = [
    { slug: 'objects', name: 'Objects', num: '01' },
    { slug: 'intimacy', name: 'Intimacy', num: '02' },
    { slug: 'sensations', name: 'Sensations', num: '03' },
    { slug: 'silk', name: 'Silk', num: '04' },
    { slug: 'rituals', name: 'Rituals', num: '05' },
];

export default function Header() {
    const { discreet } = usePrivacy();
    const shared = useShared();
    const cartCount = typeof shared.cartCount === 'number' ? shared.cartCount : 0;
    const page = usePage();
    const url = page?.url || '';
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Закрываем шторку при смене страницы и разблокируем скролл
    useEffect(() => {
        setOpen(false);
        document.body.style.overflow = '';
    }, [url]);

    // Блокируем скролл body при открытом мобильном меню
    const toggleMenu = () => {
        setOpen((prev) => {
            const next = !prev;
            document.body.style.overflow = next ? 'hidden' : '';
            return next;
        });
    };

    const isActive = (href: string) => url === href || url.startsWith(href + '/');

    return (
        <>
            <header
                className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
                    scrolled && !open
                        ? 'border-b border-ivory/10 bg-void/85 py-4 backdrop-blur-md'
                        : 'bg-gradient-to-b from-void/90 to-transparent py-5 sm:py-6'
                }`}
            >
                <div className="flex items-center justify-between px-[5vw] sm:px-[6vw]">
                    {/* Wordmark */}
                    <div className="shrink-0">
                        <Wordmark discreet={discreet} />
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden items-center gap-10 md:flex" aria-label="Main menu">
                        {mainNav.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="thread font-sans text-sm font-light text-ivory/80 transition-colors hover:text-ivory"
                                aria-current={isActive(item.href) ? 'page' : undefined}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4 sm:gap-6 md:gap-8">
                        <div className="hidden items-center gap-8 md:flex">
                            <DiscreetToggle />
                            <QuickExit />
                        </div>

                        {/* Cart Button */}
                        <Link
                            href="/cart"
                            className="group relative flex items-center gap-2 rounded-full border border-ivory/10 bg-surface/40 px-3.5 py-1.5 font-sans text-xs font-light text-ivory/90 backdrop-blur-sm transition-all hover:border-gold/40 hover:text-ivory sm:px-4 sm:py-2"
                            aria-label={`Cart, ${cartCount} items`}
                        >
                            <span className="font-sans text-xs tracking-wider">Cart</span>
                            {cartCount > 0 && (
                                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 font-display text-xs font-semibold text-void">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* Mobile Hamburger Toggle Button */}
                        <button
                            type="button"
                            onClick={toggleMenu}
                            aria-expanded={open}
                            aria-label={open ? 'Close Menu' : 'Open Menu'}
                            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-ivory/10 bg-surface/50 text-ivory transition-colors hover:border-gold/40 md:hidden"
                        >
                            <div className="relative h-4 w-5">
                                <span
                                    className={`absolute left-0 top-0.5 h-[1.5px] w-5 bg-ivory transition-transform duration-300 ${
                                        open ? 'translate-y-[6px] rotate-45 bg-gold-2' : ''
                                    }`}
                                />
                                <span
                                    className={`absolute left-0 top-[7px] h-[1.5px] w-5 bg-ivory transition-opacity duration-200 ${
                                        open ? 'opacity-0' : 'opacity-100'
                                    }`}
                                />
                                <span
                                    className={`absolute left-0 top-[13.5px] h-[1.5px] w-5 bg-ivory transition-transform duration-300 ${
                                        open ? '-translate-y-[7px] -rotate-45 bg-gold-2' : ''
                                    }`}
                                />
                            </div>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Full-Screen Seductive Curtain Drawer */}
            {open && (
                <div className="curtain fixed inset-0 z-30 flex flex-col justify-between overflow-y-auto bg-gradient-to-b from-void via-surface to-wine px-[6vw] pb-safe pt-28 text-ivory md:hidden">
                    {/* Ambient Glow */}
                    <div className="pointer-events-none absolute -right-20 top-20 h-72 w-72 rounded-full bg-gold/10 blur-[100px]" />
                    <div className="pointer-events-none absolute -left-20 bottom-20 h-72 w-72 rounded-full bg-wine/30 blur-[100px]" />

                    <div className="relative space-y-8">
                        {/* Primary Sections */}
                        <div>
                            <span className="font-sans text-[10px] font-medium tracking-[0.25em] text-gold-2 uppercase">
                                Sanctuary Directory
                            </span>
                            <nav className="mt-4 space-y-4">
                                {mainNav.map((item, i) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="block font-display text-4xl font-light text-ivory transition-colors hover:text-gold-2"
                                        style={{ '--i': i } as React.CSSProperties}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        {/* Category Fast Links */}
                        <div className="border-t border-ivory/10 pt-6">
                            <span className="font-sans text-[10px] font-medium tracking-[0.25em] text-mute uppercase">
                                Categories
                            </span>
                            <div className="mt-3 grid grid-cols-2 gap-3">
                                {categories.map((c) => (
                                    <Link
                                        key={c.slug}
                                        href={`/catalog/${c.slug}`}
                                        className="group flex items-center justify-between rounded-sm border border-ivory/10 bg-void/40 p-3 transition-all hover:border-gold/30 hover:bg-void/70"
                                    >
                                        <span className="font-display text-lg text-ivory transition-colors group-hover:text-gold-2">
                                            {c.name}
                                        </span>
                                        <span className="font-sans text-[10px] font-light text-gold-2">
                                            {c.num}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Legal & Manifesto Links */}
                        <div className="border-t border-ivory/10 pt-4 flex flex-wrap gap-x-5 gap-y-2 font-sans text-xs font-light text-mute">
                            <Link href="/privacy" className="hover:text-ivory transition-colors">
                                Privacy Manifesto
                            </Link>
                            <Link href="/terms" className="hover:text-ivory transition-colors">
                                Terms
                            </Link>
                            <Link href="/care" className="hover:text-ivory transition-colors">
                                Materials
                            </Link>
                        </div>
                    </div>

                    {/* Footer Controls: Discreet Mode & Quick Exit */}
                    <div className="relative mt-8 border-t border-ivory/15 pt-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <DiscreetToggle />
                            <QuickExit />
                        </div>
                        <p className="font-sans text-[11px] font-light leading-relaxed text-mute/80">
                            🔒 100% Unmarked Box · Anonymous Bank Billing · Zero Trackers
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
