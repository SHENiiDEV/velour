import { Link } from '@inertiajs/react';
import LegalPage from '@/components/velour/LegalPage';
import { merchantName, useCompany } from '@/hooks/use-company';

export default function Terms({ governingLaw = 'England and Wales' }: { governingLaw?: string }) {
    const company = useCompany();
    const mail = <a href={`mailto:${company.email}`}>{company.email}</a>;

    return (
        <LegalPage
            title="Terms of sale"
            updated="29 October 2026"
            lede={<p>The rules for buying from us, in plain language. Your statutory consumer rights always apply in addition.</p>}
            sections={[
                {
                    id: 'seller',
                    title: 'Who you are buying from',
                    body: (
                        <p>
                            {merchantName(company)}
                            {company.reg_number ? `, company number ${company.reg_number}` : ''}
                            {company.address ? `, ${company.address}` : ''}
                            {company.country && !company.address.includes(company.country) ? `, ${company.country}` : ''}. Contact: {mail}. Full
                            details are on the <Link href="/legal-notice">Legal notice</Link> page.
                        </p>
                    ),
                },
                {
                    id: 'age',
                    title: 'Adults only',
                    body: <p>You must be 18 or older to use this shop and place an order. By ordering you confirm that you are.</p>,
                },
                {
                    id: 'contract',
                    title: 'How the contract is made',
                    body: (
                        <p>
                            Placing an order is an offer to buy. You receive an automatic email listing what you ordered; the contract is
                            concluded when we confirm acceptance or dispatch your order. If an item turns out to be unavailable, we tell you
                            straight away and refund anything you have paid.
                        </p>
                    ),
                },
                {
                    id: 'prices',
                    title: 'Prices and payment',
                    body: (
                        <p>
                            Prices are in euros and are final prices including VAT. Delivery costs are shown before you order — see{' '}
                            <Link href="/delivery">Delivery</Link>. Available payment methods are shown at checkout.
                        </p>
                    ),
                },
                {
                    id: 'products',
                    title: 'Product information',
                    body: (
                        <p>
                            We describe each product as accurately as we can, using the information provided by its manufacturer. Where a
                            material is not listed, ask us before you buy and we will find out. Colours on screen may differ slightly.
                        </p>
                    ),
                },
                {
                    id: 'delivery',
                    title: 'Delivery',
                    body: (
                        <p>
                            Destinations, costs and times are on the <Link href="/delivery">Delivery</Link> page. The risk of loss or damage
                            passes to you when the parcel is delivered to you.
                        </p>
                    ),
                },
                {
                    id: 'withdrawal',
                    title: 'Right of withdrawal',
                    body: (
                        <p>
                            You may withdraw within 14 days of receiving the goods, except for sealed intimate products opened after delivery.
                            How it works, refunds and the model form: <Link href="/returns">Returns &amp; withdrawal</Link>.
                        </p>
                    ),
                },
                {
                    id: 'guarantee',
                    title: 'Legal guarantee',
                    body: (
                        <p>
                            Goods must be as described and free of defects. If they are not, you have the statutory 2-year guarantee — see{' '}
                            <Link href="/returns#guarantee">Returns &amp; withdrawal</Link>.
                        </p>
                    ),
                },
                {
                    id: 'liability',
                    title: 'Liability',
                    body: (
                        <p>
                            Nothing in these terms limits our liability where the law does not allow it, including for death or personal
                            injury caused by negligence or for defective products. Please follow the use and care instructions that come with
                            each product.
                        </p>
                    ),
                },
                {
                    id: 'law',
                    title: 'Governing law and language',
                    body: (
                        <>
                            <p>
                                These terms and any contract made under them are governed by the laws of <strong>{governingLaw}</strong>.
                            </p>
                            <p>
                                If you are a consumer, this choice of law does not take away the protection you have under the mandatory
                                consumer laws of the country where you live, and you may bring a claim in the courts of that country or in the
                                courts of {governingLaw}.
                            </p>
                            <p>
                                The contract is concluded in English. Complaints: see <Link href="/legal-notice#complaints">Legal notice</Link>.
                            </p>
                        </>
                    ),
                },
            ]}
        />
    );
}
