import * as THREE from 'three';
import { prefersReducedMotion } from '@/lib/velour';

export interface SceneHandles {
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.Camera;
    /** Нормализованная позиция курсора 0..1, сглаженная. */
    pointer: THREE.Vector2;
    /** 0 в начале секции, 1 когда она уходит вверх. */
    progress: () => number;
    size: THREE.Vector2;
}

interface SceneOptions {
    /** Готовим сцену: геометрия, материалы, свет. */
    setup: (h: SceneHandles) => void;
    /** Кадр. time — секунды с начала. */
    frame: (h: SceneHandles, time: number) => void;
    /** Освободить то, что создал setup. */
    dispose?: () => void;
    camera?: (aspect: number) => THREE.Camera;
    /** Верхний предел devicePixelRatio: тяжёлым сценам хватает и 1.25. */
    maxDpr?: number;
    alpha?: boolean;
}

/**
 * Общий каркас для всех WebGL-сцен витрины.
 *
 * Держит один RAF, останавливает рендер вне вьюпорта и на скрытой вкладке,
 * сглаживает курсор, считает прогресс скролла секции и корректно всё убирает.
 * При prefers-reduced-motion рисует один статичный кадр.
 */
export function mountScene(canvas: HTMLCanvasElement, options: SceneOptions): () => void {
    const reduced = prefersReducedMotion();

    let renderer: THREE.WebGLRenderer;
    try {
        renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: options.alpha ?? false,
            powerPreference: 'high-performance',
        });
    } catch {
        // Нет WebGL — секция останется с CSS-фоном, это допустимая деградация.
        return () => {};
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, options.maxDpr ?? 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    const size = new THREE.Vector2(1, 1);
    const camera = options.camera
        ? options.camera(1)
        : new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const pointer = new THREE.Vector2(0.5, 0.5);
    const pointerTarget = new THREE.Vector2(0.5, 0.5);

    let scrollProgress = 0;

    const handles: SceneHandles = {
        renderer,
        scene,
        camera,
        pointer,
        progress: () => scrollProgress,
        size,
    };

    const resize = () => {
        const w = canvas.clientWidth || 1;
        const h = canvas.clientHeight || 1;
        renderer.setSize(w, h, false);
        size.set(w * renderer.getPixelRatio(), h * renderer.getPixelRatio());

        if ((camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
            const cam = camera as THREE.PerspectiveCamera;
            cam.aspect = w / h;
            cam.updateProjectionMatrix();
        }
    };

    const onPointer = (e: PointerEvent) => {
        pointerTarget.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight);
    };

    const onScroll = () => {
        const rect = canvas.getBoundingClientRect();
        const total = rect.height + window.innerHeight;
        scrollProgress = total > 0 ? Math.min(1, Math.max(0, (window.innerHeight - rect.top) / total)) : 0;
    };

    options.setup(handles);
    resize();
    onScroll();

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), { threshold: 0.01 });
    io.observe(canvas);

    const startTime = performance.now();
    let raf = 0;

    const loop = () => {
        raf = requestAnimationFrame(loop);

        if (!visible || document.hidden) return;

        const elapsedTime = (performance.now() - startTime) / 1000;
        pointer.lerp(pointerTarget, 0.045);
        options.frame(handles, reduced ? 8 : elapsedTime);
        renderer.render(scene, camera);

        if (reduced) cancelAnimationFrame(raf); // single frame for reduced motion
    };

    loop();

    return () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        window.removeEventListener('resize', resize);
        window.removeEventListener('pointermove', onPointer);
        window.removeEventListener('scroll', onScroll);
        options.dispose?.();
        scene.traverse((obj) => {
            const mesh = obj as THREE.Mesh;
            if (mesh.geometry) mesh.geometry.dispose();
            const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
            if (Array.isArray(material)) material.forEach((m) => m.dispose());
            else material?.dispose();
        });
        renderer.dispose();
    };
}

/**
 * Окружение для отражений без внешних HDR: сфера с градиентом бренда,
 * пропущенная через PMREM. Стекло и сталь получают в бликах бордо и золото.
 */
export function brandEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
    const envScene = new THREE.Scene();

    const material = new THREE.ShaderMaterial({
        side: THREE.BackSide,
        uniforms: {
            uVoid: { value: new THREE.Color('#100A0C') },
            uWine: { value: new THREE.Color('#4E1224') },
            uRose: { value: new THREE.Color('#C24D59') },
            uGold: { value: new THREE.Color('#E6CB88') },
        },
        vertexShader: /* glsl */ `
            varying vec3 vPos;
            void main() {
                vPos = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: /* glsl */ `
            varying vec3 vPos;
            uniform vec3 uVoid, uWine, uRose, uGold;
            void main() {
                vec3 d = normalize(vPos);
                float up = d.y * 0.5 + 0.5;

                vec3 col = mix(uVoid, uWine, smoothstep(0.0, 0.65, up));
                col = mix(col, uRose, smoothstep(0.55, 0.95, up) * 0.5);

                // Два источника: тёплый ключевой и золотой контровой.
                float key = pow(max(dot(d, normalize(vec3(0.6, 0.7, 0.4))), 0.0), 8.0);
                float rim = pow(max(dot(d, normalize(vec3(-0.7, 0.2, -0.6))), 0.0), 14.0);
                col += uGold * key * 1.6 + uRose * rim * 0.8;

                gl_FragColor = vec4(col, 1.0);
            }
        `,
    });

    envScene.add(new THREE.Mesh(new THREE.SphereGeometry(10, 48, 32), material));

    const pmrem = new THREE.PMREMGenerator(renderer);
    const target = pmrem.fromScene(envScene, 0.04);

    pmrem.dispose();
    material.dispose();
    envScene.traverse((o) => (o as THREE.Mesh).geometry?.dispose());

    return target.texture;
}
