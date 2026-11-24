import type { FilterDefinition } from '@/types/catalog';
import { router } from '@inertiajs/react';
import { Fragment } from 'react';

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
 * Фильтры по ощущениям и материалам.
 * Удобные touch-таргеты, мгновенное или пакетное применение.
 */
export default function Filters({ filters, active, baseUrl }: FiltersProps) {
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
            // Панель не закрываем — можно выбрать несколько значений подряд (М5).
            only: ['products', 'active', 'filters'],
        });
    };

    const toggleValue = (key: string, value: string) => {
        const current = toArray(active[key]);
        const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
        apply({ ...active, [key]: next });
    };

    const hasAny = filters.some((f) => toArray(active[f.key]).length > 0);

    // Признаки «да/нет» (app control, waterproof…) — одной группой «Features», одним касанием каждый.
    const features = filters.filter((f) => f.type === 'bool');
    const groups = filters.filter((f) => f.type !== 'bool');
    const featuresAt = Math.min(
        groups.findIndex((f) => f.key === 'brand') === -1 ? groups.length : groups.findIndex((f) => f.key === 'brand'),
        groups.length,
    );

    const toggleFeature = (key: string) => {
        const on = toArray(active[key]).includes('1');
        apply({ ...active, [key]: on ? [] : '1' });
    };

    const featureBlock = features.length > 0 && (
        <div key="__features" className="border-ivory/5 border-b pb-6 last:border-0 last:pb-0">
            <p className="font-display text-ivory text-xl font-light">Features</p>
            <div className="mt-3 flex flex-wrap gap-2">
                {features.map((f) => {
                    const isOn = toArray(active[f.key]).includes('1');
                    return (
                        <button
                            key={f.key}
                            type="button"
                            onClick={() => toggleFeature(f.key)}
                            aria-pressed={isOn}
                            className={`rounded-full border px-3.5 py-1.5 font-sans text-xs transition-all ${
                                isOn
                                    ? 'border-gold bg-gold/15 text-gold-2 font-medium'
                                    : 'border-ivory/15 bg-surface/30 text-mute hover:border-ivory/40 hover:text-ivory'
                            }`}
                        >
                            {f.label} <span className="text-mute/70">{f.counts['1'] ?? 0}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );

    return (
        <aside className="space-y-8">
            {groups.map((f, index) => {
                const selected = toArray(active[f.key]);

                return (
                    <Fragment key={f.key}>
                        {index === featuresAt && featureBlock}
                        <div className="border-ivory/5 border-b pb-6 last:border-0 last:pb-0">
                            <p className="font-display text-ivory text-xl font-light">{f.label}</p>

                            {/* Шкала (firmness, noise, weight) */}
                            {f.type === 'scale' && f.scale && (
                                <div className="mt-3 flex flex-wrap items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        {Array.from({ length: f.scale.max - f.scale.min + 1 }, (_, i) => String(i + f.scale!.min))
                                            .filter((v) => (f.counts[v] ?? 0) > 0 || selected.includes(v))
                                            .map((v) => {
                                                const isOn = selected.includes(v);
                                                return (
                                                    <button
                                                        key={v}
                                                        type="button"
                                                        className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all ${
                                                            isOn
                                                                ? 'border-gold bg-gold text-void scale-105 font-medium'
                                                                : 'border-ivory/20 bg-surface/30 text-ivory/70 hover:border-gold/50'
                                                        }`}
                                                        onClick={() => toggleValue(f.key, v)}
                                                        aria-pressed={isOn}
                                                        aria-label={`${f.label}: ${f.scale!.labels[v] ?? v} (${f.counts[v] ?? 0})`}
                                                        title={`${f.scale!.labels[v] ?? v} · ${f.counts[v] ?? 0}`}
                                                    >
                                                        <span className="font-display text-sm">{v}</span>
                                                    </button>
                                                );
                                            })}
                                    </div>
                                    <span className="text-ivory/70 font-sans text-xs font-light">
                                        {selected.length
                                            ? selected.map((v) => f.scale!.labels[v] ?? v).join(', ')
                                            : `${f.scale.labels[String(f.scale.min)] ?? ''} — ${f.scale.labels[String(f.scale.max)] ?? ''}`}
                                    </span>
                                </div>
                            )}

                            {/* Enum options (materials, textures, etc.) */}
                            {f.type === 'enum' && f.options && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {f.options
                                        .filter((o) => (f.counts[o.value] ?? 0) > 0 || selected.includes(o.value))
                                        .map((o) => {
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
                                                    {o.label} <span className="text-mute/70">{f.counts[o.value] ?? 0}</span>
                                                </button>
                                            );
                                        })}
                                </div>
                            )}
                        </div>
                    </Fragment>
                );
            })}
            {featuresAt >= groups.length && featureBlock}

            {hasAny && (
                <div className="pt-2">
                    <button
                        type="button"
                        onClick={() => apply({ q: active.q, sort: active.sort, available: active.available })}
                        className="text-rose font-sans text-xs font-medium underline-offset-4 hover:underline"
                    >
                        ✕ Clear all filters
                    </button>
                </div>
            )}
        </aside>
    );
}
