import { useState, useRef, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import VelourLayout from '@/layouts/velour-layout';

interface Essay {
    id: string;
    category: 'Touch & Friction' | 'Temperature & Metal' | 'Darkness & Surrender' | 'Rhythm & Sound';
    date: string;
    readTime: string;
    title: string;
    subtitle: string;
    lead: string;
    quote: string;
    paragraphs: string[];
    sensoryKeys: string[];
    pairedProduct?: {
        name: string;
        tagline: string;
        slug: string;
        price: string;
    };
}

const ESSAYS: Essay[] = [
    {
        id: 'geometry-of-goosebumps',
        category: 'Touch & Friction',
        date: 'Edition 01',
        readTime: '4 min read',
        title: 'The Geometry of Goosebumps',
        subtitle: 'On the tension of the millimeter before touch',
        lead: 'The most intense electrical event in the human body does not happen at the point of contact. It happens four millimeters before skin meets skin — in the sudden collapse of distance.',
        quote: 'A whisper across bare skin carries a higher voltage than any sudden force. Speed is the enemy of arousal; gravity and hesitation are its true conductors.',
        paragraphs: [
            'Every square centimeter of human skin contains upwards of two hundred nerve endings designed specifically for the detection of subtle air displacement. When fingers hover without touching, the microscopic hairs on the nape of the neck and along the inner curve of the thigh stand upright. The brain registers not impact, but probability.',
            'In modern intimacy, haste is the most common mistake. We rush toward culmination as if desire were a destination rather than a state of heightened consciousness. When you slow a gesture down by three hundred percent, the nervous system is forced to amplify its receiver sensitivity.',
            'Run a feather-weight touch along the collarbone, pausing at the hollow of the throat. Notice how breath catches. That brief involuntary apnea is the body recalibrating its sensory threshold. True pleasure begins in the waiting.',
        ],
        sensoryKeys: ['Friction', 'Hesitation', 'Warmth', 'Anticipation'],
        pairedProduct: {
            name: 'ERICA PLUS',
            tagline: 'Wearable sculpted stimulation with whispering resonance',
            slug: 'wearable-clitoral-vibrator-erica-plus',
            price: '€87.95',
        },
    },
    {
        id: 'cold-weight-of-borosilicate',
        category: 'Temperature & Metal',
        date: 'Edition 02',
        readTime: '5 min read',
        title: 'The Cold Weight of Borosilicate',
        subtitle: 'Thermal contrast as a sensory amplifier',
        lead: 'Glass has no pulse of its own. It borrows everything from you, but only after it first demands your complete surrender to the cold.',
        quote: 'When something ice-cold touches a body already flushed with heat, the mind stops thinking. There is only the absolute present tense.',
        paragraphs: [
            'Borosilicate is cast from dense silica that holds temperature for extraordinary durations. Run under chilled water or rested in ice, its surface becomes mirror-smooth and glacial. Placed against the burning curve of the spine or inner wrist, it creates what neurologists call thermal shock.',
            'The nervous system cannot process cold and heat at identical speeds. The initial shock travels through fast-conducting myelinated fibers, immediately followed by the slow, blooming rush of arterial blood rushing to the surface to warm the tissue. The result is a flush of sensation that radiates inward.',
            'As the object rests in the palm, it slowly absorbs the warmth of your hands. The cold dissolves into velvety smoothness, transitioning from an intruder to an extension of your own skin. The transition is itself an erotic narrative.',
        ],
        sensoryKeys: ['Borosilicate Glass', 'Thermal Shock', 'Heavy Weight', 'Glacial Smoothness'],
        pairedProduct: {
            name: 'BRACELETA',
            tagline: 'Sculpted jewel aesthetics with dual temperature response',
            slug: 'necklace-vibrator-braceleta',
            price: '€60.95',
        },
    },
    {
        id: 'subharmonic-frequencies',
        category: 'Rhythm & Sound',
        date: 'Edition 03',
        readTime: '4 min read',
        title: 'Subharmonics in the Dark',
        subtitle: 'Why low resonance bypasses the mind entirely',
        lead: 'High-pitched buzzing irritates the skin; low, heavy sub-frequencies dissolve into the pelvis like the rumble of distant thunder.',
        quote: 'A motor should never sound like an appliance in a bedroom. It should feel like a deep resonant bass chord reverberating through water.',
        paragraphs: [
            'Human tissue is roughly seventy percent liquid. Sound waves travel four times faster through fluid than through air. When a vibrating device operates at high RPM with a thin motor, it creates a surface-level prickle that numbs nerve receptors within minutes.',
            'In contrast, low-frequency motors operating beneath 60Hz create deep penetrative waves that travel through fascia, muscle tissue, and pelvic bones. The sensation does not remain confined to the surface; it vibrates through the entire core of the body.',
            'Turn off the lights. In complete darkness, when the eyes are relieved of duty, the auditory and tactile faculties expand exponentially. Every change in frequency becomes a seismic shift in consciousness.',
        ],
        sensoryKeys: ['Sub-Bass Resonance', 'Liquid Waveform', 'Quiet Motors', 'Sensory Deprivation'],
        pairedProduct: {
            name: 'EMMA NEO 2',
            tagline: 'Deep rumbling interactive wand massager',
            slug: 'emma-neo-2-interactive-wand-vibrator-massager',
            price: '€119.00',
        },
    },
    {
        id: 'the-melt-at-38-degrees',
        category: 'Darkness & Surrender',
        date: 'Edition 04',
        readTime: '6 min read',
        title: 'The Melt at 38°C',
        subtitle: 'Botanical oils, surrender, and the erasure of boundaries',
        lead: 'Soy wax melts at precisely thirty-eight degrees Celsius — one degree above the core temperature of a living body. The moment it meets the skin, it is neither solid nor fluid: it is pure warmth.',
        quote: 'Oil removes resistance. Without resistance, there is no barrier where one person ends and another begins.',
        paragraphs: [
            'To pour warm oil onto a lover’s back is an act of deliberate vulnerability. It requires lighting a flame, waiting for the wax to liquefy into golden liquid, and watching the slow descent of the first heavy drop. The recipient must lie motionless, anticipating the heat.',
            'As the hands spread the warm jojoba and fig oil across the shoulders and lower back, the skin’s friction coefficient drops to near zero. Pressure can be firm without biting; touch glides seamlessly from shoulder blade to hip in unbroken continuity.',
            'In this space, time loses its rigidity. The scent of cedar and smoky vanilla lingers in the sheets. There is nothing to accomplish, no milestone to reach — only the continuous unfolding of sensory pleasure.',
        ],
        sensoryKeys: ['Soy & Jojoba', 'Body Heat', 'Frictionless', 'Complete Surrender'],
        pairedProduct: {
            name: 'THE CLEAN STUFF',
            tagline: 'Purifying botanical care and sensual maintenance',
            slug: 'toy-cleaner',
            price: '€19.95',
        },
    },
];

const CATEGORIES = ['All', 'Touch & Friction', 'Temperature & Metal', 'Darkness & Surrender', 'Rhythm & Sound'] as const;

export default function Journal() {
    const [activeCategory, setActiveCategory] = useState<(typeof CATEGORIES)[number]>('All');
    const [selectedEssay, setSelectedEssay] = useState<Essay | null>(null);
    const [audioActive, setAudioActive] = useState(false);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const oscGainRef = useRef<GainNode | null>(null);

    // Filtered essays
    const filteredEssays = activeCategory === 'All'
        ? ESSAYS
        : ESSAYS.filter((e) => e.category === activeCategory);

    // Synthesized sensual binaural ambient drone (432Hz warmth + soft sub-harmonics)
    const toggleAmbientSound = () => {
        if (!audioActive) {
            try {
                const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
                const ctx = new AudioCtx();
                audioCtxRef.current = ctx;

                const masterGain = ctx.createGain();
                masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
                masterGain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 3);
                masterGain.connect(ctx.destination);
                oscGainRef.current = masterGain;

                // Warm root oscillator (108Hz)
                const osc1 = ctx.createOscillator();
                osc1.type = 'sine';
                osc1.frequency.setValueAtTime(108, ctx.currentTime);

                // Gentle octave harmonic (216Hz)
                const osc2 = ctx.createOscillator();
                osc2.type = 'triangle';
                osc2.frequency.setValueAtTime(216.5, ctx.currentTime); // subtle binaural detune

                const filter = ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(320, ctx.currentTime);

                const oscGain1 = ctx.createGain();
                oscGain1.gain.value = 0.6;
                const oscGain2 = ctx.createGain();
                oscGain2.gain.value = 0.3;

                osc1.connect(oscGain1);
                osc2.connect(oscGain2);
                oscGain1.connect(filter);
                oscGain2.connect(filter);
                filter.connect(masterGain);

                osc1.start();
                osc2.start();

                setAudioActive(true);
            } catch {
                // Audio context not allowed or supported
            }
        } else {
            if (oscGainRef.current && audioCtxRef.current) {
                oscGainRef.current.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 1.5);
                setTimeout(() => {
                    audioCtxRef.current?.close();
                    audioCtxRef.current = null;
                    setAudioActive(false);
                }, 1600);
            } else {
                setAudioActive(false);
            }
        }
    };

    useEffect(() => {
        return () => {
            if (audioCtxRef.current) {
                audioCtxRef.current.close();
            }
        };
    }, []);

    return (
        <VelourLayout title="Journal — The Architecture of Sensation — VELOUR">
            {/* Ambient background glow */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-40">
                <div className="absolute -left-[20vw] top-[10vh] h-[70vw] w-[70vw] rounded-full bg-radial from-wine/30 via-wine/5 to-transparent blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute -right-[15vw] top-[45vh] h-[60vw] w-[60vw] rounded-full bg-radial from-gold/15 via-gold/5 to-transparent blur-3xl animate-pulse" style={{ animationDuration: '12s' }} />
            </div>

            {/* Act I: Hero Editorial Header */}
            <section className="relative z-10 px-[6vw] pb-16 pt-36 md:pt-44">
                <div className="flex flex-wrap items-center justify-between gap-6">
                    <p className="font-sans text-xs font-light uppercase tracking-[0.3em] text-gold/90">
                        VELOUR JOURNAL · ESSAYS & INTIMATE OBSERVATIONS
                    </p>

                    {/* Ambient Soundscape Toggle */}
                    <button
                        type="button"
                        onClick={toggleAmbientSound}
                        className={`group flex items-center gap-3 rounded-full border px-5 py-2 font-sans text-xs font-light tracking-wider transition-all duration-500 ${
                            audioActive
                                ? 'border-gold bg-gold/10 text-gold-2 shadow-[0_0_20px_rgba(198,161,91,0.25)]'
                                : 'border-ivory/20 text-ivory/70 hover:border-gold/60 hover:text-ivory'
                        }`}
                    >
                        <span className="relative flex h-2 w-2">
                            {audioActive && (
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
                            )}
                            <span className={`inline-flex h-2 w-2 rounded-full ${audioActive ? 'bg-gold' : 'bg-mute'}`} />
                        </span>
                        <span>{audioActive ? 'Atmosphere: Resonating' : 'Listen: Ambient Atmosphere'}</span>
                    </button>
                </div>

                <h1 className="mt-8 font-display text-6xl font-light leading-[0.92] text-ivory md:text-8xl lg:text-9xl">
                    The Architecture <br />
                    <span className="italic text-ivory/85">of Sensation</span>
                </h1>

                <p className="mt-8 max-w-2xl font-sans text-lg font-light leading-relaxed text-mute md:text-xl">
                    Notes on tactile friction, thermal contrast, the physics of subsonic resonance, and the slow, deliberate grammar of anticipation.
                </p>

                {/* Category filters */}
                <nav className="mt-14 flex flex-wrap gap-x-8 gap-y-4 border-b border-ivory/10 pb-6" aria-label="Journal Themes">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setActiveCategory(cat)}
                            className={`thread font-display text-xl transition-colors md:text-2xl ${
                                activeCategory === cat ? 'text-gold-2 font-normal' : 'text-ivory/60 hover:text-ivory'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </nav>
            </section>

            {/* Act II: Featured Editorial Essays */}
            <section className="relative z-10 px-[6vw] pb-32">
                <div className="grid gap-20 lg:grid-cols-2">
                    {filteredEssays.map((essay) => (
                        <article
                            key={essay.id}
                            className="group relative flex flex-col justify-between border-t border-ivory/10 pt-10 transition-colors duration-500 hover:border-gold/50"
                        >
                            <div>
                                <div className="flex items-center justify-between font-sans text-xs font-light tracking-widest text-mute">
                                    <span className="text-gold/90">{essay.category}</span>
                                    <span>{essay.readTime}</span>
                                </div>

                                <h2 className="mt-6 font-display text-4xl font-light leading-tight text-ivory transition-colors group-hover:text-gold-2 md:text-5xl">
                                    {essay.title}
                                </h2>

                                <p className="mt-3 font-display text-xl font-light italic text-ivory/70">
                                    {essay.subtitle}
                                </p>

                                <p className="mt-6 font-sans text-base font-light leading-relaxed text-mute">
                                    {essay.lead}
                                </p>

                                {/* Sensual pull quote */}
                                <blockquote className="my-8 border-l-2 border-gold/40 pl-6 font-display text-2xl font-light italic leading-snug text-ivory/90">
                                    "{essay.quote}"
                                </blockquote>

                                {/* Sensory tags */}
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {essay.sensoryKeys.map((k) => (
                                        <span
                                            key={k}
                                            className="rounded-sm border border-ivory/10 bg-graphite/40 px-3 py-1 font-sans text-[11px] font-light tracking-wide text-ivory/70"
                                        >
                                            {k}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Actions & Paired Object */}
                            <div className="mt-10 pt-6 border-t border-ivory/10 flex flex-wrap items-center justify-between gap-4">
                                <button
                                    type="button"
                                    onClick={() => setSelectedEssay(essay)}
                                    className="btn-gold px-8 py-3 font-sans text-xs tracking-wider uppercase"
                                >
                                    Read Full Essay
                                </button>

                                {essay.pairedProduct && (
                                    <Link
                                        href={`/p/${essay.pairedProduct.slug}`}
                                        className="thread flex items-center gap-2 font-sans text-xs font-light text-mute hover:text-ivory"
                                    >
                                        <span>Paired Object:</span>
                                        <span className="font-display text-base text-gold-2">{essay.pairedProduct.name}</span>
                                        <span className="text-ivory/40">({essay.pairedProduct.price})</span>
                                    </Link>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            {/* Act III: Sensory Quotation Wall */}
            <section className="relative z-10 border-y border-ivory/10 bg-surface/50 px-[6vw] py-24 backdrop-blur-md">
                <div className="mx-auto max-w-4xl text-center">
                    <p className="font-sans text-xs font-light tracking-[0.25em] text-gold">
                        ANATOMY OF DESIRE
                    </p>
                    <p className="mt-6 font-display text-3xl font-light leading-relaxed text-ivory md:text-5xl">
                        "The skin does not distinguish between touch and thought; <br className="hidden md:block" />
                        it reacts to the whisper before the hand has even moved."
                    </p>
                    <p className="mt-6 font-sans text-xs font-light tracking-widest text-mute uppercase">
                        — VELOUR OBSERVATIONS · VOL. IV
                    </p>
                </div>
            </section>

            {/* Act IV: Full Essay Reading Modal / Lightbox */}
            {selectedEssay && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-void/90 p-4 backdrop-blur-xl transition-all duration-500"
                    role="dialog"
                    aria-modal="true"
                    onClick={() => setSelectedEssay(null)}
                >
                    <div
                        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto border border-ivory/15 bg-graphite p-8 md:p-14 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            type="button"
                            onClick={() => setSelectedEssay(null)}
                            className="absolute right-6 top-6 text-2xl font-light text-ivory/60 transition-colors hover:text-ivory"
                            aria-label="Close essay"
                        >
                            ✕
                        </button>

                        <div className="font-sans text-xs font-light tracking-widest text-gold">
                            {selectedEssay.category} · {selectedEssay.readTime}
                        </div>

                        <h2 className="mt-4 font-display text-4xl font-light text-ivory md:text-6xl">
                            {selectedEssay.title}
                        </h2>

                        <p className="mt-2 font-display text-2xl font-light italic text-gold-2">
                            {selectedEssay.subtitle}
                        </p>

                        <div className="my-8 hairline" />

                        <blockquote className="my-8 border-l-2 border-gold pl-6 font-display text-2xl font-light italic leading-relaxed text-ivory">
                            "{selectedEssay.quote}"
                        </blockquote>

                        <div className="space-y-6 font-sans text-base font-light leading-relaxed text-ivory/85 md:text-lg">
                            {selectedEssay.paragraphs.map((para, i) => (
                                <p key={i} className={i === 0 ? 'first-letter:font-display first-letter:text-5xl first-letter:float-left first-letter:mr-3 first-letter:text-gold' : ''}>
                                    {para}
                                </p>
                            ))}
                        </div>

                        {selectedEssay.pairedProduct && (
                            <div className="mt-12 rounded-sm border border-ivory/10 bg-surface p-6">
                                <p className="font-sans text-xs font-light tracking-widest text-mute uppercase">
                                    Curated Physical Pair
                                </p>
                                <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <h3 className="font-display text-2xl font-light text-ivory">{selectedEssay.pairedProduct.name}</h3>
                                        <p className="font-sans text-xs font-light text-mute">{selectedEssay.pairedProduct.tagline}</p>
                                    </div>
                                    <Link
                                        href={`/p/${selectedEssay.pairedProduct.slug}`}
                                        className="btn-gold px-6 py-3 font-sans text-xs font-normal uppercase"
                                    >
                                        Explore Object ({selectedEssay.pairedProduct.price})
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </VelourLayout>
    );
}
