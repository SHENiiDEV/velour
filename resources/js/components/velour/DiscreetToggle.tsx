import { router } from '@inertiajs/react';
import { usePrivacy } from '@/lib/velour';

export default function DiscreetToggle() {
    const { discreet } = usePrivacy();

    const toggle = () =>
        router.post('/discreet', { enabled: !discreet }, { preserveScroll: true, preserveState: true });

    return (
        <button
            type="button"
            onClick={toggle}
            role="switch"
            aria-checked={discreet}
            className="group inline-flex items-center gap-3 font-sans text-xs font-light text-mute transition-colors hover:text-ivory"
        >
            <span
                className={`relative h-4 w-7 rounded-full border transition-colors ${
                    discreet ? 'border-gold bg-gold/20' : 'border-mute/60 bg-transparent'
                }`}
            >
                <span
                    className={`absolute top-0.5 h-[10px] w-[10px] rounded-full transition-all ${
                        discreet ? 'left-[15px] bg-gold' : 'left-0.5 bg-mute'
                    }`}
                />
            </span>
            Discreet mode
        </button>
    );
}
