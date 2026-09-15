import { Link, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import ProductCard from '@/components/velour/ProductCard';
import QtyStepper from '@/components/velour/QtyStepper';
import SensoryScale from '@/components/velour/SensoryScale';
import Veil from '@/components/velour/Veil';
import VelourLayout from '@/layouts/velour-layout';
import { money } from '@/lib/money';
import { usePrivacy } from '@/lib/velour';
import type { ProductCard as ProductCardProps, ProductDetail } from '@/types/catalog';

interface ProductShowProps {
    product: ProductDetail;
    related: { data: ProductCardProps[] };
}

export default function ProductShow({ product, related }: ProductShowProps) {
    const { discreet } = usePrivacy();
    const defaultVariant =
        product.variants.find((v) => v.isDefault && v.inStock) ??
        product.variants.find((v) => v.inStock) ??
        product.variants[0];

    const [variantId, setVariantId] = useState<number | undefined>(defaultVariant?.id);
    const variant = useMemo(
        () => product.variants.find((v) => v.id === variantId) ?? defaultVariant,
        [product.variants, variantId, defaultVariant]
    );

    const [open, setOpen] = useState<'materials' | 'care' | null>('materials');
    const [activePhotoIndex, setActivePhotoIndex] = useState(0);
    const [showStickyBar, setShowStickyBar] = useState(false);

    const form = useForm({ variant_id: variantId ?? 0, qty: 1 });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!variant) return;
        form.transform((d) => ({ ...d, variant_id: variant.id }));
        form.post('/cart', { preserveScroll: true });
    };

    // Track scroll to show mobile floating buy bar
    const heroSectionRef = useRef<HTMLDivElement>(null);
    const mobileCarouselRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (!heroSectionRef.current) return;
            const bottom = heroSectionRef.current.getBoundingClientRect().bottom;
            setShowStickyBar(bottom < 150);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Scroll to specific photo in mobile carousel
    const scrollToPhoto = (index: number) => {
        setActivePhotoIndex(index);
        const container = mobileCarouselRef.current;
        if (!container) return;
        const itemWidth = container.clientWidth;
        container.scrollTo({ left: itemWidth * index, behavior: 'smooth' });
    };

    const handleMobileScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        const index = Math.round(container.scrollLeft / container.clientWidth);
        setActivePhotoIndex(index);
    };

    // Cursor glow on desktop
    const galleryRef = useRef<HTMLDivElement>(null);
    const onMove = (e: React.PointerEvent) => {
        const el = galleryRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
        el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
    };

    const [hero, ...rest] = product.media;
    const allMedia = product.media.length > 0 ? product.media : [null];

    return (
        <VelourLayout title={`${product.name} — VELOUR`}>
            <div ref={heroSectionRef}>
                <section className="grid gap-10 px-[5vw] pb-16 pt-28 sm:px-[6vw] sm:pb-24 sm:pt-36 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
                    {/* Media Gallery */}
                    <div>
                        {/* Mobile Swipeable Carousel (< lg) */}
                        <div className="relative block lg:hidden">
                            <div
                                ref={mobileCarouselRef}
                                onScroll={handleMobileScroll}
                                className="flex snap-x snap-mandatory overflow-x-auto no-scrollbar rounded-sm border border-ivory/10 bg-void/50"
                            >
                                {allMedia.map((m, i) => (
                                    <div key={i} className="min-w-full shrink-0 snap-center">
                                        <Veil
                                            media={m}
                                            ratio="4 / 5"
                                            priority={i === 0}
                                            sizes="100vw"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Mobile Pagination Counter & Dots */}
                            {allMedia.length > 1 && (
                                <div className="mt-4 flex items-center justify-between px-2">
                                    <div className="flex gap-1.5">
                                        {allMedia.map((_, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => scrollToPhoto(i)}
                                                className={`h-1.5 rounded-full transition-all ${
                                                    activePhotoIndex === i
                                                        ? 'w-6 bg-gold'
                                                        : 'w-1.5 bg-ivory/20'
                                                }`}
                                                aria-label={`Go to slide ${i + 1}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="font-sans text-xs font-light tracking-wider text-mute">
                                        {activePhotoIndex + 1} / {allMedia.length}
                                    </span>
                                </div>
                            )}

                            {/* Thumbnail Row */}
                            {allMedia.length > 1 && (
                                <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar py-1">
                                    {allMedia.map((m, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => scrollToPhoto(i)}
                                            className={`relative h-16 w-14 shrink-0 overflow-hidden rounded-[2px] border transition-all ${
                                                activePhotoIndex === i
                                                    ? 'border-gold scale-105 shadow-[0_0_10px_rgba(198,161,91,0.3)]'
                                                    : 'border-ivory/10 opacity-60 hover:opacity-100'
                                            }`}
                                        >
                                            <Veil media={m} ratio="1 / 1" sizes="60px" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Desktop Multi-Image Grid (>= lg) */}
                        <div ref={galleryRef} onPointerMove={onMove} className="cursor-glow hidden space-y-4 lg:block">
                            <Veil media={hero ?? null} ratio="4 / 5" priority sizes="55vw" />
                            {rest.length > 0 && (
                                <div className="grid grid-cols-2 gap-4">
                                    {rest.map((m, i) => (
                                        <Veil key={i} media={m} ratio="1 / 1" sizes="27vw" />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Info & Purchase Controls */}
                    <div className="stagger lg:sticky lg:top-32 lg:self-start">
                        {/* Category & Brand Header */}
                        <p className="flex flex-wrap items-baseline gap-x-3 font-sans text-xs font-light uppercase tracking-wider text-gold/90 sm:text-sm" style={{ '--i': 0 } as React.CSSProperties}>
                            <Link href={`/catalog/${product.category.slug}`} className="thread text-gold-2 font-medium">
                                {product.category.name}
                            </Link>
                            {product.brand && <span className="text-mute">• {product.brand}</span>}
                        </p>

                        <h1 className="mt-3 font-display text-4xl font-light leading-[0.95] text-ivory sm:text-6xl md:text-7xl" style={{ '--i': 1 } as React.CSSProperties}>
                            {product.name}
                        </h1>

                        {product.tagline && (
                            <p className="mt-3 font-display text-xl font-light italic text-ivory/70 sm:text-2xl" style={{ '--i': 2 } as React.CSSProperties}>
                                {product.tagline}
                            </p>
                        )}

                        {/* Price Display */}
                        <div className="mt-6 flex items-baseline gap-4" style={{ '--i': 3 } as React.CSSProperties}>
                            <span className="font-display text-3xl text-gold-2 font-normal sm:text-4xl">
                                {money(variant?.priceCents ?? product.priceFromCents, product.currency)}
                            </span>
                            <span className="font-sans text-xs font-light text-mute">
                                Discreet shipping included
                            </span>
                        </div>

                        {/* Variant / Finish Selector */}
                        {product.variants.length > 1 && (
                            <div className="mt-8 border-t border-ivory/10 pt-6" style={{ '--i': 4 } as React.CSSProperties}>
                                <div className="flex items-center justify-between">
                                    <span className="font-sans text-xs font-medium tracking-wider text-mute uppercase">
                                        Select Edition / Finish
                                    </span>
                                    <span className="font-sans text-xs text-gold-2">
                                        {variant?.name}
                                    </span>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2.5">
                                    {product.variants.map((v) => {
                                        const isSelected = v.id === variant?.id;
                                        return (
                                            <button
                                                key={v.id}
                                                type="button"
                                                onClick={() => setVariantId(v.id)}
                                                disabled={!v.inStock}
                                                aria-pressed={isSelected}
                                                className={`rounded-full border px-4 py-2 font-sans text-xs transition-all disabled:opacity-30 disabled:line-through ${
                                                    isSelected
                                                        ? 'border-gold bg-gold/15 text-gold-2 font-medium shadow-[0_0_12px_rgba(198,161,91,0.2)]'
                                                        : 'border-ivory/15 bg-surface/40 text-mute hover:border-ivory/40 hover:text-ivory'
                                                }`}
                                            >
                                                {v.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Desktop Add to Cart Form */}
                        <form onSubmit={submit} className="mt-8 flex flex-wrap items-center gap-4 sm:gap-6" style={{ '--i': 5 } as React.CSSProperties}>
                            <QtyStepper
                                value={form.data.qty}
                                max={10}
                                onChange={(q) => form.setData('qty', q)}
                                disabled={!variant?.inStock}
                            />
                            <button
                                type="submit"
                                disabled={!variant?.inStock || form.processing}
                                data-magnetic
                                className="btn-gold flex-1 py-4 text-center font-sans text-sm font-medium tracking-wider shadow-lg disabled:opacity-40 sm:flex-initial sm:px-10"
                            >
                                {variant?.inStock
                                    ? form.processing
                                        ? 'Reserving…'
                                        : 'Add to Bag'
                                    : 'Restocking Soon'}
                            </button>
                        </form>
                        {form.errors.variant_id && (
                            <span className="mt-2 block font-sans text-xs text-rose">{form.errors.variant_id}</span>
                        )}

                        {/* Discretion Guarantees */}
                        <div className="mt-6 rounded-sm border border-ivory/10 bg-void/40 p-4" style={{ '--i': 6 } as React.CSSProperties}>
                            <div className="flex flex-col gap-2 font-sans text-xs font-light text-mute">
                                <div className="flex items-center gap-2">
                                    <span className="text-gold-2">✓</span>
                                    <span>Guaranteed unbranded &amp; tamper-evident box</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-gold-2">✓</span>
                                    <span>Neutral billing descriptor on card statement</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-gold-2">✓</span>
                                    <span>14-day hygiene &amp; craftsmanship guarantee</span>
                                </div>
                            </div>
                        </div>

                        {/* Sensory Scales */}
                        {product.sensory.length > 0 && (
                            <div className="mt-10 border-t border-ivory/10 pt-6" style={{ '--i': 7 } as React.CSSProperties}>
                                <p className="font-sans text-xs font-medium tracking-wider text-mute uppercase">
                                    Sensory Characteristics
                                </p>
                                <div className="mt-3 divide-y divide-ivory/10">
                                    {product.sensory.map((s) => (
                                        <SensoryScale key={s.key} item={s} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Material & Care Accordions */}
                        <div className="mt-10 border-t border-ivory/10" style={{ '--i': 8 } as React.CSSProperties}>
                            <Disclosure
                                title="Material & Body Safety"
                                open={open === 'materials'}
                                onToggle={() => setOpen(open === 'materials' ? null : 'materials')}
                            >
                                {product.materials.length > 0 ? (
                                    <ul className="space-y-1 font-display text-xl text-ivory">
                                        {product.materials.map((m) => (
                                            <li key={m}>• {m}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="font-sans text-sm font-light text-mute">
                                        Medical-Grade Silicone and Phthalate-free components.
                                    </p>
                                )}
                                {product.isBodySafe && (
                                    <p className="mt-3 font-sans text-xs font-light leading-relaxed text-gold-2/90">
                                        ✓ 100% Body-safe: hypoallergenic, non-porous, laboratory-tested for skin contact.
                                    </p>
                                )}
                                {product.description && (
                                    <p className="mt-4 whitespace-pre-line font-sans text-sm font-light leading-relaxed text-mute">
                                        {product.description}
                                    </p>
                                )}
                            </Disclosure>
                            <Disclosure title="Care & Preservation" open={open === 'care'} onToggle={() => setOpen(open === 'care' ? null : 'care')}>
                                <p className="font-sans text-sm font-light leading-relaxed text-mute">
                                    {product.care ?? 'Clean thoroughly with warm water and mild soap before and after each use. Store away from direct sunlight.'}
                                </p>
                            </Disclosure>
                        </div>
                    </div>
                </section>
            </div>

            {/* Editorial Story */}
            {product.story && (
                <section className="px-[5vw] py-16 sm:px-[6vw] sm:py-24">
                    <div className="hairline mb-12" />
                    <p className={`mx-auto max-w-3xl text-center font-display text-2xl font-light leading-snug text-ivory sm:text-3xl md:text-4xl ${discreet ? 'discreet-veil' : ''}`}>
                        {product.story}
                    </p>
                </section>
            )}

            {/* Nearby Products */}
            {related.data.length > 0 && (
                <section className="px-[5vw] pb-24 sm:px-[6vw]">
                    <div className="flex items-center justify-between border-b border-ivory/10 pb-4">
                        <h2 className="font-display text-3xl font-light text-ivory sm:text-4xl">Nearby Creations</h2>
                        <Link href="/catalog" className="font-sans text-xs text-gold-2 hover:underline">
                            View All →
                        </Link>
                    </div>
                    <div className="mt-8 grid grid-cols-2 gap-3.5 sm:gap-6 lg:grid-cols-3">
                        {related.data.map((p, i) => (
                            <ProductCard key={p.id} product={p} index={i} />
                        ))}
                    </div>
                </section>
            )}

            {/* Floating Sticky Mobile Buy Bar (< lg) */}
            {showStickyBar && (
                <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ivory/15 bg-surface/95 px-5 py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md pb-safe lg:hidden animate-in slide-in-from-bottom duration-300">
                    <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-display text-base font-light text-ivory">
                                {product.name}
                            </p>
                            <p className="font-sans text-xs font-medium text-gold-2">
                                {money(variant?.priceCents ?? product.priceFromCents, product.currency)}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={submit}
                            disabled={!variant?.inStock || form.processing}
                            className="btn-gold px-6 py-3 font-sans text-xs font-medium tracking-wider shadow-md disabled:opacity-40"
                        >
                            {variant?.inStock ? 'Add to Bag' : 'Sold Out'}
                        </button>
                    </div>
                </div>
            )}
        </VelourLayout>
    );
}

function Disclosure({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
    return (
        <div className="border-b border-ivory/10">
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={open}
                className="flex w-full items-center justify-between py-5 text-left"
            >
                <span className="font-display text-xl sm:text-2xl text-ivory">{title}</span>
                <span className="font-display text-2xl text-gold transition-transform duration-300" style={{ transform: open ? 'rotate(45deg)' : 'none' }} aria-hidden>
                    +
                </span>
            </button>
            <div
                className="grid transition-[grid-template-rows] duration-300 ease-[var(--ease-cine)]"
                style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
            >
                <div className="overflow-hidden">
                    <div className="pb-6">{children}</div>
                </div>
            </div>
        </div>
    );
}
