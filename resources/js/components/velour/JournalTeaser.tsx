import { Link } from '@inertiajs/react';
import { useReveal } from '@/lib/reveal';

const notes = [
    { date: 'Edition 01', title: 'The Geometry of Goosebumps', subtitle: 'On the tension of the millimeter before touch' },
    { date: 'Edition 02', title: 'The Cold Weight of Borosilicate', subtitle: 'Thermal contrast as a sensory amplifier' },
    { date: 'Edition 03', title: 'Subharmonics in the Dark', subtitle: 'Why low resonance bypasses the mind entirely' },
    { date: 'Edition 04', title: 'The Melt at 38°C', subtitle: 'Botanical oils, surrender, and the erasure of boundaries' },
];

/** Журнал: три строки, чтобы стало понятно, что за магазином есть голос. */
export default function JournalTeaser() {
    const ref = useReveal<HTMLElement>();

    return (
        <section ref={ref} className="reveal px-[6vw] py-32" aria-labelledby="journal">
            <div className="flex items-end justify-between">
                <h2 id="journal" className="font-display text-5xl font-light text-ivory md:text-6xl">
                    Journal
                </h2>
                <Link href="/journal" className="thread font-sans text-sm font-light text-ivory/70 hover:text-ivory">
                    All notes
                </Link>
            </div>

            <ul className="mt-12 divide-y divide-ivory/10 border-t border-ivory/10">
                {notes.map((n) => (
                    <li key={n.title}>
                        <Link href="/journal" className="group flex items-baseline justify-between gap-6 py-7">
                            <span className="font-display text-2xl font-light text-ivory/80 transition-colors group-hover:text-ivory md:text-3xl">
                                {n.title}
                            </span>
                            <span className="shrink-0 font-sans text-xs font-light tracking-wide text-mute">{n.date}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}
