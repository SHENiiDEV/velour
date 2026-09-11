import { Link } from '@inertiajs/react';

export default function Footer() {
    return (
        <footer className="px-[6vw] pb-12 pt-24">
            <div className="hairline mb-12" />
            <div className="grid gap-10 font-sans text-sm font-light text-mute md:grid-cols-3">
                <div className="max-w-xs leading-relaxed">
                    Unmarked packaging. A neutral name on your statement. Nothing extra — not in the parcel, not in your history.
                </div>
                <div className="flex flex-col gap-3">
                    <Link href="/privacy" className="hover:text-ivory">Privacy</Link>
                    <Link href="/terms" className="hover:text-ivory">Terms</Link>
                    <Link href="/care" className="hover:text-ivory">Materials &amp; care</Link>
                </div>
                <div className="md:text-right">
                    <p className="font-display text-xl text-ivory">VELOUR</p>
                    <p className="mt-2">Adults only. 18+.</p>
                </div>
            </div>
        </footer>
    );
}
