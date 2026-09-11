import { Link } from '@inertiajs/react';
import Veil from './Veil';
import { money } from '@/lib/money';
import type { ProductCard as ProductCardProps } from '@/types/catalog';

interface Props {
    product: ProductCardProps;
    index?: number;
}

/**
 * Карточка каталога. Тихий регистр: кадр, имя, одна строка намёка, цена «от».
 * Живёт только при наведении — блик света по кадру и золотая нить под именем.
 */
export default function ProductCard({ product, index = 0 }: Props) {
    return (
        <article className="group" style={{ '--i': index } as React.CSSProperties}>
            <Link href={`/p/${product.slug}`} className="block" aria-label={product.name}>
                <div className="sheen">
                    <Veil media={product.cover} sizes="(min-width: 1024px) 30vw, 50vw" />
                    {!product.inStock && (
                        <span className="absolute left-4 top-4 bg-void/70 px-3 py-1 font-sans text-[11px] font-light tracking-wide text-ivory backdrop-blur-sm">
                            back in stock soon
                        </span>
                    )}
                </div>

                <div className="mt-5 flex items-baseline justify-between gap-4">
                    <h3 className="thread font-display text-2xl font-light text-ivory">{product.name}</h3>
                    <span className="shrink-0 font-sans text-sm font-light text-mute">
                        from {money(product.priceFromCents, product.currency)}
                    </span>
                </div>
                {product.tagline && (
                    <p className="mt-1 font-sans text-sm font-light leading-relaxed text-mute">{product.tagline}</p>
                )}
            </Link>
        </article>
    );
}
