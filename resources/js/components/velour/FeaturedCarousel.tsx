import { Link } from '@inertiajs/react';
import { useRef } from 'react';
import ProductCard from './ProductCard';
import { useReveal } from '@/lib/reveal';
import type { ProductCard as ProductCardProps } from '@/types/catalog';

interface FeaturedCarouselProps {
    products: ProductCardProps[];
}

/** Горизонтальная лента избранного: тянется мышью, липнет к карточкам. */
export default function FeaturedCarousel({ products }: FeaturedCarouselProps) {
    const ref = useReveal<HTMLElement>();
    const track = useRef<HTMLDivElement>(null);
    const drag = useRef({ active: false, x: 0, left: 0, moved: 0 });

    const down = (e: React.PointerEvent) => {
        const el = track.current;
        if (!el) return;
        drag.current = { active: true, x: e.clientX, left: el.scrollLeft, moved: 0 };
        el.setPointerCapture(e.pointerId);
    };

    const move = (e: React.PointerEvent) => {
        const el = track.current;
        if (!el || !drag.current.active) return;
        const dx = e.clientX - drag.current.x;
        drag.current.moved = Math.abs(dx);
        el.scrollLeft = drag.current.left - dx;
    };

    const up = (e: React.PointerEvent) => {
        drag.current.active = false;
        track.current?.releasePointerCapture(e.pointerId);
    };

    // Небольшой сдвиг мышью не должен открывать товар вместо прокрутки.
    const guard = (e: React.MouseEvent) => {
        if (drag.current.moved > 8) e.preventDefault();
    };

    if (products.length === 0) return null;

    return (
        <section ref={ref} className="reveal py-32" aria-labelledby="now">
            <div className="flex items-end justify-between px-[6vw]">
                <h2 id="now" className="font-display text-5xl font-light text-ivory md:text-6xl">
                    Now
                </h2>
                <Link href="/catalog" className="thread font-sans text-sm font-light text-ivory/70 hover:text-ivory">
                    The whole collection
                </Link>
            </div>

            <div
                ref={track}
                onPointerDown={down}
                onPointerMove={move}
                onPointerUp={up}
                onPointerCancel={up}
                onClickCapture={guard}
                className="mt-14 flex snap-x snap-mandatory gap-8 overflow-x-auto px-[6vw] pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                style={{ cursor: 'grab' }}
            >
                {products.map((p, i) => (
                    <div key={p.id} className="w-[78vw] shrink-0 snap-start sm:w-[42vw] xl:w-[27vw]">
                        <ProductCard product={p} index={i} />
                    </div>
                ))}
            </div>
        </section>
    );
}
