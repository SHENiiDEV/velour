import { useState } from 'react';
import MaterialField, { type MaterialKey } from './MaterialField';
import { useReveal } from '@/lib/reveal';
import { usePrivacy } from '@/lib/velour';

const MATERIALS: Array<{ key: MaterialKey; name: string; line: string; note: string }> = [
    { key: 'latex', name: 'Latex', line: 'Airtight, wet to look at, warmer than it has any right to be.', note: '0.4 mm sheet, chlorinated finish' },
    { key: 'silicone', name: 'Silicone', line: 'Soft, matte, at your temperature within a minute.', note: 'Medical grade, platinum-cure' },
    { key: 'glass', name: 'Glass', line: 'Holds the cold longer than you expect it to.', note: 'Borosilicate, non-porous' },
    { key: 'steel', name: 'Steel', line: 'Weight you notice in the palm before anywhere else.', note: '316L, polished by hand' },
    { key: 'oil', name: 'Oil', line: 'Slow, warm, and gone by morning.', note: 'Soy wax and jojoba' },
];

/**
 * Сенсорная таксономия: пять материалов, одна поверхность.
 * Наведение перетекает материал под курсором — это и есть «suggestion over depiction».
 */
export default function SensoryTaxonomy() {
    const ref = useReveal<HTMLElement>();
    const { discreet } = usePrivacy();
    const [active, setActive] = useState<MaterialKey>('latex');
    const current = MATERIALS.find((m) => m.key === active)!;

    return (
        <section ref={ref} className="reveal relative overflow-hidden" aria-labelledby="materials">
            <div className="absolute inset-0" aria-hidden>
                <MaterialField material={active} discreet={discreet} />
            </div>
            <div className="film-grain" aria-hidden />

            <div className="relative grid min-h-[86svh] gap-12 px-[6vw] py-32 lg:grid-cols-[1fr_auto] lg:items-end">
                <div className="max-w-xl">
                    <p className="font-sans text-sm font-light text-gold/90">Five materials, one surface</p>
                    <h2 id="materials" className="mt-4 font-display text-6xl font-light leading-[0.95] text-ivory md:text-7xl">
                        Touch,
                        <br />
                        described.
                    </h2>
                    <p key={current.key} className="animate-rise mt-10 max-w-md font-display text-3xl font-light italic leading-snug text-ivory/85">
                        {current.line}
                    </p>
                    <p className="mt-4 font-sans text-sm font-light text-mute">{current.note}</p>
                </div>

                {/* Список-переключатель: наведение достаточно, клик — для тач-устройств */}
                <ul className="flex flex-wrap gap-x-8 gap-y-3 lg:flex-col lg:items-end lg:gap-y-4">
                    {MATERIALS.map((m) => (
                        <li key={m.key}>
                            <button
                                type="button"
                                onMouseEnter={() => setActive(m.key)}
                                onFocus={() => setActive(m.key)}
                                onClick={() => setActive(m.key)}
                                aria-pressed={active === m.key}
                                className={`thread font-display text-3xl font-light transition-colors duration-500 md:text-4xl ${
                                    active === m.key ? 'text-gold-2' : 'text-ivory/45 hover:text-ivory'
                                }`}
                            >
                                {m.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
