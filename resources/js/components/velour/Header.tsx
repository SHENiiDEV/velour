import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import DiscreetToggle from './DiscreetToggle';
import QuickExit from './QuickExit';
import Wordmark from './Wordmark';
import { usePrivacy, useShared } from '@/lib/velour';

const nav = [
    { href: '/catalog', label: 'Collection' },
    { href: '/journal', label: 'Journal' },
    { href: '/care', label: 'Care' },
];

export default function Header() {
    const { discreet } = usePrivacy();
    const { cartCount } = useShared();
    const { url } = usePage();
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Закрываем шторку при переходе
    useEffect(() => setOpen(false), [url]);

    const isActive = (href: string) => url === href || url.startsWith(href + '/');

    return (
        <>
            <header
                className={`fixed inset-x-0 top-0 z-30 transition-[background-color,backdrop-filter] duration-700 ${
                    scrolled && !open ? 'bg-void/70 backdrop-blur-md' : 'bg-transparent'
                }`}
            >
                <div className="flex items-center justify-between px-[6vw] py-6">
                    <Wordmark discreet={discreet} />

                    <nav className="hidden items-center gap-10 md:flex" aria-label="Main menu">
                        {nav.map((item) => (
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

                    <div className="flex items-center gap-6 md:gap-8">
                        <div className="hidden items-center gap-8 md:flex">
                            <DiscreetToggle />
                            <QuickExit />
                        </div>
                        <Link href="/cart" className="thread font-sans text-sm font-light text-ivory/80 hover:text-ivory" aria-label={`Cart, ${cartCount} items`}>
                            Cart{cartCount > 0 && <span className="ml-1.5 font-display text-base text-gold">{cartCount}</span>}
                        </Link>
                        <button
                            type="button"
                            onClick={() => setOpen((o) => !o)}
                            aria-expanded={open}
                            aria-label="Menu"
                            className="relative h-6 w-8 md:hidden"
                        >
                            <span className={`absolute left-0 top-1.5 h-px w-8 bg-ivory transition-transform duration-500 ${open ? 'translate-y-[7px] rotate-45' : ''}`} />
                            <span className={`absolute left-0 top-[19px] h-px w-8 bg-ivory transition-transform duration-500 ${open ? '-translate-y-[6px] -rotate-45' : ''}`} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Мобильная шторка — опускается сверху, как занавес */}
            {open && (
                <div className="curtain fixed inset-0 z-20 flex flex-col justify-between bg-wine px-[6vw] pb-10 pt-32 md:hidden">
                    <nav className="stagger space-y-6" aria-label="Mobile menu">
                        {[...nav, { href: '/cart', label: 'Cart' }].map((item, i) => (
                            <Link key={item.href} href={item.href} className="block font-display text-5xl font-light text-ivory" style={{ '--i': i } as React.CSSProperties}>
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="flex items-center justify-between">
                        <DiscreetToggle />
                        <QuickExit />
                    </div>
                </div>
            )}
        </>
    );
}
