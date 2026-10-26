import { Link } from '@inertiajs/react';
import LegalPage from '@/components/velour/LegalPage';
import { useCompany } from '@/hooks/use-company';
import { money } from '@/lib/money';
import { useShop } from '@/lib/velour';
import type { ShippingRegion } from '@/types/velour';

export default function Delivery() {
    const shop = useShop();
    const company = useCompany();
    const regions = Object.entries(shop.regions);
    const countriesIn = (region: string) =>
        Object.values(shop.countries)
            .filter((c) => c.region === region)
            .map((c) => c.name);

    const fee = (r: ShippingRegion) =>
        r.fee === 'standard'
            ? `${money(shop.shippingFlatCents, shop.currency)} per order, free from ${money(shop.freeShippingFromCents, shop.currency)}.`
            : r.fee === 'checkout'
              ? 'Calculated at checkout based on the destination and order details.'
              : 'Calculated according to the product, access requirements and destination.';

    return (
        <LegalPage
            title="Delivery"
            updated="26 October 2026"
            lede={
                <p>
                    Every order leaves in a plain box with a neutral sender name. Delivery is free from{' '}
                    {money(shop.freeShippingFromCents, shop.currency)}; below that it costs {money(shop.shippingFlatCents, shop.currency)}.
                </p>
            }
            sections={[
                {
                    id: 'where',
                    title: 'Delivery times by region',
                    body: (
                        <>
                            {/* Таблица от sm; на телефоне — карточки, чтобы три колонки не сжимались в нечитаемое. */}
                            <table className="hidden sm:table">
                                <thead>
                                    <tr>
                                        <th className="w-[24%]">Delivery region</th>
                                        <th>Expected arrival*</th>
                                        <th className="w-[30%]">Shipping fee</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {regions.map(([key, r]) => (
                                        <tr key={key}>
                                            <td>{r.name}</td>
                                            <td>
                                                {r.window && <strong className="block">{r.window}</strong>}
                                                {r.details}
                                            </td>
                                            <td>{fee(r)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <dl className="space-y-6 sm:hidden">
                                {regions.map(([key, r]) => (
                                    <div key={key} className="border-b border-ivory/10 pb-5">
                                        <dt className="font-display text-2xl text-ivory">
                                            {r.name}
                                            {r.window && <span className="ml-2 font-sans text-base text-gold-2">{r.window}</span>}
                                        </dt>
                                        <dd className="mt-2">{r.details}</dd>
                                        <dd className="mt-2 text-mute">{fee(r)}</dd>
                                    </div>
                                ))}
                            </dl>

                            <p className="text-sm text-mute">
                                * Estimates counted from dispatch. We dispatch within {shop.dispatchDays} business days of your order.
                            </p>
                        </>
                    ),
                },
                {
                    id: 'countries',
                    title: 'Where we deliver',
                    body: (
                        <>
                            {regions
                                .filter(([key]) => key !== 'oversized')
                                .map(([key, r]) => {
                                    const list = countriesIn(key);
                                    return (
                                        <p key={key}>
                                            <strong>{r.name}:</strong>{' '}
                                            {list.length > 0 ? list.join(', ') + '.' : (
                                                <>
                                                    on request — write to <a href={`mailto:${company.email}`}>{company.email}</a> with your country.
                                                </>
                                            )}
                                        </p>
                                    );
                                })}
                        </>
                    ),
                },
                {
                    id: 'cost',
                    title: 'Cost',
                    body: (
                        <ul>
                            <li>
                                UK and EU: {money(shop.shippingFlatCents, shop.currency)} per order, free from{' '}
                                {money(shop.freeShippingFromCents, shop.currency)}.
                            </li>
                            <li>The delivery cost is always shown in your bag and at checkout before you place the order.</li>
                            <li>All product prices on the site are final prices{shop.vatNote ? ` (${shop.vatNote})` : ''}.</li>
                        </ul>
                    ),
                },
                {
                    id: 'dispatch',
                    title: 'Dispatch and tracking',
                    body: (
                        <p>
                            We dispatch within {shop.dispatchDays} business days of your order. As soon as the parcel leaves, you receive an
                            email with the tracking number.
                        </p>
                    ),
                },
                {
                    id: 'packaging',
                    title: 'Packaging',
                    body: (
                        <p>
                            A plain, unbranded box with no description of the contents. The sender name on the label is neutral. The invoice
                            is sent by email, not placed in the parcel.
                        </p>
                    ),
                },
                {
                    id: 'problems',
                    title: 'If something goes wrong',
                    body: (
                        <p>
                            Parcel late, damaged or missing? Write to{' '}
                            <a href={`mailto:${company.email}`}>{company.email}</a> with your order number and we will sort it out with the
                            courier. The risk of loss in transit stays with us until the parcel is in your hands. Returns are covered on the{' '}
                            <Link href="/returns">Returns &amp; withdrawal</Link> page.
                        </p>
                    ),
                },
            ]}
        />
    );
}
