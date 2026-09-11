import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { useReveal } from '@/lib/reveal';

interface DoorListProps {
    categories: Array<{ slug: string; name: string; tagline: string | null }>;
}

/**
 * Разделы как двери: наведение отодвигает имя вправо, а справа проступает
 * температура раздела. Ничего не показываем — только приглашаем войти.
 */
export default function DoorList({ categories }: DoorListProps) {
    const ref = useReveal<HTMLElement>();
    const [hover, setHover] = useState<string | null>(null);

    return (
        <section ref={ref} className="reveal relative px-[6vw] py-8" aria-label="Sections">
            <ul className="divide-y divide-ivory/10 border-y border-ivory/10">
                {categories.map((c, i) => (
                    <li key={c.slug}>
                        <Link
                            href={`/catalog/${c.slug}`}
                            onMouseEnter={() => setHover(c.slug)}
                            onMouseLeave={() => setHover(null)}
                            className="group relative grid items-baseline gap-2 overflow-hidden py-10 md:grid-cols-[1fr_1fr_auto] md:px-4"
                            style={{ '--i': i } as React.CSSProperties}
                        >
                            {/* Тёплая заливка выезжает снизу, как свет из-под двери */}
                            <span
                                className="pointer-events-none absolute inset-0 -z-10 origin-bottom bg-gradient-to-t from-wine/40 to-transparent transition-transform duration-700 ease-[var(--ease-cine)]"
                                style={{ transform: hover === c.slug ? 'scaleY(1)' : 'scaleY(0)' }}
                                aria-hidden
                            />
                            <span className="font-display text-5xl font-light text-ivory transition-transform duration-700 ease-[var(--ease-cine)] group-hover:translate-x-4 md:text-7xl">
                                {c.name}
                            </span>
                            <span className="font-display text-xl font-light italic text-mute transition-colors duration-500 group-hover:text-ivory/80">
                                {c.tagline}
                            </span>
                            <span className="font-sans text-sm font-light tracking-wide text-gold opacity-0 transition-all duration-500 group-hover:opacity-100">
                                enter
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}
