import ProductCard from '@/components/velour/ProductCard';
import type { ProductCard as ProductCardProps } from '@/types/catalog';
import { Link } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface FeaturedRailProps {
    products: ProductCardProps[];
    className?: string;
}

/**
 * Акт IV: карусель избранного. Горизонтальный снап вместо сетки —
 * коллекция читается как кадры на монтажном столе, а не как склад.
 * Прокрутка нативная: колесо, свайп, стрелки и клавиатура работают сами.
 */
export default function FeaturedRail({ products, className = '' }: FeaturedRailProps) {
    const railRef = useRef<HTMLUListElement>(null);
    const [atStart, setAtStart] = useState(true);
    const [atEnd, setAtEnd] = useState(false);

    const syncEdges = useCallback(() => {
        const rail = railRef.current;
        if (!rail) return;
        const max = rail.scrollWidth - rail.clientWidth;
        setAtStart(rail.scrollLeft <= 8);
        setAtEnd(max <= 8 || rail.scrollLeft >= max - 8);
    }, []);

    useEffect(() => {
        syncEdges();
        window.addEventListener('resize', syncEdges);
        return () => window.removeEventListener('resize', syncEdges);
    }, [syncEdges]);

    const step = (direction: -1 | 1) => {
        const rail = railRef.current;
        if (!rail) return;
        const card = rail.querySelector('li');
        const distance = card ? card.clientWidth + 32 : rail.clientWidth * 0.8;
        rail.scrollBy({ left: distance * direction, behavior: 'smooth' });
    };

    return (
        <section className={`py-32 ${className}`} aria-labelledby="now-heading">
            <div className="flex items-end justify-between px-[6vw]">
                <div>
                    <p className="text-gold/90 mb-3 font-sans text-sm font-light">The house collection</p>
                    <h2 id="now-heading" className="font-display text-ivory text-5xl font-light md:text-6xl">
                        Now
                    </h2>
                </div>
                <Link href="/catalog" className="thread text-ivory/80 hover:text-ivory font-sans text-sm font-light">
                    The whole collection
                </Link>
            </div>

            <ul
                ref={railRef}
                onScroll={syncEdges}
                className="rail stagger mt-14 flex snap-x gap-8 overflow-x-auto px-[6vw] pb-4"
                tabIndex={0}
                aria-label="Featured pieces"
            >
                {products.map((product, index) => (
                    <li
                        key={product.id}
                        className="w-[78vw] shrink-0 sm:w-[46vw] lg:w-[30vw] xl:w-[23vw]"
                        style={{ '--i': index } as React.CSSProperties}
                    >
                        <ProductCard product={product} index={index} />
                    </li>
                ))}
            </ul>

            {/* Слова вместо стрелок: управление каруселью остаётся в языке бренда */}
            <div className="mt-10 flex items-center gap-8 px-[6vw]">
                <button
                    type="button"
                    onClick={() => step(-1)}
                    disabled={atStart}
                    className="thread text-ivory/70 hover:text-ivory font-sans text-sm font-light transition-colors disabled:opacity-30"
                >
                    Back
                </button>
                <button
                    type="button"
                    onClick={() => step(1)}
                    disabled={atEnd}
                    className="thread text-ivory/70 hover:text-ivory font-sans text-sm font-light transition-colors disabled:opacity-30"
                >
                    Next
                </button>
                <span className="text-mute font-sans text-xs font-light">{products.length} pieces</span>
            </div>
        </section>
    );
}
