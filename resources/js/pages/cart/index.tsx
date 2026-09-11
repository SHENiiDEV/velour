import { Link, router } from '@inertiajs/react';
import QtyStepper from '@/components/velour/QtyStepper';
import Veil from '@/components/velour/Veil';
import VelourLayout from '@/layouts/velour-layout';
import CartSummary from '@/components/velour/CartSummary';
import { money } from '@/lib/money';
import type { CartProps } from '@/types/catalog';

interface CartIndexProps {
    cart: CartProps | null;
}

export default function CartIndex({ cart }: CartIndexProps) {
    const empty = !cart || cart.items.length === 0;

    const setQty = (id: number, qty: number) => router.patch(`/cart/${id}`, { qty }, { preserveScroll: true });
    const remove = (id: number) => router.delete(`/cart/${id}`, { preserveScroll: true });

    return (
        <VelourLayout title="Your Selection — VELOUR">
            <section className="relative min-h-[75vh] px-[6vw] pb-32 pt-36 md:pt-44">
                {/* Ambient background glows */}
                <div className="pointer-events-none absolute left-1/4 top-20 h-96 w-96 rounded-full bg-wine/15 blur-[120px]" />
                <div className="pointer-events-none absolute right-1/4 top-40 h-80 w-80 rounded-full bg-gold/5 blur-[100px]" />

                <div className="relative mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="flex flex-col gap-4 border-b border-ivory/10 pb-8 md:flex-row md:items-end md:justify-between">
                        <div>
                            <span className="font-sans text-xs font-light tracking-[0.25em] text-gold-2 uppercase">
                                Private Archive
                            </span>
                            <h1 className="mt-2 font-display text-5xl font-light text-ivory md:text-6xl">
                                Your Selection
                            </h1>
                        </div>
                        {!empty && (
                            <p className="font-sans text-sm font-light text-mute">
                                {cart.items.reduce((acc, it) => acc + it.qty, 0)} {cart.items.reduce((acc, it) => acc + it.qty, 0) === 1 ? 'creation' : 'creations'} reserved in your session
                            </p>
                        )}
                    </div>

                    {empty ? (
                        <div className="mt-20 max-w-xl py-12">
                            <div className="inline-block rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 font-sans text-xs font-light text-gold-2">
                                Clean Slate
                            </div>
                            <p className="mt-6 font-display text-4xl font-light leading-snug text-ivory/90 md:text-5xl">
                                Your casket is currently silent.
                            </p>
                            <p className="mt-4 font-sans text-base font-light leading-relaxed text-mute">
                                No choices have been committed yet. Explore our curated library of tactile forms, intimacy objects, and botanical elixirs.
                            </p>
                            <div className="mt-10">
                                <Link
                                    href="/catalog"
                                    data-magnetic
                                    className="btn-gold inline-flex items-center gap-3 px-10 py-4 font-sans text-sm tracking-wider"
                                >
                                    <span>Explore Collection</span>
                                    <span aria-hidden>→</span>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_400px] xl:gap-16">
                            {/* Items List */}
                            <div className="space-y-6">
                                <ul className="stagger space-y-4">
                                    {cart.items.map((item, i) => (
                                        <li
                                            key={item.id}
                                            className="group relative flex flex-col gap-6 rounded-sm border border-ivory/10 bg-surface/30 p-6 backdrop-blur-sm transition-all duration-300 hover:border-gold/25 hover:bg-surface/50 sm:flex-row sm:items-center sm:gap-8"
                                            style={{ '--i': i } as React.CSSProperties}
                                        >
                                            {/* Product Image */}
                                            <Link
                                                href={`/p/${item.product.slug}`}
                                                className="sheen relative h-32 w-24 shrink-0 overflow-hidden rounded-[2px] border border-ivory/10 bg-void/50 sm:h-36 sm:w-28"
                                            >
                                                <Veil media={item.product.cover} ratio="4 / 5" sizes="120px" />
                                            </Link>

                                            {/* Info & Details */}
                                            <div className="flex flex-1 flex-col justify-between self-stretch">
                                                <div>
                                                    <div className="flex items-start justify-between gap-4">
                                                        <Link
                                                            href={`/p/${item.product.slug}`}
                                                            className="font-display text-2xl font-light text-ivory transition-colors group-hover:text-gold-2 md:text-3xl"
                                                        >
                                                            {item.product.name}
                                                        </Link>
                                                        <p className="shrink-0 font-display text-2xl font-normal text-gold-2 sm:hidden">
                                                            {money(item.totalCents, cart.currency)}
                                                        </p>
                                                    </div>
                                                    <div className="mt-1.5 flex flex-wrap items-center gap-2 font-sans text-xs font-light text-mute">
                                                        <span className="rounded bg-ivory/5 px-2 py-0.5 text-ivory/80">
                                                            {item.variant.name}
                                                        </span>
                                                        <span>•</span>
                                                        <span>{money(item.unitPriceCents, cart.currency)} each</span>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="mt-6 flex items-center justify-between border-t border-ivory/5 pt-4 sm:mt-0 sm:border-0 sm:pt-0">
                                                    <div className="flex items-center gap-6">
                                                        <QtyStepper
                                                            value={item.qty}
                                                            max={Math.max(item.maxQty, item.qty)}
                                                            onChange={(q) => setQty(item.id, q)}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => remove(item.id)}
                                                            className="font-sans text-xs font-light text-mute/80 underline-offset-4 transition-colors hover:text-rose hover:underline"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>

                                                    <p className="hidden font-display text-2xl font-normal text-gold-2 sm:block">
                                                        {money(item.totalCents, cart.currency)}
                                                    </p>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                {/* Trust & Discreet Packaging Covenant */}
                                <div className="mt-10 rounded-sm border border-ivory/10 bg-void/40 p-6 md:p-8">
                                    <h4 className="font-display text-lg font-light text-ivory">
                                        The Velvet Covenant of Discretion
                                    </h4>
                                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                                        <div className="space-y-1">
                                            <p className="font-sans text-xs font-medium text-gold-2 uppercase tracking-wider">
                                                01. Unmarked Box
                                            </p>
                                            <p className="font-sans text-xs font-light leading-relaxed text-mute">
                                                No logos, no product names, no suggestive marks on the exterior box.
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-sans text-xs font-medium text-gold-2 uppercase tracking-wider">
                                                02. Neutral Billing
                                            </p>
                                            <p className="font-sans text-xs font-light leading-relaxed text-mute">
                                                Charges appear under a generic descriptor on bank and credit statements.
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-sans text-xs font-medium text-gold-2 uppercase tracking-wider">
                                                03. Pure Materials
                                            </p>
                                            <p className="font-sans text-xs font-light leading-relaxed text-mute">
                                                100% body-safe medical silicone, borosilicate glass, and non-porous alloys.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar / Checkout CTA */}
                            <aside className="lg:sticky lg:top-36 lg:self-start">
                                <CartSummary cart={cart} />

                                <div className="mt-6 space-y-4">
                                    <Link
                                        href="/checkout"
                                        data-magnetic
                                        className="btn-gold block w-full py-4 text-center font-sans text-sm font-medium tracking-wider"
                                    >
                                        Proceed to Checkout →
                                    </Link>

                                    <div className="rounded-sm border border-ivory/5 bg-void/20 p-4 text-center">
                                        <p className="font-sans text-xs font-light leading-relaxed text-mute">
                                            🔒 SSL 256-Bit Encrypted Checkout. No account creation required.
                                        </p>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    )}
                </div>
            </section>
        </VelourLayout>
    );
}
