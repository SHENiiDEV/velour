import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { mountScene } from '@/lib/three-scene';

export type MaterialKey = 'latex' | 'silicone' | 'glass' | 'steel' | 'oil' | 'silk';

interface MaterialFieldProps {
    material: MaterialKey | string;
    className?: string;
    discreet?: boolean;
}

/**
 * Procedural material surface: latex, silicone, glass, steel, oil, silk.
 */
const PRESETS: Record<MaterialKey, { gloss: number; aniso: number; film: number; metal: number; spec: number; flow: number; tint: string }> = {
    latex: { gloss: 1.0, aniso: 0.0, film: 0.06, metal: 0.18, spec: 86, flow: 0.22, tint: '#3A0F1B' },
    silicone: { gloss: 0.15, aniso: 0.0, film: 0.0, metal: 0.0, spec: 9, flow: 0.18, tint: '#8E3440' },
    glass: { gloss: 0.6, aniso: 0.0, film: 0.18, metal: 0.1, spec: 96, flow: 0.14, tint: '#ECE3D6' },
    steel: { gloss: 0.35, aniso: 1.0, film: 0.05, metal: 1.0, spec: 150, flow: 0.09, tint: '#9E8E88' },
    oil: { gloss: 0.8, aniso: 0.0, film: 1.0, metal: 0.35, spec: 64, flow: 0.5, tint: '#C6A15B' },
    silk: { gloss: 0.45, aniso: 0.6, film: 0.12, metal: 0.25, spec: 40, flow: 0.28, tint: '#541525' },
};

function resolvePreset(key: string) {
    if (key in PRESETS) {
        return PRESETS[key as MaterialKey];
    }
    return PRESETS.silicone;
}

const FRAG = /* glsl */ `
precision highp float;

uniform vec2  uRes;
uniform vec2  uMouse;
uniform float uTime;
uniform float uGloss, uAniso, uFilm, uMetal, uSpec, uFlow, uCalm;
uniform vec3  uTint, uVoid, uGold;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
             mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = r * p * 2.03 + 7.1; a *= 0.5; }
  return v;
}

/* Высота поверхности: мягкие складки, вытянутые анизотропией под шлифовку. */
float height(vec2 p, float t) {
  // Анизотропия сжимает шум по одной оси — так выглядит шлифованный металл.
  vec2 q = vec2(p.x * mix(1.0, 7.0, uAniso), p.y * mix(1.0, 0.22, uAniso));

  float folds = fbm(q * 1.6 + vec2(t * 0.12, -t * 0.08));
  folds = fbm(q * 1.9 + 2.2 * vec2(folds, fbm(q * 1.4 - t * 0.1)));

  return folds;
}

/* Тонкоплёночная радуга — для масла и лёгкого налёта на стекле. */
vec3 thinFilm(float thickness) {
  return 0.5 + 0.5 * cos(6.28318 * (vec3(1.0, 0.86, 0.72) * thickness + vec3(0.0, 0.33, 0.67)));
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes.xy;
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes.xy) / min(uRes.x, uRes.y);

  float t = uTime * uFlow * uCalm;

  // Свет идёт за курсором — поверхность отвечает на движение руки.
  vec3 lightDir = normalize(vec3((uMouse - 0.5) * 1.6, 0.85));

  float e = 0.0016;
  float h = height(p, t);
  float hx = height(p + vec2(e, 0.0), t) - h;
  float hy = height(p + vec2(0.0, e), t) - h;

  vec3 n = normalize(vec3(-hx * 42.0, -hy * 42.0, 1.0));
  vec3 view = vec3(0.0, 0.0, 1.0);

  float diff = clamp(dot(n, lightDir), 0.0, 1.0);
  float spec = pow(clamp(dot(reflect(-lightDir, n), view), 0.0, 1.0), uSpec);
  float fres = pow(1.0 - clamp(dot(n, view), 0.0, 1.0), 3.0);

  // Металл почти не имеет рассеянного цвета, зато ярко отражает.
  vec3 base = mix(uTint * (0.34 + diff * 1.05), uTint * (0.08 + diff * 0.3), uMetal);
  base = mix(uVoid, base, 0.4 + 0.6 * smoothstep(0.1, 0.9, h));

  vec3 col = base;
  col += uGold * spec * mix(0.55, 2.2, uMetal);

  // Мокрый блеск по касательной — то, чем латекс отличается от матового силикона.
  col += mix(uTint, uGold, 0.3) * pow(fres, 1.4) * uGloss * 0.7;

  col += thinFilm(h * 2.4 + fres * 1.6) * uFilm * (0.16 + fres * 0.5);
  col += uGold * fres * 0.08;

  // Виньетка держит внимание в центре кадра.
  col *= smoothstep(1.25, 0.35, length(p * vec2(0.9, 1.15)));
  col = mix(uVoid, col, 0.92);

  // Мягкое зерно, чтобы градиенты не полосили.
  col += (hash(uv * uRes.xy) - 0.5) * 0.015;

  gl_FragColor = vec4(col, 1.0);
}
`;

export default function MaterialField({ material, className = '', discreet = false }: MaterialFieldProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const targetRef = useRef(resolvePreset(material));

    // Update target preset for seamless shader transitions
    targetRef.current = resolvePreset(material);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const start = resolvePreset(material);
        const uniforms = {
            uRes: { value: new THREE.Vector2(1, 1) },
            uMouse: { value: new THREE.Vector2(0.5, 0.5) },
            uTime: { value: 0 },
            uGloss: { value: start.gloss },
            uAniso: { value: start.aniso },
            uFilm: { value: start.film },
            uMetal: { value: start.metal },
            uSpec: { value: start.spec },
            uFlow: { value: start.flow },
            uCalm: { value: discreet ? 0.4 : 1 },
            uTint: { value: new THREE.Color(start.tint) },
            uVoid: { value: new THREE.Color('#100A0C') },
            uGold: { value: new THREE.Color('#E6CB88') },
        };

        const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

        return mountScene(canvas, {
            maxDpr: 1.5,
            setup: ({ scene }) => {
                const material2 = new THREE.ShaderMaterial({
                    uniforms,
                    vertexShader: 'void main() { gl_Position = vec4(position, 1.0); }',
                    fragmentShader: FRAG,
                });
                scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material2));
            },
            frame: ({ pointer, size }, time) => {
                const to = targetRef.current;
                const k = 0.045; // скорость перетекания материала

                uniforms.uTime.value = time;
                uniforms.uRes.value.copy(size);
                uniforms.uMouse.value.copy(pointer);
                uniforms.uGloss.value = lerp(uniforms.uGloss.value, to.gloss, k);
                uniforms.uAniso.value = lerp(uniforms.uAniso.value, to.aniso, k);
                uniforms.uFilm.value = lerp(uniforms.uFilm.value, to.film, k);
                uniforms.uMetal.value = lerp(uniforms.uMetal.value, to.metal, k);
                uniforms.uSpec.value = lerp(uniforms.uSpec.value, to.spec, k);
                uniforms.uFlow.value = lerp(uniforms.uFlow.value, to.flow, k);
                uniforms.uTint.value.lerp(new THREE.Color(to.tint), k);
                uniforms.uCalm.value = discreet ? 0.4 : 1;
            },
        });
        // Сцена создаётся один раз: смена материала идёт через targetRef.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [discreet]);

    return <canvas ref={canvasRef} className={`h-full w-full ${className}`} aria-hidden />;
}
