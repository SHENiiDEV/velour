import { useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';
import VelourLayout from '@/layouts/velour-layout';

interface ErrorProps {
    status: number;
}

const QUOTES_404 = [
    '“Anticipation is the purest aphrodisiac; the object you cannot reach only heightens the pulse.”',
    '“Some desires were never meant to be owned — only pursued in the velvet shadows.”',
    '“A touch that misses the skin still lingers in the mind.”',
    '“In the absence of what was sought, every other sense awakens.”',
];

const QUOTES_503 = [
    '“The velvet curtain is temporarily drawn while we perfume the chambers.”',
    '“Pleasure cannot be rushed. Allow the tension to build before the doors unlock.”',
    '“A brief intermission in the sanctuary. Every masterpiece requires quiet devotion.”',
];

export default function ErrorPage({ status }: ErrorProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [whisperIndex, setWhisperIndex] = useState<number>(0);
    const [whisperRevealed, setWhisperRevealed] = useState<boolean>(false);
    const [isPulsing, setIsPulsing] = useState<boolean>(false);

    const is404 = status === 404;
    const is503 = status === 503;

    // Interactive Thermal Touch / Silk trail
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const handleResize = () => {
            if (!canvas) return;
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        interface Particle {
            x: number;
            y: number;
            radius: number;
            alpha: number;
            color: string;
            decay: number;
        }

        const particles: Particle[] = [];
        const colors = [
            'rgba(198, 161, 91, ',  // Gold
            'rgba(194, 77, 89, ',   // Rose Velvet
            'rgba(142, 28, 56, ',   // Deep Wine
        ];

        let mouseX = width / 2;
        let mouseY = height / 2;

        const addParticle = (x: number, y: number) => {
            const color = colors[Math.floor(Math.random() * colors.length)];
            particles.push({
                x,
                y,
                radius: Math.random() * 45 + 25,
                alpha: 0.35,
                color,
                decay: 0.006 + Math.random() * 0.005,
            });
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            addParticle(mouseX, mouseY);
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                mouseX = e.touches[0].clientX;
                mouseY = e.touches[0].clientY;
                addParticle(mouseX, mouseY);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove);

        let animationFrame: number;
        const render = () => {
            ctx.clearRect(0, 0, width, height);

            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.alpha -= p.decay;
                p.radius += 0.4;

                if (p.alpha <= 0) {
                    particles.splice(i, 1);
                    continue;
                }

                const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
                grad.addColorStop(0, `${p.color}${p.alpha})`);
                grad.addColorStop(0.5, `${p.color}${p.alpha * 0.4})`);
                grad.addColorStop(1, `${p.color}0)`);

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
            }

            animationFrame = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            cancelAnimationFrame(animationFrame);
        };
    }, []);

    // Web Audio API sensual haptic sound
    const playSensualPulse = () => {
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 1200);

        try {
            const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            // 108Hz (deep grounding resonant harmonic)
            osc.frequency.setValueAtTime(108, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(54, ctx.currentTime + 1.2);

            gain.gain.setValueAtTime(0.001, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.2);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 1.2);
        } catch {
            // Audio context not allowed without interaction
        }

        const quotes = is404 ? QUOTES_404 : QUOTES_503;
        setWhisperIndex((prev) => (prev + 1) % quotes.length);
        setWhisperRevealed(true);
    };

    const title = is404
        ? '404 · Unattainable Desire — VELOUR'
        : is503
        ? '503 · Sanctuary in Repose — VELOUR'
        : `${status} · Atelier Intermission — VELOUR`;

    return (
        <VelourLayout title={title}>
            {/* Interactive Thermal Touch Canvas (Silk warmth effect) */}
            <canvas
                ref={canvasRef}
                className="pointer-events-none fixed inset-0 z-0 opacity-80 mix-blend-screen"
                aria-hidden
            />

            <section className="relative z-10 flex min-h-[90vh] flex-col justify-center px-[6vw] pb-24 pt-36 md:pt-44">
                {/* Background Ambient Glows */}
                <div className="pointer-events-none absolute left-1/4 top-1/3 h-96 w-96 rounded-full bg-wine/25 blur-[140px]" />
                <div className="pointer-events-none absolute right-1/4 bottom-1/4 h-80 w-80 rounded-full bg-gold/10 blur-[120px]" />

                <div className="relative mx-auto max-w-4xl text-center">
                    {/* Status Pill */}
                    <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 font-sans text-xs font-light tracking-[0.2em] text-gold-2 uppercase">
                        <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
                        <span>
                            {is404 ? 'Code 404 · Slip of the Hand' : is503 ? 'Code 503 · Behind Drawn Velvet' : `Code ${status} · Anomaly`}
                        </span>
                    </div>

                    {/* Headline */}
                    <h1 className="mt-8 font-display text-6xl font-light tracking-tight text-ivory sm:text-7xl md:text-8xl lg:text-9xl">
                        {is404 ? 'Unfound.' : is503 ? 'Repose.' : 'Halt.'}
                    </h1>

                    <p className="mx-auto mt-6 max-w-xl font-display text-2xl font-light leading-relaxed text-ivory/85 md:text-3xl">
                        {is404
                            ? 'What you reached for exists only in the shadows of imagination.'
                            : is503
                            ? 'The sanctuary is closed for intimate tuning and botanical replenishment.'
                            : 'An unexpected tension has interrupted our private connection.'}
                    </p>

                    <p className="mx-auto mt-4 max-w-lg font-sans text-sm font-light leading-relaxed text-mute">
                        {is404
                            ? 'The page or object has dissolved or moved beyond this archive. Trace your cursor across the screen to warm the cold silk.'
                            : 'We are polishing the surfaces and will reopen our doors softly in a few moments.'}
                    </p>

                    {/* Interactive "Easter Egg" Whisper Box */}
                    <div className="mt-12">
                        <button
                            type="button"
                            onClick={playSensualPulse}
                            className={`group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-gold/40 bg-surface/50 px-7 py-3.5 backdrop-blur-md transition-all duration-500 hover:border-gold hover:bg-gold/10 hover:shadow-[0_0_30px_rgba(198,161,91,0.2)] ${
                                isPulsing ? 'scale-95 border-gold bg-gold/20' : ''
                            }`}
                        >
                            <span className="relative flex h-3 w-3 items-center justify-center">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-gold-2" />
                            </span>
                            <span className="font-sans text-xs font-light tracking-wider text-ivory group-hover:text-gold-2">
                                {whisperRevealed ? 'Whisper Another Revelation' : 'Touch to Awaken the Senses (108Hz)'}
                            </span>
                        </button>

                        {whisperRevealed && (
                            <div className="mx-auto mt-6 max-w-lg rounded-sm border border-gold/20 bg-void/60 p-6 backdrop-blur-lg animate-in fade-in zoom-in-95 duration-500">
                                <p className="font-display text-xl font-light italic leading-relaxed text-gold-2">
                                    {(is404 ? QUOTES_404 : QUOTES_503)[whisperIndex]}
                                </p>
                                <span className="mt-3 block font-sans text-[10px] tracking-[0.2em] text-mute uppercase">
                                    — Secret Archive Excerpt
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Action Navigation */}
                    <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
                        <Link
                            href="/catalog"
                            data-magnetic
                            className="btn-gold inline-flex items-center gap-3 px-8 py-4 font-sans text-sm tracking-wider"
                        >
                            <span>Return to Collection</span>
                            <span aria-hidden>→</span>
                        </Link>
                        <Link
                            href="/journal"
                            className="font-sans text-sm font-light text-mute transition-colors hover:text-ivory underline underline-offset-8"
                        >
                            Read the Journal of Sensations
                        </Link>
                    </div>
                </div>
            </section>
        </VelourLayout>
    );
}
