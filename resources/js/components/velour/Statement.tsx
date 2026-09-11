import { useReveal } from '@/lib/reveal';

/** Манифест бренда. Одна мысль на весь экран — и ничего вокруг. */
export default function Statement() {
    const ref = useReveal<HTMLElement>();

    return (
        <section ref={ref} className="reveal px-[6vw] py-40" aria-labelledby="statement">
            <h2 id="statement" className="text-cine-lg max-w-5xl font-display font-light leading-[0.95] text-ivory">
                Desire <em className="text-gold-2">is</em> a material.
            </h2>
            <p className="mt-12 max-w-md font-sans text-base font-light leading-relaxed text-mute md:ml-auto md:text-right">
                It has weight, temperature and a surface. We work with those — and leave the rest to you.
            </p>
        </section>
    );
}
