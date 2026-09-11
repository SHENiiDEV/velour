const formatters = new Map<string, Intl.NumberFormat>();

/** 8900 → «€89». Целые центы, без float. */
export function money(cents: number, currency = 'EUR', locale = 'en-GB'): string {
    const key = `${locale}:${currency}`;
    let fmt = formatters.get(key);

    if (!fmt) {
        fmt = new Intl.NumberFormat(locale, {
            style: 'currency',
            currency,
            minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
            maximumFractionDigits: 2,
        });
        formatters.set(key, fmt);
    }

    return fmt.format(cents / 100);
}
