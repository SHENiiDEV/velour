import { router } from '@inertiajs/react';
import type { FilterDefinition } from '@/types/catalog';

type ActiveMap = Record<string, string | string[] | undefined>;

interface FiltersProps {
    filters: FilterDefinition[];
    active: ActiveMap;
    baseUrl: string;
    onApply?: () => void;
}

function toArray(v: string | string[] | undefined): string[] {
    if (v === undefined) return [];
    return Array.isArray(v) ? v : [v];
}

/**
 * Фильтры по ощущениям и материалам.
 * Удобные touch-таргеты, мгновенное или пакетное применение.
 */
export default function Filters({ filters, active, baseUrl, onApply }: FiltersProps) {
    const apply = (next: ActiveMap) => {
        const clean: Record<string, string | string[]> = {};
        for (const [k, v] of Object.entries(next)) {
            const arr = toArray(v);
            if (arr.length) clean[k] = arr.length === 1 && !Array.isArray(v) ? arr[0] : arr;
        }
        router.get(baseUrl, clean, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['products', 'active'],
            onSuccess: () => onApply?.(),
        });
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
                    <div key={f.key} className="border-b border-ivory/5 pb-6 last:border-0 last:pb-0">
                        <p className="font-sans text-xs font-medium tracking-wider text-mute uppercase">
                            {f.label}
                        </p>

                        {/* Шкала (firmness, noise, weight) */}
                        {f.type === 'scale' && f.scale && (
                            <div className="mt-3 flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2">
                                    {Array.from({ length: f.scale.max - f.scale.min + 1 }, (_, i) => {
                                        const v = String(i + f.scale!.min);
                                        const isOn = selected.includes(v);
                                        return (
                                            <button
                                                key={v}
                                                type="button"
                                                className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all ${
                                                    isOn
                                                        ? 'border-gold bg-gold text-void font-medium scale-105'
                                                        : 'border-ivory/20 bg-surface/30 text-ivory/70 hover:border-gold/50'
                                                }`}
                                                onClick={() => toggleValue(f.key, v)}
                                                aria-pressed={isOn}
                                                aria-label={`${f.label}: ${f.scale!.labels[v] ?? v}`}
                                                title={f.scale!.labels[v] ?? v}
                                            >
                                                <span className="font-display text-sm">{v}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                                <span className="font-sans text-xs font-light text-ivory/70">
                                    {selected.length
                                        ? selected.map((v) => f.scale!.labels[v] ?? v).join(', ')
                                        : `${f.scale.labels[String(f.scale.min)] ?? ''} — ${f.scale.labels[String(f.scale.max)] ?? ''}`}
                                </span>
                            </div>
                        )}

                        {/* Enum options (materials, textures, etc.) */}
                        {f.type === 'enum' && f.options && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {f.options.map((o) => {
                                    const isSelected = selected.includes(o.value);
                                    return (
                                        <button
                                            key={o.value}
                                            type="button"
                                            onClick={() => toggleValue(f.key, o.value)}
                                            aria-pressed={isSelected}
                                            className={`rounded-full border px-3.5 py-1.5 font-sans text-xs transition-all ${
                                                isSelected
                                                    ? 'border-gold bg-gold/15 text-gold-2 font-medium'
                                                    : 'border-ivory/15 bg-surface/30 text-mute hover:border-ivory/40 hover:text-ivory'
                                            }`}
                                        >
                                            {o.label}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Boolean toggles */}
                        {f.type === 'bool' && (
                            <button
                                type="button"
                                onClick={() => apply({ ...active, [f.key]: selected.includes('1') ? [] : ['1'] })}
                                aria-pressed={selected.includes('1')}
                                className={`mt-3 rounded-full border px-4 py-1.5 font-sans text-xs transition-all ${
                                    selected.includes('1')
                                        ? 'border-gold bg-gold/15 text-gold-2 font-medium'
                                        : 'border-ivory/15 bg-surface/30 text-mute hover:border-ivory/40 hover:text-ivory'
                                }`}
                            >
                                {selected.includes('1') ? '✓ Active only' : 'Show all'}
                            </button>
                        )}
                    </div>
                );
            })}

            {hasAny && (
                <div className="pt-2">
                    <button
                        type="button"
                        onClick={() => apply({ q: active.q, sort: active.sort })}
                        className="font-sans text-xs font-medium text-rose underline-offset-4 hover:underline"
                    >
                        ✕ Clear all filters
                    </button>
                </div>
            )}
        </aside>
    );
}
