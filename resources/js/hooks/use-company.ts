import { usePage } from '@inertiajs/react';
import type { CompanyProps, SharedProps } from '@/types/velour';

/** Реквизиты продавца из shared props (источник — .env COMPANY_*). */
const FALLBACK: CompanyProps = {
    name: 'VELOUR',
    trading_name: 'VELOUR',
    country: 'United Kingdom',
    address: '',
    reg_number: '',
    email: '',
    phone: '',
    vat_number: '',
    returns_address: '',
};

export function useCompany(): CompanyProps {
    // На страницах ошибок общих props может не быть — не роняем футер.
    return usePage<SharedProps>().props.company ?? FALLBACK;
}

/** «CALDORIS VENTURES LTD (trading as VELOUR)» — или просто имя, если они совпадают. */
export function merchantName(company: CompanyProps): string {
    const trading = company.trading_name?.trim();
    return trading && trading.toLowerCase() !== company.name.trim().toLowerCase() ? `${company.name} (trading as ${trading})` : company.name;
}
