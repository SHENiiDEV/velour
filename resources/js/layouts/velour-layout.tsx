import { Head } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import Cursor from '@/components/velour/Cursor';
import Footer from '@/components/velour/Footer';
import Header from '@/components/velour/Header';
import PageCurtain from '@/components/velour/PageCurtain';
import Toast from '@/components/velour/Toast';
import { usePrivacy } from '@/lib/velour';

interface VelourLayoutProps {
    title?: string;
}

/**
 * Базовый layout витрины. В скрытном режиме заголовок вкладки становится нейтральным.
 */
export default function VelourLayout({ title, children }: PropsWithChildren<VelourLayoutProps>) {
    const { discreet } = usePrivacy();

    return (
        <>
            <Head title={discreet ? 'V.' : title} />
            <div className={`min-h-svh bg-void text-ivory ${discreet ? 'discreet' : ''}`} data-discreet={discreet || undefined}>
                <Header />
                <main>{children}</main>
                <Footer />
                <Toast />
                <PageCurtain />
                <Cursor />
            </div>
        </>
    );
}
