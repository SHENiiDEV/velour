import { Link } from '@inertiajs/react';
import LegalPage from '@/components/velour/LegalPage';

const COOKIES = [
    { name: 'velour_age', purpose: 'Remembers that you confirmed you are 18 or older.', lifetime: '1 year' },
    { name: 'velour_discreet', purpose: 'Remembers whether discreet mode is on.', lifetime: '1 year' },
    { name: 'velour_cart', purpose: 'Keeps the items in your bag.', lifetime: 'Up to 30 days' },
    { name: 'velour_session', purpose: 'Keeps you signed in and holds the checkout session.', lifetime: '2 hours' },
    { name: 'XSRF-TOKEN', purpose: 'Protects forms against cross-site request forgery.', lifetime: '2 hours' },
];

export default function Cookies() {
    return (
        <LegalPage
            title="Cookies"
            updated="25 October 2026"
            lede={<p>We use only the cookies the shop needs to work. No advertising, no analytics, no tracking across other sites.</p>}
            sections={[
                {
                    id: 'list',
                    title: 'Cookies we set',
                    body: (
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Purpose</th>
                                    <th>Kept for</th>
                                </tr>
                            </thead>
                            <tbody>
                                {COOKIES.map((c) => (
                                    <tr key={c.name}>
                                        <td>{c.name}</td>
                                        <td>{c.purpose}</td>
                                        <td>{c.lifetime}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ),
                },
                {
                    id: 'consent',
                    title: 'Why there is no cookie banner',
                    body: (
                        <p>
                            All of the cookies above are strictly necessary to provide the shop you asked for, so the law does not require
                            consent for them. Fonts and product images are served from our own domain, so opening the site does not send your IP
                            address to third parties. If we ever add anything optional, we will ask first.
                        </p>
                    ),
                },
                {
                    id: 'control',
                    title: 'Clearing cookies',
                    body: (
                        <p>
                            You can delete cookies at any time in your browser settings. A private window keeps nothing after you close it. More
                            about how we handle data is in the <Link href="/privacy">Privacy policy</Link>.
                        </p>
                    ),
                },
            ]}
        />
    );
}
