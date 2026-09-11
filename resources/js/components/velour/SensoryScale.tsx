import type { SensoryValue } from '@/types/catalog';

/**
 * Одна сенсорная характеристика: подпись, пять точек, слово.
 * Для enum/bool — только слово. Никаких прогресс-баров: точки читаются как ощущение.
 */
export default function SensoryScale({ item }: { item: SensoryValue }) {
    const isScale = item.scale !== null && typeof item.value === 'number';
    const max = item.scale?.max ?? 5;
    const min = item.scale?.min ?? 1;

    return (
        <div className="flex items-center justify-between gap-6 py-3">
            <span className="font-sans text-sm font-light text-mute">{item.label}</span>
            <span className="flex items-center gap-4">
                {isScale && (
                    <span className="flex items-center gap-[6px]" aria-hidden>
                        {Array.from({ length: max - min + 1 }, (_, i) => (
                            <span key={i} className="scale-dot" data-on={i + min <= (item.value as number)} />
                        ))}
                    </span>
                )}
                <span className="min-w-[6ch] text-right font-display text-lg text-ivory">
                    {item.valueLabel ?? String(item.value)}
                </span>
            </span>
        </div>
    );
}
