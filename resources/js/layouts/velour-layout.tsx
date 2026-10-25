import { Head } from '@inertiajs/react';
import { type PropsWithChildren, useEffect } from 'react';
import Cursor from '@/components/velour/Cursor';
import Footer from '@/components/velour/Footer';
import Header from '@/components/velour/Header';
import PageCurtain from '@/components/velour/PageCurtain';
import Toast from '@/components/velour/Toast';
import { DISCREET_TITLE, syncDiscreet, usePrivacy } from '@/lib/velour';

interface VelourLayoutProps {
    title?: string;
    /** meta description страницы (В16). */
    description?: string;
}

/**
 * Базовый layout витрины. В скрытном режиме заголовок вкладки становится нейтральным.
 */
export default function VelourLayout({ title, description, children }: PropsWithChildren<VelourLayoutProps>) {
    const { discreet } = usePrivacy();

    useEffect(() => syncDiscreet(discreet), [discreet]);

    return (
        <>
            <Head title={discreet ? DISCREET_TITLE : title}>
                {description && !discreet && <meta head-key="description" name="description" content={description} />}
            </Head>
            <a href="#main" className="skip-link">
                Skip to content
            </a>
            <div className={`min-h-svh bg-void text-ivory ${discreet ? 'discreet' : ''}`} data-discreet={discreet || undefined}>
                <Header />
                <main id="main" tabIndex={-1} className="outline-none">
                    {children}
                </main>
                <Footer />
                <Toast />
                <PageCurtain />
                <Cursor />
            </div>
        </>
    );
}
