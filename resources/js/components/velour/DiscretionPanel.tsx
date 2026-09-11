import { router } from '@inertiajs/react';
import { useReveal } from '@/lib/reveal';
import { usePrivacy } from '@/lib/velour';

interface DiscretionPanelProps {
    statementDescriptor: string;
}

/**
 * Приватность, которую можно потрогать: тумблер здесь же переключает скрытный
 * режим по-настоящему, а карта показывает ту самую строку, что уйдёт в банк.
 */
export default function DiscretionPanel({ statementDescriptor }: DiscretionPanelProps) {
    const ref = useReveal<HTMLElement>();
    const { discreet } = usePrivacy();

    const toggle = () => router.post('/discreet', { enabled: !discreet }, { preserveScroll: true, preserveState: true });

    return (
        <section ref={ref} className="reveal px-[6vw] py-32" aria-labelledby="discretion">
            <div className="hairline mb-20" />

            <div className="grid gap-16 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="max-w-xl">
                    <p className="font-sans text-sm font-light text-gold/90">Discretion</p>
                    <h2 id="discretion" className="mt-4 font-display text-6xl font-light leading-[0.95] text-ivory md:text-7xl">
                        Nobody
                        <br />
                        needs to know.
                    </h2>
                    <p className="mt-8 max-w-md font-sans text-base font-light leading-relaxed text-mute">
                        A plain box with no logos and no hint of the contents. A neutral entity as the sender. One line on your
                        statement that says nothing. And a switch that blurs every image on this site until you hover it.
                    </p>

                    <button
                        type="button"
                        onClick={toggle}
                        aria-pressed={discreet}
                        data-magnetic className="btn-gold mt-10 inline-flex items-center gap-4 px-8 py-4 font-sans text-sm font-light"
                    >
                        {discreet ? 'Discreet mode is on' : 'Try discreet mode'}
                        <span
                            className={`relative h-4 w-7 rounded-full border transition-colors ${
                                discreet ? 'border-current bg-current/25' : 'border-current/60'
                            }`}
                            aria-hidden
                        >
                            <span
                                className={`absolute top-[3px] h-[9px] w-[9px] rounded-full bg-current transition-all duration-500 ${
                                    discreet ? 'left-[14px]' : 'left-[3px]'
                                }`}
                            />
                        </span>
                    </button>
                </div>

                {/* Карта: то, что увидит банк, и больше ничего */}
                <div className="relative w-full max-w-sm">
                    <div
                        className="sheen relative aspect-[1.586/1] overflow-hidden rounded-sm border border-ivory/10 p-7"
                        style={{
                            background:
                                'linear-gradient(145deg, color-mix(in oklab, var(--color-graphite) 92%, transparent), color-mix(in oklab, var(--color-wine) 55%, var(--color-void)))',
                        }}
                    >
                        <div className="flex h-full flex-col justify-between">
                            <div className="flex items-start justify-between">
                                <span className="font-sans text-[10px] font-light tracking-[0.2em] text-mute">STATEMENT</span>
                                <span className="h-6 w-9 rounded-[2px] bg-gradient-to-br from-gold-2 to-gold opacity-80" aria-hidden />
                            </div>

                            <div>
                                <p className="font-display text-3xl text-ivory">{statementDescriptor}</p>
                                <p className="mt-2 font-sans text-xs font-light text-mute">
                                    No shop name. No category. No questions at the dinner table.
                                </p>
                            </div>

                            <div className="flex items-end justify-between font-sans text-xs font-light text-mute">
                                <span>•••• 4402</span>
                                <span>09/29</span>
                            </div>
                        </div>
                    </div>

                    <p className="mt-4 font-sans text-xs font-light text-mute">
                        Press Esc twice anywhere on the site to leave instantly.
                    </p>
                </div>
            </div>
        </section>
    );
}
