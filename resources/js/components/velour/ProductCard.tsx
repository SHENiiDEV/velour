import { Link } from '@inertiajs/react';
import Veil from './Veil';
import { money } from '@/lib/money';
import type { ProductCard as ProductCardProps } from '@/types/catalog';

interface Props {
    product: ProductCardProps;
    index?: number;
}

/**
 * Карточка каталога.
 * Адаптивная типографика для мобильных экранов, плавный блик и тактильный ховер.
 */
export default function ProductCard({ product, index = 0 }: Props) {
    return (
        <article className="group" style={{ '--i': index } as React.CSSProperties}>
            <Link href={`/p/${product.slug}`} className="block select-none" aria-label={product.name}>
                <div className="sheen relative overflow-hidden rounded-[2px] border border-ivory/10 bg-void/50 transition-all duration-300 group-hover:border-gold/30">
                    <Veil media={product.cover} ratio="4 / 5" sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 50vw" />
                    {!product.inStock && (
                        <span className="absolute left-2.5 top-2.5 rounded-[2px] bg-void/80 px-2 py-0.5 font-sans text-[10px] font-light tracking-wider text-ivory backdrop-blur-sm sm:left-4 sm:top-4 sm:px-3 sm:py-1 sm:text-[11px]">
                            Restocking
                        </span>
                    )}
                </div>

                <div className="mt-3.5 sm:mt-5">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
                        <h3 className="thread line-clamp-1 font-display text-lg font-light text-ivory transition-colors group-hover:text-gold-2 sm:text-2xl">
                            {product.name}
                        </h3>
                        <span className="shrink-0 font-sans text-xs font-normal text-gold-2 sm:text-sm sm:text-mute">
                            {money(product.priceFromCents, product.currency)}
                        </span>
                    </div>
                    {product.tagline && (
                        <p className="mt-1 line-clamp-2 font-sans text-xs font-light leading-relaxed text-mute sm:text-sm">
                            {product.tagline}
                        </p>
                    )}
                </div>
            </Link>
        </article>
    );
}
