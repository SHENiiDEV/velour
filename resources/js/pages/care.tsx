import { Link } from '@inertiajs/react';
import VelourLayout from '@/layouts/velour-layout';

// Только материалы, которые реально встречаются в каталоге (аудит, В7).
const materials = [
    {
        name: 'Silicone',
        text: 'Non-porous and holds body heat. Wash with warm water and mild soap or a toy cleaner. Use water-based lubricant — silicone lube can soften a silicone surface.',
    },
    {
        name: 'ABS plastic',
        text: 'The hard shell around motors and handles. Wipe clean; keep charging ports dry. Works with any lubricant.',
    },
    {
        name: 'TPE / TPR',
        text: 'Very soft and stretchy — used in many sleeves. It is slightly porous: rinse with warm water after every use, let it dry completely, and store it on its own. Water-based lubricant only.',
    },
    {
        name: 'Electronics',
        text: 'Check the waterproof rating on each listing before rinsing under the tap. Charge with the supplied cable only, and never while the piece is wet.',
    },
    {
        name: 'Not sure?',
        text: 'Where the manufacturer states the material, we list it on the product page. If it is not there, write to us and we will find out before you buy.',
    },
];

const questions: Array<[string, string]> = [
    ['How do I choose a first one?', 'Softer and smaller than you think you need, with a few gentle settings. Everything else can come later.'],
    ['Do I need lubricant?', 'Almost always. Water-based works with everything; silicone-based lasts longer but must never meet silicone objects.'],
    ['How should I store things?', 'Dry, apart from each other, in a cloth pouch. Soft materials keep best away from light and from each other.'],
    ['What if it is not right?', 'Sealed items can be returned within 14 days, and every piece has a 2-year legal guarantee against defects. The full conditions are on the Returns page.'],
];

/** Забота: честно о материалах и уходе. Доступна без подтверждения возраста — это образование, а не витрина. */
export default function Care() {
    return (
        <VelourLayout title="Care" description="How to look after silicone, ABS and TPE pieces — cleaning, lubricants, storage and returns.">
            <section className="stagger px-[6vw] pb-16 pt-40">
                <p className="font-sans text-sm font-light text-gold/90" style={{ '--i': 0 } as React.CSSProperties}>
                    Materials, care, straight answers
                </p>
                <h1 className="text-cine-lg mt-4 font-display font-light text-ivory" style={{ '--i': 1 } as React.CSSProperties}>
                    Care
                </h1>
                <p className="mt-8 max-w-xl font-display text-2xl font-light leading-snug text-ivory/80" style={{ '--i': 2 } as React.CSSProperties}>
                    Your body is the one thing you are certain to have. Here is how to look after it, and after the things you share it with.
                </p>
            </section>

            <div className="hairline mx-[6vw]" />

            <section className="grid gap-x-16 gap-y-12 px-[6vw] py-20 md:grid-cols-2">
                {materials.map((m) => (
                    <article key={m.name}>
                        <h2 className="font-display text-3xl font-light text-ivory">{m.name}</h2>
                        <p className="mt-3 max-w-md font-sans text-base font-light leading-relaxed text-mute">{m.text}</p>
                    </article>
                ))}
            </section>

            <section className="px-[6vw] pb-24">
                <h2 className="font-display text-4xl font-light text-ivory">People ask</h2>
                <dl className="mt-10 max-w-2xl divide-y divide-ivory/10">
                    {questions.map(([q, a]) => (
                        <div key={q} className="py-6">
                            <dt className="font-display text-2xl text-ivory">{q}</dt>
                            <dd className="mt-2 font-sans text-base font-light leading-relaxed text-mute">{a}</dd>
                        </div>
                    ))}
                </dl>
                <div className="mt-14 flex flex-wrap items-center gap-6">
                    <Link href="/catalog" data-magnetic className="btn-gold inline-block px-10 py-4 font-sans text-sm">
                        To the collection
                    </Link>
                    <Link href="/returns" className="font-sans text-sm text-ivory/80 underline underline-offset-4 hover:text-ivory">
                        Returns &amp; guarantee
                    </Link>
                </div>
            </section>
        </VelourLayout>
    );
}
