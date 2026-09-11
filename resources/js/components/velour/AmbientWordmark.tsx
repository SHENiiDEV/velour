import { Link } from '@inertiajs/react';
import MaterialField from './MaterialField';
import { useReveal } from '@/lib/reveal';
import { usePrivacy } from '@/lib/velour';

/**
 * Финал: имя бренда вырезано в чёрной плашке, и сквозь буквы течёт материал.
 * Ни одной картинки — только маска поверх живого шейдера.
 */
export default function AmbientWordmark() {
    const ref = useReveal<HTMLElement>();
    const { discreet } = usePrivacy();

    return (
        <section ref={ref} className="reveal relative overflow-hidden" aria-label="VELOUR">
            <div className="absolute inset-0" aria-hidden>
                <MaterialField material="oil" discreet={discreet} />
            </div>

            <div className="relative flex min-h-[78svh] flex-col">
                {/* Верхняя половина — имя; нижняя закрыта фоном, чтобы текст читался */}
                <div className="relative min-h-[38svh] flex-1">
                {/* Плашка цвета фона с дырами-буквами: сквозь них видно шейдер */}
                <svg
                    className="pointer-events-none absolute inset-0 h-full w-full"
                    viewBox="0 0 1200 300"
                    preserveAspectRatio="xMidYMid meet"
                    aria-hidden
                >
                    <defs>
                        <mask id="velour-wordmark">
                            <rect x="-4000" y="-4000" width="12000" height="12000" fill="#fff" />
                            <text
                                x="600"
                                y="215"
                                textAnchor="middle"
                                fontFamily="'Cormorant Garamond', Georgia, serif"
                                fontSize="230"
                                fontWeight="300"
                                letterSpacing="18"
                                fill="#000"
                            >
                                VELOUR
                            </text>
                        </mask>
                    </defs>
                    <rect
                        x="-4000"
                        y="-4000"
                        width="12000"
                        height="12000"
                        fill="var(--color-void)"
                        mask="url(#velour-wordmark)"
                    />
                </svg>

                </div>

                <div className="relative flex flex-col items-center gap-8 bg-void px-[6vw] pb-8 pt-12 text-center">
                    <p className="max-w-md font-sans text-base font-light leading-relaxed text-mute">
                        Adults only. Unmarked packaging, a neutral line on your statement, and nothing else to explain.
                    </p>
                    <Link href="/catalog" data-magnetic className="btn-gold px-10 py-4 font-sans text-sm font-light">
                        Enter the collection
                    </Link>
                </div>
            </div>
        </section>
    );
}
