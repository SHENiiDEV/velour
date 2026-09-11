import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '@/lib/velour';

interface VideoFieldProps {
    /** Пути к файлам в public/, например /media/hero.webm */
    webm?: string;
    mp4: string;
    /** Первый кадр: показывается, пока грузится видео, и вместо него при reduced-motion. */
    poster: string;
    className?: string;
    /** В скрытном режиме кадр приглушается и размывается. */
    discreet?: boolean;
    /** Вызывается, если браузер не смог воспроизвести — чтобы показать запасной фон. */
    onFail?: () => void;
}

/**
 * Видео-слой кинематографичного регистра.
 *
 * Правила, без которых видео на витрине вредит больше, чем помогает:
 * грузится только когда секция в кадре, засыпает вне его, всегда без звука,
 * при prefers-reduced-motion остаётся постером, а при любой ошибке уступает
 * место шейдеру — страница не должна зависеть от того, что видео доехало.
 */
export default function VideoField({ webm, mp4, poster, className = '', discreet = false, onFail }: VideoFieldProps) {
    const ref = useRef<HTMLVideoElement>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const video = ref.current;
        if (!video) return;

        if (prefersReducedMotion()) {
            // Остаёмся на постере: движение здесь не несёт смысла, только эффект.
            return;
        }

        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    // Источники подставляем только сейчас — до этого сеть не трогаем.
                    if (!video.dataset.armed) {
                        video.dataset.armed = '1';
                        video.querySelectorAll('source').forEach((s) => {
                            const src = s.dataset.src;
                            if (src) s.src = src;
                        });
                        video.load();
                    }
                    void video.play().catch(() => onFail?.());
                } else {
                    video.pause();
                }
            },
            { threshold: 0.05 },
        );

        io.observe(video);

        const onVisibility = () => {
            if (document.hidden) video.pause();
            else if (!prefersReducedMotion()) void video.play().catch(() => {});
        };
        document.addEventListener('visibilitychange', onVisibility);

        return () => {
            io.disconnect();
            document.removeEventListener('visibilitychange', onVisibility);
            video.pause();
        };
    }, [onFail]);

    return (
        <video
            ref={ref}
            poster={poster}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden
            onCanPlay={() => setReady(true)}
            onError={() => onFail?.()}
            className={`h-full w-full object-cover transition-[opacity,filter] duration-1000 ease-[var(--ease-cine)] ${
                ready ? 'opacity-100' : 'opacity-0'
            } ${discreet ? 'blur-md saturate-50' : ''} ${className}`}
        >
            {webm && <source data-src={webm} type="video/webm" />}
            <source data-src={mp4} type="video/mp4" />
        </video>
    );
}
