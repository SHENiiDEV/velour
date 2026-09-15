import { Link } from '@inertiajs/react';
import DiscreetToggle from './DiscreetToggle';
import QuickExit from './QuickExit';

export default function Footer() {
    return (
        <footer className="px-[5vw] pb-safe pt-20 sm:px-[6vw] sm:pt-24 sm:pb-16 border-t border-ivory/10 bg-void/50">
            <div className="grid gap-10 font-sans text-xs sm:text-sm font-light text-mute md:grid-cols-4">
                {/* Brand Philosophy */}
                <div className="space-y-3 sm:col-span-1 md:col-span-2">
                    <p className="font-display text-2xl text-ivory tracking-widest uppercase">
                        VELOUR
                    </p>
                    <p className="max-w-md leading-relaxed text-mute">
                        Atelier of Sensations &amp; Quiet Luxury. Every piece is dispatched in an unmarked, tamper-evident container with zero advertising trackers and a neutral merchant descriptor on your financial ledger.
                    </p>
                    <div className="pt-2 flex items-center gap-6">
                        <DiscreetToggle />
                        <QuickExit />
                    </div>
                </div>

                {/* Directory */}
                <div className="space-y-3">
                    <p className="font-sans text-[11px] font-medium tracking-[0.2em] text-gold-2 uppercase">
                        Sanctuary
                    </p>
                    <ul className="space-y-2.5">
                        <li>
                            <Link href="/catalog" className="transition-colors hover:text-ivory">
                                All Collections
                            </Link>
                        </li>
                        <li>
                            <Link href="/journal" className="transition-colors hover:text-ivory">
                                Journal of Sensations
                            </Link>
                        </li>
                        <li>
                            <Link href="/care" className="transition-colors hover:text-ivory">
                                Materials &amp; Care
                            </Link>
                        </li>
                        <li>
                            <Link href="/cart" className="transition-colors hover:text-ivory">
                                Private Archive (Cart)
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Legal & Standards */}
                <div className="space-y-3">
                    <p className="font-sans text-[11px] font-medium tracking-[0.2em] text-gold-2 uppercase">
                        Covenant
                    </p>
                    <ul className="space-y-2.5">
                        <li>
                            <Link href="/privacy" className="transition-colors hover:text-ivory">
                                Discretion Manifesto (Privacy)
                            </Link>
                        </li>
                        <li>
                            <Link href="/terms" className="transition-colors hover:text-ivory">
                                Terms of Engagement
                            </Link>
                        </li>
                        <li className="text-gold-2/80">
                            Strictly Consenting Adults 18+
                        </li>
                    </ul>
                </div>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-between border-t border-ivory/5 pt-6 text-[11px] text-mute/70">
                <p>© {new Date().getFullYear()} VELOUR. All rights reserved.</p>
                <p className="mt-2 sm:mt-0">Encrypted 256-Bit SSL · Anonymous Packaging</p>
            </div>
        </footer>
    );
}
