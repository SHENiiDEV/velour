import { usePage } from '@inertiajs/react';
import type { CompanyProps, SharedProps } from '@/types/velour';

/** Реквизиты продавца из shared props (источник — .env COMPANY_*). */
export function useCompany(): CompanyProps {
    return usePage<SharedProps>().props.company;
}
