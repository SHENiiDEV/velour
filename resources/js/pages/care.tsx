import { Link } from '@inertiajs/react';
import VelourLayout from '@/layouts/velour-layout';

const materials = [
    {
        name: 'Medical-grade silicone',
        text: 'Non-porous, hypoallergenic, holds body heat. Wash with warm water and soap; boiling is fine. Water-based lubricant only — silicone lube softens the surface.',
    },
    {
        name: 'Borosilicate glass',
        text: 'The same glass used in laboratory ware: unbothered by temperature swings and compatible with any lubricant. Perfectly smooth, easy to clean, keeps cold and warmth alike.',
    },
    {
        name: 'Stainless steel 316L',
        text: 'Surgical alloy. Heavy, cool, permanent. Works with everything and can be boiled.',
    },
    {
        name: 'Latex',
        text: 'Natural rubber: airtight, stretchy, and unforgiving of oil — use only water-based lubricant on it. Rinse, dry flat, dust with cornstarch before storing. Not for anyone with a latex allergy, and we say so on every listing.',
    },
    {
        name: 'What we do not stock',
        text: 'PVC, “jelly”, TPE/TPR of unknown origin, phthalates, fragrance in lubricants, glycerine. If a material is not named outright, we do not sell it.',
    },
];

const questions: Array<[string, string]> = [
    ['How do I choose a first one?', 'Softer and smaller than you think you need. Firmness 2–3 on our scale, weight up to “noticeable”. Everything else can come later.'],
    ['Do I need lubricant?', 'Almost always. Water-based works with everything; silicone-based lasts longer but must never meet silicone objects.'],
    ['How should I store things?', 'Dry, apart from each other, in a cloth pouch. Silicone should never rest against other silicone, and latex keeps best away from light and metal.'],
    ['What if it is not right?', 'Unopened packaging, 14-day return, no questions. For hygiene reasons opened items cannot be returned, but write to us and we will help you find a replacement at a discount.'],
];

/** Забота: честно о материалах и уходе. Доступна без подтверждения возраста — это образование, а не витрина. */
export default function Care() {
    return (
        <VelourLayout title="Care — VELOUR">
            <section className="stagger px-[6vw] pb-16 pt-40">
                <p className="font-sans text-sm font-light text-gold/90" style={{ '--i': 0 } as React.CSSProperties}>
                    Materials, care, straight answers
                </p>
                <h1 className="text-cine-lg mt-4 font-display font-light text-ivory" style={{ '--i': 1 } as React.CSSProperties}>
                    Care
                </h1>
                <p className="mt-8 max-w-xl font-display text-2xl font-light leading-snug text-ivory/80" style={{ '--i': 2 } as React.CSSProperties}>
                    Your body is the one thing you are certain to have. We name our materials plainly and refuse to sell anything we would not trust ourselves.
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
                <Link href="/catalog" data-magnetic className="btn-gold mt-14 inline-block px-10 py-4 font-sans text-sm">
                    To the collection
                </Link>
            </section>
        </VelourLayout>
    );
}
