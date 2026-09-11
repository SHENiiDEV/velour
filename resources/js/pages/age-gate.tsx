import { Head, useForm } from '@inertiajs/react';
import { quickExit } from '@/lib/velour';

interface AgeGateProps {
    exitUrl: string;
}

/**
 * 18+. Страница без layout: до подтверждения — ничего от бренда,
 * кроме имени и тона. Никаких превью товаров.
 */
export default function AgeGate({ exitUrl }: AgeGateProps) {
    const form = useForm({ confirm: true });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/age');
    };

    return (
        <>
            <Head title="18+" />
            <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-void px-6">
                <div className="film-grain" aria-hidden />
                <div className="vignette" aria-hidden />

                <form onSubmit={submit} className="relative z-10 w-full max-w-lg text-center">
                    <p className="font-display text-3xl font-light tracking-[0.2em] text-ivory">VELOUR</p>
                    <div className="hairline mx-auto my-10 w-24" />

                    <h1 className="font-display text-5xl font-light leading-tight text-ivory md:text-6xl">
                        Are you 18 or older?
                    </h1>
                    <p className="mx-auto mt-6 max-w-sm font-sans text-base font-light leading-relaxed text-mute">
                        Behind this door is a shop for adults. We will not ask more than we need, and we will leave nothing in your parcel or on your statement.
                    </p>

                    <div className="mt-12 flex flex-col items-center gap-5">
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="btn-gold w-full max-w-xs px-8 py-4 font-sans text-sm font-normal"
                        >
                            Yes, I am 18
                        </button>
                        <button
                            type="button"
                            onClick={() => quickExit(exitUrl)}
                            className="font-sans text-sm font-light text-mute underline-offset-4 hover:text-ivory hover:underline"
                        >
                            No, take me away
                        </button>
                    </div>

                    <p className="mt-14 font-sans text-xs font-light text-mute/70">
                        By confirming you accept our{' '}
                        <a href="/terms" className="underline underline-offset-4 hover:text-ivory">terms</a> and{' '}
                        <a href="/privacy" className="underline underline-offset-4 hover:text-ivory">privacy policy</a>.
                    </p>
                </form>
            </main>
        </>
    );
}
