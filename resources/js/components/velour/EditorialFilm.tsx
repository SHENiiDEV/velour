import { useEffect, useRef } from 'react';
import VideoField from './VideoField';
import { useReveal } from '@/lib/reveal';
import { usePrivacy } from '@/lib/velour';

interface EditorialFilmProps {
    lines: string[];
    caption?: string;
}

/**
 * Редакционный кадр: единственное место на сайте, где есть человек.
 *
 * Съёмка приходит тёплой и светлой, поэтому она не показывается «как есть»:
 * сверху лежит дуотон в цветах бренда, кинополосы и зерно — кадр становится
 * частью VELOUR, а не вставкой из чужого мудборда.
 */
export default function EditorialFilm({ lines, caption }: EditorialFilmProps) {
    const ref = useReveal<HTMLElement>();
    const { discreet } = usePrivacy();
    const frameRef = useRef<HTMLDivElement>(null);

    // Лёгкий параллакс: кадр движется медленнее страницы, как в кино.
    useEffect(() => {
        const el = frameRef.current;
        if (!el) return;

        let raf = 0;
        const update = () => {
            raf = 0;
            const rect = el.getBoundingClientRect();
            const p = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
            el.style.setProperty('--shift', String(Math.max(-1, Math.min(1, p))));
        };
        const onScroll = () => {
            if (!raf) raf = requestAnimationFrame(update);
        };

        update();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('scroll', onScroll);
        };
    }, []);

    return (
        <section ref={ref} className="reveal relative overflow-hidden bg-void" aria-label="Editorial">
            <div ref={frameRef} className="relative h-[92svh] min-h-[560px] w-full overflow-hidden">
                {/* Кадр крупнее контейнера — иначе параллакс обнажит края */}
                <div
                    className="absolute inset-[-6%]"
                    style={{ transform: 'translateY(calc(var(--shift, 0) * 4%))' }}
                    aria-hidden
                >
                    <VideoField
                        webm="/media/editorial.webm"
                        mp4="/media/editorial.mp4"
                        poster="/media/editorial-poster.jpg"
                        discreet={discreet}
                        className="brightness-[0.88] contrast-[1.1] saturate-[0.34]"
                    />
                </div>

                {/*
                 * Дуотон в два слоя. mix-blend-color красит кадр целиком и уводит
                 * белое бельё в розовый; multiply по теням плюс soft-light по светам
                 * дают тёмный люкс: бордо в глубине, золото на бликах.
                 */}
                <div
                    className="pointer-events-none absolute inset-0 mix-blend-multiply"
                    style={{
                        background:
                            'linear-gradient(165deg, color-mix(in oklab, var(--color-wine) 58%, #8d7a70), color-mix(in oklab, var(--color-void) 52%, var(--color-wine)))',
                    }}
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute inset-0 mix-blend-soft-light"
                    style={{
                        background:
                            'radial-gradient(120% 90% at 62% 28%, color-mix(in oklab, var(--color-gold-2) 75%, transparent), transparent 62%)',
                    }}
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background:
                            'linear-gradient(to top, rgb(16 10 12 / 0.92) 0%, rgb(16 10 12 / 0.42) 26%, rgb(16 10 12 / 0.04) 58%, rgb(16 10 12 / 0.45) 100%)',
                    }}
                    aria-hidden
                />

                <div className="vignette" aria-hidden />
                <div className="film-grain" aria-hidden />

                {/* Кинополосы — тот же приём, что в герое: это один фильм */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[6vh] bg-black" aria-hidden />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[6vh] bg-black" aria-hidden />

                {/* Типографика поверх кадра */}
                <div className="absolute inset-0 flex flex-col justify-end px-[6vw] pb-[13vh]">
                    <h2 className="text-cine-lg max-w-4xl font-display font-light text-ivory">
                        {lines.map((line, i) => (
                            <span key={i} className="block overflow-hidden">
                                <span className="film-line block" style={{ '--i': i } as React.CSSProperties}>
                                    {line}
                                </span>
                            </span>
                        ))}
                    </h2>
                    {caption && (
                        <p
                            className="film-line mt-8 max-w-sm font-sans text-base font-light leading-relaxed text-ivory/75"
                            style={{ '--i': lines.length } as React.CSSProperties}
                        >
                            {caption}
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}
