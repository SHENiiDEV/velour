import { money } from '@/lib/money';
import type { CartProps } from '@/types/catalog';

interface CartSummaryProps {
    cart: CartProps;
    className?: string;
    showFreeShippingProgress?: boolean;
}

/**
 * Итоги корзины: благородная типографика, золотая нить прогресса бесплатной доставки
 * и гарантия бесшумной конфиденциальности.
 */
export default function CartSummary({ cart, className = '', showFreeShippingProgress = true }: CartSummaryProps) {
    const left = Math.max(0, cart.freeShippingFromCents - cart.subtotalCents);
    const progress = Math.min(1, cart.subtotalCents / cart.freeShippingFromCents);
    const isFree = left === 0;

    return (
        <div className={`relative overflow-hidden rounded-sm border border-ivory/10 bg-surface/40 p-7 backdrop-blur-md ${className}`}>
            {/* Subtle ambient corner glow */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-gold/5 blur-2xl" />

            <h3 className="font-display text-xl font-light text-ivory">Summary</h3>

            <dl className="mt-6 space-y-3.5 font-sans text-sm font-light">
                <div className="flex justify-between text-mute">
                    <dt>Selection Subtotal</dt>
                    <dd className="text-ivory font-medium">{money(cart.subtotalCents, cart.currency)}</dd>
                </div>
                <div className="flex justify-between text-mute">
                    <dt className="flex items-center gap-2">
                        <span>Courier Dispatch</span>
                        {isFree && (
                            <span className="rounded bg-gold/15 px-1.5 py-0.5 text-[10px] font-medium tracking-wider text-gold-2 uppercase">
                                Unlocked
                            </span>
                        )}
                    </dt>
                    <dd className="text-ivory">
                        {isFree ? (
                            <span className="text-gold-2">Complimentary</span>
                        ) : (
                            money(cart.shippingCents, cart.currency)
                        )}
                    </dd>
                </div>
                <div className="flex justify-between text-mute">
                    <dt>Discreet Outer Packaging</dt>
                    <dd className="text-gold-2">Included</dd>
                </div>

                <div className="flex justify-between border-t border-ivory/10 pt-5 font-display text-2xl text-ivory">
                    <dt className="font-light">Total</dt>
                    <dd className="font-normal text-gold-2">{money(cart.totalCents, cart.currency)}</dd>
                </div>
            </dl>

            {/* Золотая нить прогресса бесплатной доставки */}
            {showFreeShippingProgress && (
                <div className="mt-6 border-t border-ivory/10 pt-5">
                    <div className="flex items-center justify-between font-sans text-xs font-light">
                        <span className="text-mute">
                            {isFree ? 'Complimentary delivery achieved' : 'Delivery threshold'}
                        </span>
                        <span className="font-display text-sm text-ivory">
                            {Math.round(progress * 100)}%
                        </span>
                    </div>

                    <div className="mt-2.5 h-[2px] w-full overflow-hidden rounded-full bg-ivory/10">
                        <div
                            className="h-full bg-gradient-to-r from-gold/70 via-gold-2 to-gold transition-all duration-700 ease-[var(--ease-cine)]"
                            style={{ width: `${progress * 100}%` }}
                        />
                    </div>

                    <p className="mt-2.5 font-sans text-xs font-light text-mute/90">
                        {isFree ? (
                            <span className="text-gold-2/90 font-normal">
                                ✓ Your order qualifies for complimentary private delivery.
                            </span>
                        ) : (
                            <>
                                Add <span className="text-ivory font-normal">{money(left, cart.currency)}</span> more for complimentary discreet delivery.
                            </>
                        )}
                    </p>
                </div>
            )}
        </div>
    );
}
