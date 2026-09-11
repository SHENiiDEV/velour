import { Link, useForm } from '@inertiajs/react';
import Field from '@/components/velour/Field';
import Veil from '@/components/velour/Veil';
import VelourLayout from '@/layouts/velour-layout';
import CartSummary from '@/components/velour/CartSummary';
import { money } from '@/lib/money';
import type { CartProps } from '@/types/catalog';

interface CheckoutProps {
    cart: CartProps;
    privacy: { discreetPackagingDefault: boolean; statementDescriptor: string };
}

export default function CheckoutIndex({ cart, privacy }: CheckoutProps) {
    const form = useForm({
        email: '',
        phone: '',
        shipping_address: {
            name: '',
            line1: '',
            line2: '',
            city: '',
            postcode: '',
            country: 'LV',
        },
        notes: '',
        discreet_packaging: privacy.discreetPackagingDefault,
        age_confirmed: false,
        terms_accepted: false,
    });

    const err = (key: string) => (form.errors as Record<string, string | undefined>)[key];
    const addr = <K extends keyof typeof form.data.shipping_address>(k: K, v: string) =>
        form.setData('shipping_address', { ...form.data.shipping_address, [k]: v });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/checkout');
    };

    return (
        <VelourLayout title="Checkout & Safe Passage — VELOUR">
            <section className="relative min-h-screen px-[6vw] pb-32 pt-36 md:pt-44">
                {/* Ambient glow backgrounds */}
                <div className="pointer-events-none absolute left-10 top-24 h-96 w-96 rounded-full bg-wine/15 blur-[120px]" />
                <div className="pointer-events-none absolute right-10 top-60 h-80 w-80 rounded-full bg-gold/5 blur-[100px]" />

                <div className="relative mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="border-b border-ivory/10 pb-8">
                        <span className="font-sans text-xs font-light tracking-[0.25em] text-gold-2 uppercase">
                            Private Passage
                        </span>
                        <h1 className="mt-2 font-display text-5xl font-light text-ivory md:text-6xl">
                            Discreet Checkout
                        </h1>
                        <p className="mt-3 max-w-xl font-sans text-sm font-light leading-relaxed text-mute">
                            Every order is packaged without branding or descriptions, dispatched discreetly, and billed under an innocuous name.
                        </p>
                    </div>

                    <form onSubmit={submit} className="mt-12 grid gap-12 lg:grid-cols-[1fr_420px] xl:gap-16">
                        {/* Main Checkout Form */}
                        <div className="space-y-12">
                            {/* Step 1: Contact Information */}
                            <section className="rounded-sm border border-ivory/10 bg-surface/30 p-8 backdrop-blur-sm">
                                <div className="flex items-center gap-3">
                                    <span className="font-display text-2xl font-light text-gold-2">01</span>
                                    <h2 className="font-display text-3xl font-light text-ivory">Contact & Digital Receipt</h2>
                                </div>
                                <p className="mt-2 font-sans text-xs font-light text-mute">
                                    We only send your private order tracking number. No newsletters or marketing emails.
                                </p>

                                <div className="mt-8 grid gap-8 sm:grid-cols-2">
                                    <Field
                                        label="E-mail address (for order updates)"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="private@domain.com"
                                        value={form.data.email}
                                        onChange={(e) => form.setData('email', e.target.value)}
                                        error={err('email')}
                                        required
                                    />
                                    <Field
                                        label="Phone number (for courier delivery only)"
                                        name="phone"
                                        type="tel"
                                        autoComplete="tel"
                                        placeholder="+371 00 000 000"
                                        value={form.data.phone}
                                        onChange={(e) => form.setData('phone', e.target.value)}
                                        error={err('phone')}
                                    />
                                </div>
                            </section>

                            {/* Step 2: Destination Address */}
                            <section className="rounded-sm border border-ivory/10 bg-surface/30 p-8 backdrop-blur-sm">
                                <div className="flex items-center gap-3">
                                    <span className="font-display text-2xl font-light text-gold-2">02</span>
                                    <h2 className="font-display text-3xl font-light text-ivory">Destination & Delivery</h2>
                                </div>
                                <p className="mt-2 font-sans text-xs font-light text-mute">
                                    Shipped via trusted couriers in an unbranded, sealed parcel.
                                </p>

                                <div className="mt-8 grid gap-8 sm:grid-cols-2">
                                    <Field
                                        className="sm:col-span-2"
                                        label="Recipient Full Name"
                                        name="name"
                                        autoComplete="name"
                                        placeholder="Given Name & Surname"
                                        value={form.data.shipping_address.name}
                                        onChange={(e) => addr('name', e.target.value)}
                                        error={err('shipping_address.name')}
                                        required
                                    />
                                    <Field
                                        className="sm:col-span-2"
                                        label="Street & House / Apartment Number"
                                        name="line1"
                                        autoComplete="address-line1"
                                        placeholder="123 Velvet Boulevard, Apt 4"
                                        value={form.data.shipping_address.line1}
                                        onChange={(e) => addr('line1', e.target.value)}
                                        error={err('shipping_address.line1')}
                                        required
                                    />
                                    <Field
                                        className="sm:col-span-2"
                                        label="Flat, Entrance, Parcel Locker / Pickup Point (Optional)"
                                        name="line2"
                                        autoComplete="address-line2"
                                        placeholder="Entrance code, floor, or Omniva / DPD locker ID"
                                        value={form.data.shipping_address.line2}
                                        onChange={(e) => addr('line2', e.target.value)}
                                        error={err('shipping_address.line2')}
                                    />
                                    <Field
                                        label="City / Town"
                                        name="city"
                                        autoComplete="address-level2"
                                        placeholder="Riga"
                                        value={form.data.shipping_address.city}
                                        onChange={(e) => addr('city', e.target.value)}
                                        error={err('shipping_address.city')}
                                        required
                                    />
                                    <Field
                                        label="Postal Code"
                                        name="postcode"
                                        autoComplete="postal-code"
                                        placeholder="LV-1010"
                                        value={form.data.shipping_address.postcode}
                                        onChange={(e) => addr('postcode', e.target.value)}
                                        error={err('shipping_address.postcode')}
                                        required
                                    />
                                    <div className="sm:col-span-2">
                                        <label className="block">
                                            <span className="font-sans text-xs font-light tracking-wide text-mute">
                                                Country (ISO 2-letter code)
                                            </span>
                                            <div className="mt-2 flex items-center gap-3">
                                                <input
                                                    type="text"
                                                    maxLength={2}
                                                    autoComplete="country"
                                                    value={form.data.shipping_address.country}
                                                    onChange={(e) => addr('country', e.target.value.toUpperCase())}
                                                    className="w-24 border-0 border-b border-ivory/20 bg-transparent px-0 py-2 font-display text-xl uppercase text-ivory outline-none focus:border-gold"
                                                    required
                                                />
                                                <div className="flex flex-wrap gap-2 text-xs">
                                                    {['LV', 'LT', 'EE', 'DE', 'FR', 'GB', 'US'].map((code) => (
                                                        <button
                                                            key={code}
                                                            type="button"
                                                            onClick={() => addr('country', code)}
                                                            className={`rounded px-2 py-1 font-sans text-xs transition-colors ${
                                                                form.data.shipping_address.country === code
                                                                    ? 'bg-gold text-void font-medium'
                                                                    : 'bg-ivory/5 text-mute hover:text-ivory'
                                                            }`}
                                                        >
                                                            {code}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            {err('shipping_address.country') && (
                                                <span className="mt-1 block font-sans text-xs text-rose">
                                                    {err('shipping_address.country')}
                                                </span>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </section>

                            {/* Step 3: Discretion & Courier Instructions */}
                            <section className="rounded-sm border border-ivory/10 bg-surface/30 p-8 backdrop-blur-sm">
                                <div className="flex items-center gap-3">
                                    <span className="font-display text-2xl font-light text-gold-2">03</span>
                                    <h2 className="font-display text-3xl font-light text-ivory">Discretion & Courier Notes</h2>
                                </div>

                                <div className="mt-8 space-y-6">
                                    <LuxuryCheck
                                        checked={form.data.discreet_packaging}
                                        onChange={(v) => form.setData('discreet_packaging', v)}
                                        title="Guaranteed Unmarked Packaging"
                                        text="Plain heavy-gauge matte box with tamper-evident seal. Zero product hints, zero logos. Sent from a neutral logistics entity."
                                    />

                                    <div className="pt-2">
                                        <label className="block">
                                            <span className="font-sans text-xs font-light tracking-wide text-mute">
                                                Special Delivery Instructions for the Courier (Optional)
                                            </span>
                                            <textarea
                                                rows={2}
                                                placeholder="e.g. Leave behind planter, call upon arrival, do not ring doorbell..."
                                                value={form.data.notes}
                                                onChange={(e) => form.setData('notes', e.target.value)}
                                                className="mt-2 w-full resize-none border-0 border-b border-ivory/20 bg-transparent px-0 py-2 font-sans text-sm font-light text-ivory outline-none placeholder:text-mute/40 focus:border-gold"
                                            />
                                        </label>
                                    </div>
                                </div>
                            </section>

                            {/* Step 4: Verification & Covenant */}
                            <section className="rounded-sm border border-ivory/10 bg-surface/30 p-8 backdrop-blur-sm">
                                <div className="flex items-center gap-3">
                                    <span className="font-display text-2xl font-light text-gold-2">04</span>
                                    <h2 className="font-display text-3xl font-light text-ivory">Legal Covenant & Age</h2>
                                </div>

                                <div className="mt-8 space-y-6">
                                    <LuxuryCheck
                                        checked={form.data.age_confirmed}
                                        onChange={(v) => form.setData('age_confirmed', v)}
                                        title="I affirm that I am 18 years of age or older"
                                        text="All objects in this collection are strictly designated for consenting adults of legal age."
                                        error={err('age_confirmed')}
                                    />
                                    <LuxuryCheck
                                        checked={form.data.terms_accepted}
                                        onChange={(v) => form.setData('terms_accepted', v)}
                                        title="I accept the Terms of Engagement & Discretion Manifesto"
                                        text={
                                            <span>
                                                I have read and agree to the{' '}
                                                <Link href="/terms" target="_blank" className="text-gold-2 underline underline-offset-4 hover:text-ivory">
                                                    Terms of Engagement
                                                </Link>{' '}
                                                and the{' '}
                                                <Link href="/privacy" target="_blank" className="text-gold-2 underline underline-offset-4 hover:text-ivory">
                                                    Privacy & Discretion Manifesto
                                                </Link>
                                                .
                                            </span>
                                        }
                                        error={err('terms_accepted')}
                                    />
                                </div>
                            </section>

                            {err('cart') && (
                                <div className="rounded-sm border border-rose/30 bg-rose/10 p-4 text-center">
                                    <p className="font-sans text-sm font-light text-rose">{err('cart')}</p>
                                </div>
                            )}
                        </div>

                        {/* Right Sidebar: Order Summary & Discretion Visualizer */}
                        <aside className="lg:sticky lg:top-36 lg:self-start space-y-6">
                            {/* Bank Descriptor Simulator Card */}
                            <div
                                className="relative overflow-hidden rounded-sm border border-ivory/15 p-6 backdrop-blur-md"
                                style={{
                                    background:
                                        'linear-gradient(135deg, color-mix(in oklab, var(--color-graphite) 95%, transparent), color-mix(in oklab, var(--color-wine) 65%, var(--color-void)))',
                                }}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <span className="font-sans text-[10px] font-medium tracking-[0.2em] text-gold-2 uppercase">
                                            Bank Statement Preview
                                        </span>
                                        <p className="mt-1 font-display text-2xl text-ivory">
                                            {privacy.statementDescriptor}
                                        </p>
                                    </div>
                                    <div className="h-6 w-9 rounded-[3px] bg-gradient-to-tr from-gold to-gold-2 opacity-90 shadow-sm" />
                                </div>
                                <p className="mt-3 font-sans text-xs font-light leading-relaxed text-mute">
                                    This neutral description is exactly what appears on your credit card or bank ledger. Zero mention of products or adult categories.
                                </p>
                            </div>

                            {/* Order Items Preview */}
                            <div className="rounded-sm border border-ivory/10 bg-surface/40 p-6 backdrop-blur-sm">
                                <h3 className="font-display text-lg font-light text-ivory">Selected Items</h3>
                                <ul className="mt-4 divide-y divide-ivory/10">
                                    {cart.items.map((it) => (
                                        <li key={it.id} className="flex items-center gap-4 py-3">
                                            <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-[2px] border border-ivory/10 bg-void/50">
                                                <Veil media={it.product.cover} ratio="4 / 5" sizes="50px" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-display text-base font-light text-ivory">
                                                    {it.product.name}
                                                </p>
                                                <p className="font-sans text-xs font-light text-mute">
                                                    {it.variant.name} × {it.qty}
                                                </p>
                                            </div>
                                            <p className="font-display text-sm text-gold-2 font-normal">
                                                {money(it.totalCents, cart.currency)}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Cart Summary */}
                            <CartSummary cart={cart} showFreeShippingProgress={false} />

                            {/* Submit Button */}
                            <div className="space-y-3">
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    data-magnetic
                                    className="btn-gold block w-full py-4 text-center font-sans text-sm font-medium tracking-wider shadow-lg disabled:opacity-50"
                                >
                                    {form.processing ? 'Securing Passage…' : 'Proceed to Secure Payment →'}
                                </button>
                                <div className="flex items-center justify-center gap-2 text-center font-sans text-xs font-light text-mute">
                                    <span>🔒 256-Bit SSL Encrypted</span>
                                    <span>•</span>
                                    <span>Zero Data Logs</span>
                                </div>
                            </div>
                        </aside>
                    </form>
                </div>
            </section>
        </VelourLayout>
    );
}

function LuxuryCheck({
    checked,
    onChange,
    title,
    text,
    error,
}: {
    checked: boolean;
    onChange: (v: boolean) => void;
    title: string;
    text?: React.ReactNode;
    error?: string;
}) {
    return (
        <label className="group flex cursor-pointer items-start gap-4 select-none">
            <span
                className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-[2px] border transition-all duration-300 ${
                    checked
                        ? 'border-gold bg-gold text-void'
                        : error
                        ? 'border-rose bg-rose/10'
                        : 'border-ivory/30 group-hover:border-gold/60'
                }`}
                aria-hidden
            >
                {checked && (
                    <svg className="h-3.5 w-3.5 fill-current stroke-current" viewBox="0 0 24 24" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                )}
            </span>
            <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
            <span className="flex-1">
                <span className="block font-display text-xl font-light text-ivory transition-colors group-hover:text-gold-2">
                    {title}
                </span>
                {text && (
                    <span className="mt-1 block font-sans text-xs font-light leading-relaxed text-mute">
                        {text}
                    </span>
                )}
                {error && <span className="mt-1.5 block font-sans text-xs font-light text-rose">{error}</span>}
            </span>
        </label>
    );
}
