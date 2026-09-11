import VelourLayout from '@/layouts/velour-layout';

const PILLARS = [
    {
        number: 'I',
        title: 'The Unmarked Box',
        subtitle: 'Physical Invisibility',
        text: 'Your order arrives in an unadorned, heavy-grade matte box. No logos, no brand markings, no hints of the intimacy within. The return address lists an inconspicuous logistics entity. Even the courier holding the parcel has no knowledge of what lies inside.',
    },
    {
        number: 'II',
        title: 'The Ghost in the Ledger',
        subtitle: 'Neutral Billing Descriptors',
        text: 'On your credit card or bank statement, the transaction appears under a quiet, completely neutral corporate descriptor (VLR RETAIL). No adult nomenclature, no category flags, no digital fingerprints.',
    },
    {
        number: 'III',
        title: 'Zero Advertising Pixels',
        subtitle: 'Absolute Digital Sanctuary',
        text: 'We deploy zero Meta pixels, zero TikTok trackers, and zero retargeting algorithms. We will never follow you across the internet with advertisements of products you viewed in private. What you explore here remains strictly between you and this screen.',
    },
    {
        number: 'IV',
        title: 'The Ephemeral Cart & Cookies',
        subtitle: 'Minimal Functional Memory',
        text: 'Our cookies serve only three functions: holding your private basket, remembering your age verification, and toggling the discreet blur veil. No third-party data broker is ever permitted into our system.',
    },
    {
        number: 'V',
        title: 'Right to Complete Erasure',
        subtitle: 'Total Forgetting upon Request',
        text: 'We retain shipping and tax records only for the minimum duration strictly mandated by fiscal law. At any moment, a simple one-line email to our support will purge every remnant of your identifiable data from our active database within 14 days.',
    },
];

export default function Privacy() {
    return (
        <VelourLayout title="Privacy & Discretion — VELOUR">
            {/* Ambient background glow */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-30">
                <div className="absolute -left-[10vw] top-[20vh] h-[60vw] w-[60vw] rounded-full bg-radial from-wine/30 via-transparent to-transparent blur-3xl" />
                <div className="absolute -right-[10vw] bottom-[10vh] h-[50vw] w-[50vw] rounded-full bg-radial from-gold/10 via-transparent to-transparent blur-3xl" />
            </div>

            <section className="relative z-10 px-[6vw] pb-24 pt-36 md:pt-44">
                <p className="font-sans text-xs font-light uppercase tracking-[0.3em] text-gold/90">
                    THE SANCTITY OF SECRECY · DISCRETION MANIFESTO
                </p>

                <h1 className="mt-8 font-display text-6xl font-light leading-[0.92] text-ivory md:text-8xl lg:text-9xl">
                    Absolute <br />
                    <span className="italic text-ivory/85">Discretion</span>
                </h1>

                <p className="mt-8 max-w-2xl font-sans text-lg font-light leading-relaxed text-mute md:text-xl">
                    What happens between you and your desires is sacred. We treat your privacy not as a sterile legal compliance checklist, but as the foundational aesthetic of everything we create.
                </p>

                {/* Highlight Quote */}
                <blockquote className="my-16 max-w-3xl border-l-2 border-gold/50 pl-8 font-display text-2xl font-light italic leading-relaxed text-ivory md:text-3xl">
                    "We collect only the barest minimum required to place a discreet box into your hands — and we tell no one."
                </blockquote>

                <div className="hairline my-16 max-w-4xl" />

                {/* Pillars Grid */}
                <div className="grid max-w-4xl gap-12">
                    {PILLARS.map((p) => (
                        <div key={p.number} className="group grid gap-6 border-b border-ivory/10 pb-10 md:grid-cols-[80px_1fr]">
                            <span className="font-display text-3xl font-light text-gold/80">{p.number}</span>
                            <div>
                                <h2 className="font-display text-3xl font-light text-ivory transition-colors group-hover:text-gold-2">
                                    {p.title}
                                </h2>
                                <p className="mt-1 font-sans text-xs font-light uppercase tracking-widest text-gold/70">
                                    {p.subtitle}
                                </p>
                                <p className="mt-4 font-sans text-base font-light leading-relaxed text-mute">
                                    {p.text}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Direct Contact for Deletion */}
                <div className="mt-20 max-w-4xl rounded-sm border border-ivory/15 bg-surface/40 p-8 backdrop-blur-md">
                    <p className="font-sans text-xs font-light tracking-widest text-gold uppercase">
                        DATA RIGHTS & ERASURE
                    </p>
                    <p className="mt-3 font-display text-2xl font-light text-ivory">
                        Want your record erased?
                    </p>
                    <p className="mt-2 font-sans text-sm font-light leading-relaxed text-mute">
                        Contact us at <span className="text-gold-2">concierge@velour-retail.com</span>. We will confirm deletion within 14 business days, no questions asked.
                    </p>
                </div>
            </section>
        </VelourLayout>
    );
}
