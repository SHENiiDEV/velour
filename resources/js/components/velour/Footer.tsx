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

            {/* Payment & Security Compliance */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-ivory/10 pt-8">
                <div className="flex flex-wrap items-center gap-3">
                    <span className="font-sans text-[11px] font-light tracking-wider text-mute/80 uppercase mr-1">
                        Secure Payment:
                    </span>
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-7 items-center justify-center rounded bg-white/95 px-2.5 py-1 shadow-sm transition-opacity hover:opacity-100 opacity-90">
                            <img src="/images/payment/visa.png" alt="Visa" className="h-3.5 w-auto object-contain" />
                        </div>
                        <div className="flex h-7 items-center justify-center rounded bg-white/95 px-2.5 py-1 shadow-sm transition-opacity hover:opacity-100 opacity-90">
                            <img src="/images/payment/mastercard.png" alt="Mastercard" className="h-4 w-auto object-contain" />
                        </div>
                        <div className="flex h-7 items-center justify-center rounded bg-white/95 px-2.5 py-1 shadow-sm transition-opacity hover:opacity-100 opacity-90">
                            <img src="/images/payment/pci-dss.png" alt="PCI DSS Compliant" className="h-4.5 w-auto object-contain" />
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 font-sans text-[11px] text-mute/70">
                    <span>256-Bit SSL Encryption</span>
                    <span className="text-ivory/20">·</span>
                    <span>PCI DSS Certified</span>
                    <span className="text-ivory/20">·</span>
                    <span>Discreet Billing</span>
                </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between border-t border-ivory/5 pt-6 text-[11px] text-mute/60">
                <p>© {new Date().getFullYear()} VELOUR. All rights reserved.</p>
                <p className="mt-2 sm:mt-0">Atelier of Sensations · Anonymous Packaging</p>
            </div>
        </footer>
    );
}
