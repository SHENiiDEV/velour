import { Link } from '@inertiajs/react';
import LegalPage from '@/components/velour/LegalPage';
import { useCompany } from '@/hooks/use-company';

export default function Privacy() {
    const company = useCompany();
    const mail = <a href={`mailto:${company.email}`}>{company.email}</a>;

    return (
        <LegalPage
            title="Privacy policy"
            updated="25 October 2026"
            lede={
                <p>
                    Discretion is the point of this shop. We collect only what we need to deliver your order, we never sell data, and there
                    are no advertising pixels on this site. Below is exactly what happens to your information.
                </p>
            }
            sections={[
                {
                    id: 'controller',
                    title: 'Who is responsible',
                    body: (
                        <p>
                            The data controller is {company.name}
                            {company.reg_number ? ` (company number ${company.reg_number})` : ''}
                            {company.address ? `, ${company.address}` : ''}. Contact for anything privacy-related: {mail}.
                        </p>
                    ),
                },
                {
                    id: 'data',
                    title: 'What we collect',
                    body: (
                        <ul>
                            <li>
                                <strong>When you order:</strong> name, email, delivery address, phone number (optional, for the courier),
                                delivery notes, what you ordered and the amounts.
                            </li>
                            <li>
                                <strong>If you create an account:</strong> name, email and a securely hashed password.
                            </li>
                            <li>
                                <strong>When you pay:</strong> payment is handled by the payment provider. We do not see or store your full
                                card number.
                            </li>
                            <li>
                                <strong>Technical data:</strong> your IP address and browser details in server logs, and the cookies listed on
                                the <Link href="/cookies">Cookies</Link> page.
                            </li>
                        </ul>
                    ),
                },
                {
                    id: 'purposes',
                    title: 'Why, and on what legal basis',
                    body: (
                        <table>
                            <thead>
                                <tr>
                                    <th>Purpose</th>
                                    <th>Legal basis (GDPR)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Taking, delivering and supporting your order; your account</td>
                                    <td>Performance of a contract — Art. 6(1)(b)</td>
                                </tr>
                                <tr>
                                    <td>Invoices and accounting records</td>
                                    <td>Legal obligation — Art. 6(1)(c)</td>
                                </tr>
                                <tr>
                                    <td>Security, fraud prevention, server logs</td>
                                    <td>Legitimate interest in a safe shop — Art. 6(1)(f)</td>
                                </tr>
                                <tr>
                                    <td>Age confirmation</td>
                                    <td>Legal obligation and legitimate interest — Art. 6(1)(c), (f)</td>
                                </tr>
                            </tbody>
                        </table>
                    ),
                },
                {
                    id: 'recipients',
                    title: 'Who receives it',
                    body: (
                        <>
                            <p>Only the services needed to run the shop, each bound by a data processing agreement:</p>
                            <ul>
                                <li>the courier — name, address, phone, parcel details (never the contents);</li>
                                <li>the payment provider — what is needed to process the payment;</li>
                                <li>our email provider — to send order confirmations and invoices;</li>
                                <li>our hosting provider — where the shop and its database run.</li>
                            </ul>
                            <p>We never sell or rent your data, and we do not share it for advertising.</p>
                        </>
                    ),
                },
                {
                    id: 'transfers',
                    title: 'Transfers outside the EU',
                    body: (
                        <p>
                            {company.name} is registered in the United Kingdom. The European Commission has recognised the UK as providing an
                            adequate level of data protection. Where any provider processes data in another country outside the EU/EEA, we rely
                            on the European Commission’s standard contractual clauses.
                        </p>
                    ),
                },
                {
                    id: 'retention',
                    title: 'How long we keep it',
                    body: (
                        <ul>
                            <li>Orders and invoices: as long as tax and accounting law requires (typically 6–10 years), then deleted.</li>
                            <li>Account data: until you delete your account or ask us to.</li>
                            <li>Server logs: a short period for security, then deleted.</li>
                            <li>Cookies: see the lifetimes on the <Link href="/cookies">Cookies</Link> page.</li>
                        </ul>
                    ),
                },
                {
                    id: 'rights',
                    title: 'Your rights',
                    body: (
                        <>
                            <p>
                                You can ask us at any time to show you the data we hold about you, correct it, delete it, restrict its use, send
                                it to you in a portable format, or stop using it on the basis of legitimate interest. Write to {mail}; we reply
                                within one month. Records we must keep by law (invoices) are kept until the legal period ends.
                            </p>
                            <p>
                                You also have the right to complain to a data protection authority — for example in the EU country where you
                                live, or the UK Information Commissioner’s Office.
                            </p>
                        </>
                    ),
                },
                {
                    id: 'no-tracking',
                    title: 'No tracking, no profiling',
                    body: (
                        <p>
                            There are no Meta, TikTok or Google advertising tags on this site, no analytics that follow you elsewhere, and no
                            automated decisions about you. Fonts and images are served from our own domain.
                        </p>
                    ),
                },
            ]}
        />
    );
}
