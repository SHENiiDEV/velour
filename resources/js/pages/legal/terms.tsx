import VelourLayout from '@/layouts/velour-layout';

const TERMS = [
    {
        roman: '01',
        title: 'The Covenant of Adulthood',
        subtitle: '18+ Age Requirement',
        text: 'Access to this catalog and all purchases are strictly reserved for individuals of legal adult age (18 years or older). By confirming your age at our gate and placing an order, you take full sovereign responsibility for that affirmation.',
    },
    {
        roman: '02',
        title: 'Integrity of Formulation & Craft',
        subtitle: 'Material Transparency',
        text: 'We never conceal composition behind vague marketing terms. Every medical-grade silicone, hand-polished borosilicate glass, stainless alloy, and botanical extract is declared honestly. If you have specific sensitivities or questions regarding formulation, our concierge responds plainly before you buy.',
    },
    {
        roman: '03',
        title: 'Unmarked Transit & Passage',
        subtitle: 'Secure Fulfillment',
        text: 'All orders are dispatched within 1–2 business days in unbranded, discreet cartons. Shipping times and tracking codes are transmitted directly to your private email. Risk in transit is fully absorbed by us until the package is handed to you.',
    },
    {
        roman: '04',
        title: 'Sanctity of Hygiene & 14-Day Returns',
        subtitle: 'Unopened Seals & Flaw Guarantees',
        text: 'Unopened items with unbroken tamper-evident seals may be returned within 14 days of receipt for a full refund. Due to intimate health and sanitary standards, opened items cannot be returned unless an authentic craftsmanship or electronic defect is established, in which case an immediate replacement is provided.',
    },
    {
        roman: '05',
        title: 'Care & Sacred Longevity',
        subtitle: 'Intended Use',
        text: 'Our objects are designed for adult exploration and wellness. We encourage you to review the dedicated Care section for each piece — maintaining correct lubricant compatibility (water-based with silicone) ensures your objects endure beautifully for years.',
    },
];

export default function Terms() {
    return (
        <VelourLayout title="Terms & Standard of Care — VELOUR">
            {/* Ambient background glow */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-30">
                <div className="absolute -left-[10vw] top-[30vh] h-[55vw] w-[55vw] rounded-full bg-radial from-wine/25 via-transparent to-transparent blur-3xl" />
                <div className="absolute -right-[15vw] top-[10vh] h-[60vw] w-[60vw] rounded-full bg-radial from-gold/10 via-transparent to-transparent blur-3xl" />
            </div>

            <section className="relative z-10 px-[6vw] pb-24 pt-36 md:pt-44">
                <p className="font-sans text-xs font-light uppercase tracking-[0.3em] text-gold/90">
                    ETHICS & RECIPROCAL TRUST · STANDARD OF CARE
                </p>

                <h1 className="mt-8 font-display text-6xl font-light leading-[0.92] text-ivory md:text-8xl lg:text-9xl">
                    Terms of <br />
                    <span className="italic text-ivory/85">Engagement</span>
                </h1>

                <p className="mt-8 max-w-2xl font-sans text-lg font-light leading-relaxed text-mute md:text-xl">
                    Mutual respect, unapologetic transparency, and uncompromising standards of intimate craftsmanship.
                </p>

                <div className="hairline my-16 max-w-4xl" />

                <div className="grid max-w-4xl gap-12">
                    {TERMS.map((t) => (
                        <div key={t.roman} className="group grid gap-6 border-b border-ivory/10 pb-10 md:grid-cols-[80px_1fr]">
                            <span className="font-display text-3xl font-light text-gold/80">{t.roman}</span>
                            <div>
                                <h2 className="font-display text-3xl font-light text-ivory transition-colors group-hover:text-gold-2">
                                    {t.title}
                                </h2>
                                <p className="mt-1 font-sans text-xs font-light uppercase tracking-widest text-gold/70">
                                    {t.subtitle}
                                </p>
                                <p className="mt-4 font-sans text-base font-light leading-relaxed text-mute">
                                    {t.text}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-20 max-w-4xl rounded-sm border border-ivory/15 bg-surface/40 p-8 backdrop-blur-md">
                    <p className="font-sans text-xs font-light tracking-widest text-gold uppercase">
                        QUESTIONS & INTIMATE CARE
                    </p>
                    <p className="mt-3 font-display text-2xl font-light text-ivory">
                        Have questions about a specific piece?
                    </p>
                    <p className="mt-2 font-sans text-sm font-light leading-relaxed text-mute">
                        Our confidential concierge team is available at <span className="text-gold-2">care@velour-retail.com</span> to provide detailed guidance.
                    </p>
                </div>
            </section>
        </VelourLayout>
    );
}
