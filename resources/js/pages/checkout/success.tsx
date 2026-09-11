import { Link } from '@inertiajs/react';
import VelourLayout from '@/layouts/velour-layout';
import { money } from '@/lib/money';
import type { OrderSummary } from '@/types/catalog';

export default function CheckoutSuccess({ order }: { order: OrderSummary }) {
    return (
        <VelourLayout title="Passage Sealed — VELOUR">
            <section className="relative min-h-[85vh] overflow-hidden px-[6vw] pb-32 pt-36 md:pt-44">
                <div className="film-grain" aria-hidden />

                {/* Ambient glow backgrounds */}
                <div className="pointer-events-none absolute left-1/3 top-24 h-96 w-96 rounded-full bg-gold/5 blur-[120px]" />
                <div className="pointer-events-none absolute right-1/4 top-48 h-80 w-80 rounded-full bg-wine/15 blur-[100px]" />

                <div className="relative mx-auto max-w-3xl">
                    <div className="inline-block rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 font-sans text-xs font-light text-gold-2">
                        Passage Confirmed · Order #{order.number}
                    </div>

                    <h1 className="mt-6 font-display text-5xl font-light text-ivory md:text-6xl">
                        Quietly Received.
                    </h1>

                    <p className="mt-6 font-display text-2xl font-light leading-snug text-ivory/85 md:text-3xl">
                        From here on, only stillness: an email confirmation with an attached dark PDF invoice has been sent to <span className="text-ivory font-normal">{order.email}</span>, a sealed unbranded parcel is being prepared, and{' '}
                        <span className="text-gold-2 font-normal">{order.statementDescriptor}</span> will be on your financial ledger.
                    </p>

                    {/* Order Details Card */}
                    <div className="mt-12 rounded-sm border border-ivory/10 bg-surface/40 p-8 backdrop-blur-md">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-ivory/10 pb-4">
                            <h3 className="font-display text-xl font-light text-ivory">Passage Manifest</h3>
                            <a
                                href={`/order/${order.number}/invoice`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded border border-gold/40 bg-gold/10 px-3.5 py-1.5 font-sans text-xs font-medium text-gold-2 transition-colors hover:bg-gold hover:text-void"
                            >
                                <svg className="h-4 w-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>Download PDF Invoice</span>
                            </a>
                        </div>

                        <dl className="mt-6 divide-y divide-ivory/10 font-sans text-sm font-light">
                            {order.items.map((it, i) => (
                                <div key={i} className="flex items-center justify-between py-3.5 text-mute">
                                    <dt>
                                        <span className="text-ivory font-normal">{it.name}</span>
                                        {it.variant ? ` · ${it.variant}` : ''} <span className="text-gold-2">× {it.qty}</span>
                                    </dt>
                                    <dd className="font-display text-base text-ivory">{money(it.totalCents, order.currency)}</dd>
                                </div>
                            ))}

                            <div className="flex justify-between py-4 font-display text-2xl text-ivory">
                                <dt className="font-light">Total</dt>
                                <dd className="font-normal text-gold-2">{money(order.totalCents, order.currency)}</dd>
                            </div>

                            <div className="flex justify-between py-3 text-mute">
                                <dt>Fulfillment Status</dt>
                                <dd className="rounded bg-ivory/5 px-2 py-0.5 text-xs text-ivory uppercase tracking-wider">
                                    {order.statusLabel}
                                </dd>
                            </div>

                            <div className="flex justify-between py-3 text-mute">
                                <dt>Discretion Protocol</dt>
                                <dd className="text-gold-2">
                                    {order.isDiscreetPackaging ? 'Guaranteed Unmarked Box' : 'Standard Parcel'}
                                </dd>
                            </div>

                            <div className="flex justify-between py-3 text-mute">
                                <dt>Ledger Statement</dt>
                                <dd className="text-ivory">{order.statementDescriptor}</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Action */}
                    <div className="mt-12 flex flex-wrap items-center gap-6">
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
