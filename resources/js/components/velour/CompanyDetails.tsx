import { useCompany } from '@/hooks/use-company';

/** Строка юридических реквизитов: «Name · Reg. No. … · Address». Пустые поля пропускаются. */
export default function CompanyDetails({ className = '' }: { className?: string }) {
    const company = useCompany();
    const parts = [
        company.name,
        company.reg_number && `Reg. No. ${company.reg_number}`,
        company.address,
    ].filter(Boolean);

    return <p className={className}>{parts.join(' · ')}</p>;
}
