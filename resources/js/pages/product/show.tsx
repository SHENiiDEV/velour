import { Link, useForm } from '@inertiajs/react';
import { useMemo, useRef, useState } from 'react';
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
    const defaultVariant = product.variants.find((v) => v.isDefault && v.inStock) ?? product.variants.find((v) => v.inStock) ?? product.variants[0];
    const [variantId, setVariantId] = useState<number | undefined>(defaultVariant?.id);
    const variant = useMemo(() => product.variants.find((v) => v.id === variantId), [product.variants, variantId]);
    const [open, setOpen] = useState<'materials' | 'care' | null>('materials');

    const form = useForm({ variant_id: variantId ?? 0, qty: 1 });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!variant) return;
        form.transform((d) => ({ ...d, variant_id: variant.id }));
        form.post('/cart', { preserveScroll: true });
    };

    // Тёплое пятно света идёт за курсором по галерее
    const galleryRef = useRef<HTMLDivElement>(null);
    const onMove = (e: React.PointerEvent) => {
        const el = galleryRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
        el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
    };

    const [hero, ...rest] = product.media;

    return (
        <VelourLayout title={`${product.name} — VELOUR`}>
            <section className="grid gap-12 px-[6vw] pb-24 pt-32 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
                {/* Галерея: первый кадр крупно, остальные лентой */}
                <div ref={galleryRef} onPointerMove={onMove} className="cursor-glow space-y-4">
                    <Veil media={hero ?? null} ratio="4 / 5" priority sizes="(min-width: 1024px) 55vw, 100vw" />
                    {rest.length > 0 && (
                        <div className="grid grid-cols-2 gap-4">
                            {rest.map((m, i) => (
                                <Veil key={i} media={m} ratio="1 / 1" sizes="(min-width: 1024px) 27vw, 50vw" />
                            ))}
                        </div>
                    )}
                </div>

                {/* Информация — липнет при скролле */}
                <div className="stagger lg:sticky lg:top-32 lg:self-start">
                    <p className="flex flex-wrap items-baseline gap-x-3 font-sans text-sm font-light" style={{ '--i': 0 } as React.CSSProperties}>
                        <Link href={`/catalog/${product.category.slug}`} className="thread text-gold/90">
                            {product.category.name}
                        </Link>
                        {product.brand && <span className="text-mute">{product.brand}</span>}
                    </p>
                    <h1 className="mt-4 font-display text-6xl font-light leading-[0.95] text-ivory md:text-7xl" style={{ '--i': 1 } as React.CSSProperties}>
                        {product.name}
                    </h1>
                    {product.tagline && (
                        <p className="mt-4 font-display text-2xl font-light italic text-ivory/70" style={{ '--i': 2 } as React.CSSProperties}>
                            {product.tagline}
                        </p>
                    )}

                    <p className="mt-8 font-display text-3xl text-ivory" style={{ '--i': 3 } as React.CSSProperties}>
                        {money(variant?.priceCents ?? product.priceFromCents, product.currency)}
                    </p>

                    {/* Варианты */}
                    {product.variants.length > 1 && (
                        <div className="mt-8" style={{ '--i': 4 } as React.CSSProperties}>
                            <p className="font-sans text-xs font-light tracking-wide text-mute">Finish</p>
                            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                                {product.variants.map((v) => (
                                    <button
                                        key={v.id}
                                        type="button"
                                        onClick={() => setVariantId(v.id)}
                                        disabled={!v.inStock}
                                        aria-pressed={v.id === variantId}
                                        className={`thread font-display text-xl transition-colors disabled:line-through disabled:opacity-40 ${
                                            v.id === variantId ? 'text-gold-2' : 'text-ivory/70 hover:text-ivory'
                                        }`}
                                        aria-current={v.id === variantId ? 'page' : undefined}
                                    >
                                        {v.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* В корзину */}
                    <form onSubmit={submit} className="mt-10 flex flex-wrap items-center gap-6" style={{ '--i': 5 } as React.CSSProperties}>
                        <QtyStepper value={form.data.qty} max={10} onChange={(q) => form.setData('qty', q)} disabled={!variant?.inStock} />
                        <button
                            type="submit"
                            disabled={!variant?.inStock || form.processing}
                            data-magnetic className="btn-gold px-10 py-4 font-sans text-sm font-normal"
                        >
                            {variant?.inStock ? 'Add to cart' : 'Back in stock soon'}
                        </button>
                        {form.errors.variant_id && <span className="font-sans text-xs text-rose">{form.errors.variant_id}</span>}
                    </form>

                    <p className="mt-6 font-sans text-xs font-light leading-relaxed text-mute" style={{ '--i': 6 } as React.CSSProperties}>
                        Unmarked packaging · neutral line on your statement · 14-day returns if unopened
                    </p>

                    {/* Ощущения */}
                    {product.sensory.length > 0 && (
                        <div className="mt-12" style={{ '--i': 7 } as React.CSSProperties}>
                            <p className="font-sans text-xs font-light tracking-wide text-mute">Feel</p>
                            <div className="mt-2 divide-y divide-ivory/10">
                                {product.sensory.map((s) => (
                                    <SensoryScale key={s.key} item={s} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Материалы и уход — честно и без мелкого шрифта */}
                    <div className="mt-12 border-t border-ivory/10" style={{ '--i': 8 } as React.CSSProperties}>
                        <Disclosure
                            title="Material"
                            open={open === 'materials'}
                            onToggle={() => setOpen(open === 'materials' ? null : 'materials')}
                        >
                            {product.materials.length > 0 ? (
                                <ul className="space-y-1 font-display text-xl text-ivory">
                                    {product.materials.map((m) => (
                                        <li key={m}>{m}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="font-sans text-sm font-light text-mute">
                                    The manufacturer has not stated the composition. Write to us and we will ask them.
                                </p>
                            )}
                            {/* Обещание body-safe даём только там, где состав действительно известен. */}
                            {product.isBodySafe && product.materials.length > 0 && (
                                <p className="mt-3 font-sans text-sm font-light text-mute">Body-safe: non-porous, phthalate-free, certified for skin contact.</p>
                            )}
                            {product.description && <p className="mt-4 whitespace-pre-line font-sans text-sm font-light leading-relaxed text-mute">{product.description}</p>}
                        </Disclosure>
                        <Disclosure title="Care" open={open === 'care'} onToggle={() => setOpen(open === 'care' ? null : 'care')}>
                            <p className="font-sans text-sm font-light leading-relaxed text-mute">
                                {product.care ?? 'Warm water and mild soap, dried before storing. Water-based lubricant is the safe default when the material is not stated.'}
                            </p>
                        </Disclosure>
                    </div>
                </div>
            </section>

            {/* История — редакционный текст, тихий регистр */}
            {product.story && (
                <section className="px-[6vw] py-24">
                    <div className="hairline mb-16" />
                    <p className={`mx-auto max-w-3xl text-center font-display text-3xl font-light leading-snug text-ivory md:text-4xl ${discreet ? 'discreet-veil' : ''}`}>
                        {product.story}
                    </p>
                </section>
            )}

            {related.data.length > 0 && (
                <section className="px-[6vw] pb-24">
                    <h2 className="font-display text-4xl font-light text-ivory">Nearby</h2>
                    <div className="mt-12 grid gap-x-8 gap-y-16 sm:grid-cols-2 xl:grid-cols-3">
                        {related.data.map((p, i) => (
                            <ProductCard key={p.id} product={p} index={i} />
                        ))}
                    </div>
                </section>
            )}
        </VelourLayout>
    );
}

function Disclosure({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
    return (
        <div className="border-b border-ivory/10">
            <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center justify-between py-5 text-left">
                <span className="font-display text-2xl text-ivory">{title}</span>
                <span className="font-display text-2xl text-gold transition-transform duration-500" style={{ transform: open ? 'rotate(45deg)' : 'none' }} aria-hidden>
                    +
                </span>
            </button>
            <div
                className="grid transition-[grid-template-rows] duration-500 ease-[var(--ease-cine)]"
                style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
            >
                <div className="overflow-hidden">
                    <div className="pb-6">{children}</div>
                </div>
            </div>
        </div>
    );
}
