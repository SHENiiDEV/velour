import LegalPage from '@/components/velour/LegalPage';
import { useCompany } from '@/hooks/use-company';

export default function Returns() {
    const company = useCompany();
    const returnsTo = company.returns_address || company.address;

    const form = `To: ${company.name}${company.address ? `, ${company.address}` : ''}, ${company.email}

I hereby give notice that I withdraw from my contract for the sale of the following goods:
Order number:
Ordered on / received on:
Name:
Address:
Date:
Signature (only if this form is sent on paper)`;

    return (
        <LegalPage
            title="Returns & withdrawal"
            updated="25 October 2026"
            lede={<p>You can change your mind within 14 days. Every piece also carries a 2-year legal guarantee against defects.</p>}
            sections={[
                {
                    id: 'withdrawal',
                    title: '14-day right of withdrawal',
                    body: (
                        <>
                            <p>
                                You may withdraw from your purchase within <strong>14 days</strong> of the day you (or someone you name)
                                receive the goods, without giving a reason.
                            </p>
                            <p>
                                To do so, tell us clearly — an email to <a href={`mailto:${company.email}`}>{company.email}</a> is enough. You
                                may use the model form below, but you do not have to. Sending your notice before the 14 days end is what
                                counts.
                            </p>
                        </>
                    ),
                },
                {
                    id: 'exceptions',
                    title: 'What cannot be returned',
                    body: (
                        <p>
                            <strong>Sealed intimate products whose seal has been opened after delivery.</strong> For health protection and
                            hygiene reasons the right of withdrawal ends once the seal is broken. A fault is always covered by the legal
                            guarantee below, opened or not.
                        </p>
                    ),
                },
                {
                    id: 'how',
                    title: 'How to send it back',
                    body: (
                        <>
                            <p>
                                Send the goods back within 14 days of your withdrawal notice, unused and in their original sealed packaging.
                                {returnsTo ? (
                                    <>
                                        {' '}
                                        Return address: <strong>{returnsTo}</strong>.
                                    </>
                                ) : (
                                    ' We send you the return address in reply to your notice.'
                                )}
                            </p>
                            <p>You pay the direct cost of returning the goods.</p>
                        </>
                    ),
                },
                {
                    id: 'refund',
                    title: 'Your refund',
                    body: (
                        <p>
                            We refund everything you paid, including the standard delivery cost, within <strong>14 days</strong> of receiving
                            your notice — using the same payment method, at no charge to you. We may wait until the goods are back with us or
                            you have shown proof of sending them, whichever comes first.
                        </p>
                    ),
                },
                {
                    id: 'guarantee',
                    title: '2-year legal guarantee',
                    body: (
                        <>
                            <p>
                                If a piece is faulty or not as described, you are entitled to a free repair or replacement — or, if that is not
                                possible, a price reduction or refund — for <strong>2 years</strong> from delivery. This applies whether or not
                                the item has been opened or used.
                            </p>
                            <p>
                                Write to <a href={`mailto:${company.email}`}>{company.email}</a> with your order number and a short description
                                or photo of the problem. We cover the cost of returning faulty goods.
                            </p>
                        </>
                    ),
                },
                {
                    id: 'form',
                    title: 'Model withdrawal form',
                    body: (
                        <>
                            <p>Copy, fill in and email it to us — or simply write in your own words.</p>
                            <pre>{form}</pre>
                        </>
                    ),
                },
            ]}
        />
    );
}
