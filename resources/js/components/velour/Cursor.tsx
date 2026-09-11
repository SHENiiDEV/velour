import { useEffect, useState } from 'react';

const INTERACTIVE = 'a, button, [role="button"], summary, label, [data-cursor]';
const TEXTUAL = 'input, textarea, select, [contenteditable="true"]';

/**
 * Курсор витрины: тонкое кольцо и точка внутри.
 *
 * Кольцо отстаёт от точки — от этого движение кажется тяжёлым, как у стекла.
 * Над ссылками оно наливается золотом, над кнопками с `data-magnetic`
 * притягивается к центру и слегка тянет за собой саму кнопку, над кадрами
 * `data-cursor="lens"` разрастается в лупу.
 *
 * Ставится только на точный указатель: касание и `prefers-reduced-motion`
 * оставляют системный курсор нетронутым.
 */
export default function Cursor() {
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        const fine = window.matchMedia('(pointer: fine)').matches;
        const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (fine && !still) setEnabled(true);
    }, []);

    useEffect(() => {
        if (!enabled) return;

        const root = document.documentElement;
        const ring = document.createElement('div');
        const dot = document.createElement('div');
        ring.className = 'v-cursor-ring';
        dot.className = 'v-cursor-dot';
        ring.setAttribute('aria-hidden', 'true');
        dot.setAttribute('aria-hidden', 'true');
        document.body.append(ring, dot);
        root.classList.add('has-cursor');

        // Цель — где мышь; кольцо и точка догоняют её с разной инерцией.
        let tx = window.innerWidth / 2;
        let ty = window.innerHeight / 2;
        let rx = tx;
        let ry = ty;
        let dx = tx;
        let dy = ty;

        let magnet: HTMLElement | null = null;
        let seen = false;
        let raf = 0;

        const onMove = (e: PointerEvent) => {
            tx = e.clientX;
            ty = e.clientY;
            if (!seen) {
                seen = true;
                rx = dx = tx;
                ry = dy = ty;
                ring.classList.add('is-live');
                dot.classList.add('is-live');
            }
        };

        const setMode = (mode: string) => {
            ring.dataset.mode = mode;
            dot.dataset.mode = mode;
        };

        const releaseMagnet = () => {
            if (magnet) magnet.style.transform = '';
            magnet = null;
        };

        const onOver = (e: PointerEvent) => {
            const el = e.target as HTMLElement | null;
            if (!el?.closest) return;

            if (el.closest(TEXTUAL)) {
                releaseMagnet();
                setMode('text');
                return;
            }

            const hit = el.closest<HTMLElement>(INTERACTIVE);
            if (!hit) {
                releaseMagnet();
                setMode('idle');
                return;
            }

            releaseMagnet();
            if (hit.dataset.magnetic !== undefined) magnet = hit;
            setMode(hit.dataset.cursor === 'lens' ? 'lens' : 'link');
        };

        const onDown = () => ring.classList.add('is-down');
        const onUp = () => ring.classList.remove('is-down');
        const onLeave = () => {
            ring.classList.remove('is-live');
            dot.classList.remove('is-live');
        };
        const onEnter = () => {
            if (seen) {
                ring.classList.add('is-live');
                dot.classList.add('is-live');
            }
        };

        const frame = () => {
            raf = requestAnimationFrame(frame);

            let ax = tx;
            let ay = ty;

            // Притяжение к кнопке: и кольцо, и сама кнопка идут навстречу.
            if (magnet) {
                const r = magnet.getBoundingClientRect();
                const cx = r.left + r.width / 2;
                const cy = r.top + r.height / 2;
                ax = tx + (cx - tx) * 0.42;
                ay = ty + (cy - ty) * 0.42;

                const px = Math.max(-8, Math.min(8, (tx - cx) * 0.16));
                const py = Math.max(-6, Math.min(6, (ty - cy) * 0.16));
                magnet.style.transform = `translate(${px.toFixed(2)}px, ${py.toFixed(2)}px)`;
            }

            rx += (ax - rx) * 0.16;
            ry += (ay - ry) * 0.16;
            dx += (tx - dx) * 0.55;
            dy += (ty - dy) * 0.55;

            ring.style.transform = `translate3d(${rx.toFixed(2)}px, ${ry.toFixed(2)}px, 0) translate(-50%, -50%)`;
            dot.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0) translate(-50%, -50%)`;
        };

        window.addEventListener('pointermove', onMove, { passive: true });
        window.addEventListener('pointerover', onOver, { passive: true });
        window.addEventListener('pointerdown', onDown, { passive: true });
        window.addEventListener('pointerup', onUp, { passive: true });
        document.addEventListener('pointerleave', onLeave);
        document.addEventListener('pointerenter', onEnter);
        raf = requestAnimationFrame(frame);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerover', onOver);
            window.removeEventListener('pointerdown', onDown);
            window.removeEventListener('pointerup', onUp);
            document.removeEventListener('pointerleave', onLeave);
            document.removeEventListener('pointerenter', onEnter);
            releaseMagnet();
            root.classList.remove('has-cursor');
            ring.remove();
            dot.remove();
        };
    }, [enabled]);

    return null;
}
