import { router } from '@inertiajs/react';
import type { FilterDefinition } from '@/types/catalog';

type ActiveMap = Record<string, string | string[] | undefined>;

interface FiltersProps {
    filters: FilterDefinition[];
    active: ActiveMap;
    baseUrl: string;
}

function toArray(v: string | string[] | undefined): string[] {
    if (v === undefined) return [];
    return Array.isArray(v) ? v : [v];
}

/**
 * Фильтры по ощущениям. Шкала — пять точек, которые можно «зажечь»;
 * enum — слова; bool — одно слово. Применяются сразу, без кнопки «Показать».
 */
export default function Filters({ filters, active, baseUrl }: FiltersProps) {
    const apply = (next: ActiveMap) => {
        const clean: Record<string, string | string[]> = {};
        for (const [k, v] of Object.entries(next)) {
            const arr = toArray(v);
            if (arr.length) clean[k] = arr.length === 1 && !Array.isArray(v) ? arr[0] : arr;
        }
        router.get(baseUrl, clean, { preserveState: true, preserveScroll: true, replace: true, only: ['products', 'active'] });
    };

    const toggleValue = (key: string, value: string) => {
        const current = toArray(active[key]);
        const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
        apply({ ...active, [key]: next });
    };

    const hasAny = filters.some((f) => toArray(active[f.key]).length > 0);

    return (
        <aside className="space-y-8">
            {filters.map((f) => {
                const selected = toArray(active[f.key]);

                return (
                    <div key={f.key}>
                        <p className="font-sans text-xs font-light tracking-wide text-mute">{f.label}</p>

                        {f.type === 'scale' && f.scale && (
                            <div className="mt-3 flex items-center gap-[10px]">
                                {Array.from({ length: f.scale.max - f.scale.min + 1 }, (_, i) => {
                                    const v = String(i + f.scale!.min);
                                    return (
                                        <button
                                            key={v}
                                            type="button"
                                            className="scale-dot"
                                            data-on={selected.includes(v)}
                                            onClick={() => toggleValue(f.key, v)}
                                            aria-pressed={selected.includes(v)}
                                            aria-label={`${f.label}: ${f.scale!.labels[v] ?? v}`}
                                            title={f.scale!.labels[v] ?? v}
                                        />
                                    );
                                })}
                                <span className="ml-2 font-display text-base text-ivory/80">
                                    {selected.length
                                        ? selected.map((v) => f.scale!.labels[v] ?? v).join(', ')
                                        : `${f.scale.labels[String(f.scale.min)] ?? ''} — ${f.scale.labels[String(f.scale.max)] ?? ''}`}
                                </span>
                            </div>
                        )}

                        {f.type === 'enum' && f.options && (
                            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                                {f.options.map((o) => (
                                    <button
                                        key={o.value}
                                        type="button"
                                        onClick={() => toggleValue(f.key, o.value)}
                                        aria-pressed={selected.includes(o.value)}
                                        className={`thread font-display text-lg transition-colors ${
                                            selected.includes(o.value) ? 'text-gold-2' : 'text-ivory/70 hover:text-ivory'
                                        }`}
                                    >
                                        {o.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {f.type === 'bool' && (
                            <button
                                type="button"
                                onClick={() => apply({ ...active, [f.key]: selected.includes('1') ? [] : ['1'] })}
                                aria-pressed={selected.includes('1')}
                                className={`thread mt-3 font-display text-lg transition-colors ${
                                    selected.includes('1') ? 'text-gold-2' : 'text-ivory/70 hover:text-ivory'
                                }`}
                            >
                                yes
                            </button>
                        )}
                    </div>
                );
            })}

            {hasAny && (
                <button
                    type="button"
                    onClick={() => apply({ q: active.q, sort: active.sort })}
                    className="font-sans text-xs font-light text-mute underline-offset-4 hover:text-ivory hover:underline"
                >
                    Reset
                </button>
            )}
        </aside>
    );
}
