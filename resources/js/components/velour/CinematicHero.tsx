import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import VideoField from './VideoField';
import { mountScene } from '@/lib/three-scene';
import { palette } from '@/lib/velour';

interface CinematicHeroProps {
    /** Строки заголовка — каждая появляется покадрово. */
    lines: string[];
    eyebrow?: string;
    lede?: string;
    /** Скрытный режим приглушает движение и контраст фона. */
    discreet?: boolean;
    /** Объект справа: 3D-сцена или что угодно ещё. */
    object?: React.ReactNode;
    /** Видео-фон. Шейдер остаётся под ним и подхватывает, если видео не доехало. */
    video?: { webm?: string; mp4: string; poster: string };
    children?: React.ReactNode;
}

/*
 * «Текучий материал»: доменно-искажённый fbm даёт мягкие складки,
 * производная поля — анизотропный блик (gold), тени уходят в wine/void.
 */
const FRAG = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2  uRes;
uniform vec2  uMouse;
uniform float uIntensity;
uniform vec3  uVoid, uWine, uRose, uGold;

vec3 hash3(vec2 p){
  vec3 q = vec3(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)), dot(p, vec2(419.2, 371.9)));
  return fract(sin(q) * 43758.5453);
}
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash3(i).x, b = hash3(i + vec2(1.0, 0.0)).x;
  float c = hash3(i + vec2(0.0, 1.0)).x, d = hash3(i + vec2(1.0, 1.0)).x;
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = r * p * 2.05 + 11.3; a *= 0.5; }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes.xy;
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes.xy) / min(uRes.x, uRes.y);
  float t = uTime * 0.06;

  vec2 m = (uMouse - 0.5) * 0.35;
  p += m * 0.15;

  vec2 q = vec2(fbm(p * 1.4 + t), fbm(p * 1.4 - t * 0.7 + 3.1));
  vec2 r = vec2(fbm(p * 1.8 + 3.0 * q + vec2(1.7, 9.2) + t * 0.5),
                fbm(p * 1.8 + 3.0 * q + vec2(8.3, 2.8) - t * 0.4));
  float f = fbm(p * 2.2 + 2.6 * r);

  float e = 0.004;
  float fx = fbm(p * 2.2 + 2.6 * r + vec2(e, 0.0)) - f;
  float fy = fbm(p * 2.2 + 2.6 * r + vec2(0.0, e)) - f;
  vec3 n = normalize(vec3(-fx, -fy, e * 1.6));
  vec3 l = normalize(vec3(0.35 + m.x, 0.6 + m.y, 0.7));
  float diff = clamp(dot(n, l), 0.0, 1.0);
  float spec = pow(clamp(dot(reflect(-l, n), vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 28.0);

  vec3 col = mix(uVoid, uWine, smoothstep(0.25, 0.75, f));
  col = mix(col, uRose, smoothstep(0.55, 0.95, f) * 0.55);
  col += uGold * spec * 0.9 * uIntensity;
  col *= 0.55 + diff * 0.75;

  float vig = smoothstep(1.25, 0.35, length(p * vec2(0.85, 1.1)));
  col = mix(uVoid, col, vig * uIntensity + (1.0 - uIntensity) * 0.35);
  col = mix(col, uVoid, smoothstep(0.55, 0.0, uv.y) * 0.6);

  gl_FragColor = vec4(col, 1.0);
}
`;

export default function CinematicHero({ lines, eyebrow, lede, discreet = false, object, video, children }: CinematicHeroProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sectionRef = useRef<HTMLElement>(null);
    const [videoFailed, setVideoFailed] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const uniforms = {
            uTime: { value: 0 },
            uRes: { value: new THREE.Vector2(1, 1) },
            uMouse: { value: new THREE.Vector2(0.5, 0.5) },
            uIntensity: { value: discreet ? 0.45 : 1 },
            uVoid: { value: new THREE.Color(palette.void) },
            uWine: { value: new THREE.Color(palette.wine) },
            uRose: { value: new THREE.Color(palette.rose) },
            uGold: { value: new THREE.Color(palette.gold) },
        };

        return mountScene(canvas, {
            setup: ({ scene }) => {
                const material = new THREE.ShaderMaterial({
                    uniforms,
                    vertexShader: 'void main() { gl_Position = vec4(position, 1.0); }',
                    fragmentShader: FRAG,
                });
                scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
            },
            frame: ({ pointer, size }, time) => {
                uniforms.uTime.value = time;
                uniforms.uRes.value.copy(size);
                uniforms.uMouse.value.copy(pointer);
            },
        });
    }, [discreet]);

    // Видео не доехало — молча остаёмся на шейдере, страница этого не замечает.
    const onVideoFail = useCallback(() => setVideoFailed(true), []);

    // Текст уходит вглубь при скролле — кадр «отъезжает», а не просто листается.
    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        let raf = 0;
        const update = () => {
            raf = 0;
            const p = Math.min(1, Math.max(0, -section.getBoundingClientRect().top / window.innerHeight));
            section.style.setProperty('--exit', String(p));
        };
        const onScroll = () => {
            if (!raf) raf = requestAnimationFrame(update);
        };

        update();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('scroll', onScroll);
        };
    }, []);

    return (
        <section
            ref={sectionRef}
            className="relative isolate h-svh min-h-[640px] w-full overflow-hidden bg-void"
            aria-label="VELOUR"
        >
            {/* Живой фон: шейдер всегда внизу — он же запасной вариант для видео */}
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />

            {video && !videoFailed && (
                <div className="absolute inset-0" aria-hidden>
                    <VideoField {...video} discreet={discreet} onFail={onVideoFail} />
                    {/* Затемнение под текст: без него белый кадр съедает типографику */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                'linear-gradient(to top, rgb(16 10 12 / 0.92) 0%, rgb(16 10 12 / 0.55) 38%, rgb(16 10 12 / 0.15) 70%, rgb(16 10 12 / 0.45) 100%)',
                        }}
                    />
                </div>
            )}

            <div className="vignette" aria-hidden />
            <div className="film-grain" aria-hidden />

            {/* Объект: справа на широких экранах, сверху на узких */}
            {object && (
                <div className="pointer-events-none absolute inset-y-0 right-0 z-[5] w-full opacity-90 md:w-[52%]">
                    {object}
                </div>
            )}

            {/* Кинополосы */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[7vh] bg-black" aria-hidden />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[7vh] bg-black" aria-hidden />

            {/* Типографика */}
            <div
                className="relative z-10 flex h-full flex-col justify-end px-[6vw] pb-[14vh]"
                style={{
                    opacity: 'calc(1 - var(--exit, 0) * 1.15)',
                    transform: 'translateY(calc(var(--exit, 0) * -6vh))',
                }}
            >
                {eyebrow && (
                    <p className="animate-veil mb-6 font-sans text-sm font-light text-gold/90" style={{ animationDelay: '0.2s' }}>
                        {eyebrow}
                    </p>
                )}
                <h1 className="text-cine-xl font-display font-light text-ivory">
                    {lines.map((line, i) => (
                        <span key={i} className="block overflow-hidden">
                            <span className="animate-rise block" style={{ animationDelay: `${0.35 + i * 0.22}s` }}>
                                {line}
                            </span>
                        </span>
                    ))}
                </h1>
                {lede && (
                    <p
                        className="animate-veil mt-8 max-w-md font-sans text-base font-light leading-relaxed text-ivory/80 md:text-lg"
                        style={{ animationDelay: `${0.5 + lines.length * 0.22}s` }}
                    >
                        {lede}
                    </p>
                )}
                {children && (
                    <div className="animate-veil mt-10" style={{ animationDelay: `${0.8 + lines.length * 0.22}s` }}>
                        {children}
                    </div>
                )}
            </div>

            {/* Намёк на скролл — тонкая золотая нить */}
            <div
                className="absolute bottom-[9vh] left-1/2 z-10 h-10 w-px -translate-x-1/2 bg-gradient-to-b from-gold/70 to-transparent"
                aria-hidden
            />
        </section>
    );
}
