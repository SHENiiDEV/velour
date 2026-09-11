import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { useReveal } from '@/lib/reveal';
import { usePrivacy } from '@/lib/velour';
import type { ProductCard } from '@/types/catalog';

interface CloseUpProps {
    products: ProductCard[];
}

/**
 * Крупный план: три вертикальных кадра из настоящего каталога, увеличенных
 * так, что видна фактура, а не каталожная выкладка. Товар показан прямо —
 * это витрина, а не мудборд, — но снят как деталь, а не как иллюстрация.
 *
 * В скрытном режиме кадры размыты, пока их не тронут: правило одно для всего сайта.
 */
export default function CloseUp({ products }: CloseUpProps) {
    const ref = useReveal<HTMLElement>();
    const { discreet } = usePrivacy();
    const [hover, setHover] = useState<number | null>(null);

    if (products.length === 0) return null;

    return (
        <section ref={ref} className="reveal px-[6vw] py-32" aria-labelledby="close-up">
            <div className="flex flex-wrap items-baseline justify-between gap-6">
                <h2 id="close-up" className="text-cine-lg max-w-3xl font-display font-light leading-[0.95] text-ivory">
                    Look closer.
                </h2>
                <Link href="/catalog" className="thread hidden font-sans text-sm font-light text-ivory/70 hover:text-ivory md:block">
                    Everything we stock
                </Link>
            </div>

            <p className="mt-8 max-w-md font-sans text-base font-light leading-relaxed text-mute">
                Latex, glass, steel and the things they are shaped into. No euphemisms in the listings — the material,
                the measurements and the care instructions are all on the page.
            </p>

            <div className="mt-16 grid gap-6 md:grid-cols-3">
                {products.slice(0, 3).map((p, i) => (
                    <article
                        key={p.id}
                        className="group"
                        style={{ '--i': i } as React.CSSProperties}
                        onMouseEnter={() => setHover(i)}
                        onMouseLeave={() => setHover(null)}
                    >
                        <Link href={`/p/${p.slug}`} data-cursor="lens" className="block">
                            <div className="sheen relative aspect-[4/5] max-h-[62svh] overflow-hidden bg-surface">
                                {p.cover ? (
                                    <img
                                        src={p.cover.url}
                                        alt={p.cover.alt ?? p.name}
                                        loading="lazy"
                                        decoding="async"
                                        /*
                                         * Кадр увеличен и слегка смещён: в каталоге товар
                                         * снят целиком на белом, а здесь нужна фактура.
                                         */
                                        className={`h-full w-full object-cover transition-transform duration-[1400ms] ease-[var(--ease-cine)] ${
                                            discreet && !p.cover.discreetSafe ? 'discreet-veil' : ''
                                        }`}
                                        style={{
                                            transform: `scale(${hover === i ? 1.9 : 1.65})`,
                                            transformOrigin: `${50 + (i - 1) * 12}% ${hover === i ? 42 : 50}%`,
                                        }}
                                    />
                                ) : (
                                    <div className="h-full w-full bg-gradient-to-br from-graphite to-surface" aria-hidden />
                                )}

                                {/* Тёплая тень к низу, чтобы имя не спорило с кадром */}
                                <div
                                    className="pointer-events-none absolute inset-0"
                                    style={{
                                        background:
                                            'linear-gradient(to top, rgb(16 10 12 / 0.85), rgb(16 10 12 / 0.1) 45%, transparent 70%)',
                                    }}
                                    aria-hidden
                                />

                                <div className="absolute inset-x-0 bottom-0 p-6">
                                    <h3 className="thread font-display text-2xl font-light text-ivory">{p.name}</h3>
                                    {p.tagline && (
                                        <p className="mt-1 line-clamp-2 font-sans text-sm font-light leading-relaxed text-ivory/65">
                                            {p.tagline}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Link>
                    </article>
                ))}
            </div>
        </section>
    );
}
