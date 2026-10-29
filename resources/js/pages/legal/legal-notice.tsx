import LegalPage from '@/components/velour/LegalPage';
import { useCompany } from '@/hooks/use-company';

export default function LegalNotice() {
    const company = useCompany();

    return (
        <LegalPage
            title="Legal notice & contact"
            updated="25 October 2026"
            sections={[
                {
                    id: 'seller',
                    title: 'Who we are',
                    body: (
                        <table>
                            <tbody>
                                <tr>
                                    <th>Seller</th>
                                    <td>{company.name}</td>
                                </tr>
                                {company.trading_name && company.trading_name !== company.name && (
                                    <tr>
                                        <th>Trading as</th>
                                        <td>{company.trading_name}</td>
                                    </tr>
                                )}
                                {company.country && (
                                    <tr>
                                        <th>Country</th>
                                        <td>{company.country}</td>
                                    </tr>
                                )}
                                {company.reg_number && (
                                    <tr>
                                        <th>Company number</th>
                                        <td>{company.reg_number}</td>
                                    </tr>
                                )}
                                {company.vat_number && (
                                    <tr>
                                        <th>VAT number</th>
                                        <td>{company.vat_number}</td>
                                    </tr>
                                )}
                                {company.address && (
                                    <tr>
                                        <th>Registered address</th>
                                        <td>{company.address}</td>
                                    </tr>
                                )}
                                <tr>
                                    <th>Email</th>
                                    <td>
                                        <a href={`mailto:${company.email}`}>{company.email}</a>
                                    </td>
                                </tr>
                                {company.phone && (
                                    <tr>
                                        <th>Phone</th>
                                        <td>
                                            <a href={`tel:${company.phone.replace(/\s+/g, '')}`}>{company.phone}</a>
                                        </td>
                                    </tr>
                                )}
                                {company.returns_address && (
                                    <tr>
                                        <th>Returns address</th>
                                        <td>{company.returns_address}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    ),
                },
                {
                    id: 'contact',
                    title: 'Contact',
                    body: (
                        <p>
                            The fastest way to reach us is email: <a href={`mailto:${company.email}`}>{company.email}</a>. We reply within two
                            business days, in English. Please include your order number if you have one.
                        </p>
                    ),
                },
                {
                    id: 'complaints',
                    title: 'Complaints',
                    body: (
                        <>
                            <p>
                                If something is not right, write to us first — most issues are solved in one reply. We confirm every complaint
                                and give a full answer within 14 days.
                            </p>
                            <p>
                                If we cannot agree, you can contact the consumer protection authority in your country, which can tell you about
                                out-of-court dispute resolution available to you.
                            </p>
                        </>
                    ),
                },
                {
                    id: 'age',
                    title: 'Adults only',
                    body: <p>This shop sells products for adults. You must be 18 or older to browse and buy.</p>,
                },
            ]}
        />
    );
}
