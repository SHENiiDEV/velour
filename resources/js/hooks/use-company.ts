import { usePage } from '@inertiajs/react';
import type { CompanyProps, SharedProps } from '@/types/velour';

/** Реквизиты продавца из shared props (источник — .env COMPANY_*). */
const FALLBACK: CompanyProps = { name: 'VELOUR', address: '', reg_number: '', email: '', phone: '', vat_number: '', returns_address: '' };

export function useCompany(): CompanyProps {
    // На страницах ошибок общих props может не быть — не роняем футер.
    return usePage<SharedProps>().props.company ?? FALLBACK;
}
