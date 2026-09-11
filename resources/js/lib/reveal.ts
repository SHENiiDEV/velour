import { useEffect, useRef } from 'react';

/**
 * Появление секции при входе в кадр — один раз, без повторов при скролле назад.
 * Возвращает ref для контейнера; CSS-класс .reveal делает остальное.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
    const ref = useRef<T>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.add('is-in');
                    io.disconnect();
                }
            },
            { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
        );

        io.observe(el);

        return () => io.disconnect();
    }, []);

    return ref;
}
