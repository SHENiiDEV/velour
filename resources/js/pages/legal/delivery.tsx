import { Link } from '@inertiajs/react';
import LegalPage from '@/components/velour/LegalPage';
import { useCompany } from '@/hooks/use-company';
import { money } from '@/lib/money';
import { useShop } from '@/lib/velour';

export default function Delivery() {
    const shop = useShop();
    const company = useCompany();
    const countries = Object.entries(shop.countries);

    return (
        <LegalPage
            title="Delivery"
            updated="25 October 2026"
            lede={
                <p>
                    Every order leaves in a plain box with a neutral sender name. Delivery is free from{' '}
                    {money(shop.freeShippingFromCents, shop.currency)}; below that it costs {money(shop.shippingFlatCents, shop.currency)}.
                </p>
            }
            sections={[
                {
                    id: 'where',
                    title: 'Where we deliver',
                    body: (
                        <>
                            <p>We currently deliver to the countries below. Times are estimates after dispatch.</p>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Country</th>
                                        <th>Time in transit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {countries.map(([code, c]) => (
                                        <tr key={code}>
                                            <td>{c.name}</td>
                                            <td>{c.transit}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <p>If your country is not listed, write to us — we are adding destinations.</p>
                        </>
                    ),
                },
                {
                    id: 'cost',
                    title: 'Cost',
                    body: (
                        <ul>
                            <li>
                                {money(shop.shippingFlatCents, shop.currency)} per order, free from {money(shop.freeShippingFromCents, shop.currency)}.
                            </li>
                            <li>The delivery cost is shown in your bag and at checkout before you place the order.</li>
                            <li>All prices on the site are final prices{shop.vatNote ? ` (${shop.vatNote})` : ''}. There are no customs duties within the EU.</li>
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
