import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { brandEnvironment, mountScene } from '@/lib/three-scene';

/** Силуэты из каталога: сосуд, пробка, стек. */
export type ObjectShape = 'vessel' | 'plug' | 'wand';

interface ObjectStageProps {
    className?: string;
    /** В скрытном режиме объект темнеет и почти перестаёт двигаться. */
    discreet?: boolean;
    shape?: ObjectShape;
}

/**
 * Профиль вращения. Формы взяты у настоящих товаров: стеклянная пробка с
 * шейкой и упором, гладкий сосуд, узкий стек. Никаких вольностей —
 * силуэт ровно такой, каким он приедет в коробке.
 */
function profile(shape: ObjectShape): THREE.Vector2[] {
    const points: THREE.Vector2[] = [];

    for (let i = 0; i <= 128; i++) {
        const t = i / 128;
        let r: number;
        let y: number;

        if (shape === 'plug') {
            /*
             * Упор внизу, головка вверху — как предмет стоит на столе.
             * Считаем профиль от макушки (u = 0) и раскладываем его по y снизу вверх.
             */
            const u = 1 - t;
            const bulb = u < 0.72 ? 0.46 * Math.sin(Math.PI * Math.pow(u / 0.72, 0.62)) : 0;
            const neck = 0.115;
            const flare = u > 0.8 ? 0.44 * Math.min(1, (u - 0.8) / 0.14) : 0;
            r = Math.max(bulb, neck, flare);
            y = t * 2.0 - 1.05;
        } else if (shape === 'wand') {
            const head = 0.3 * Math.sin(Math.PI * Math.min(1, t / 0.26));
            r = Math.max(head, t < 0.26 ? 0 : 0.115);
            y = t * 2.4 - 1.2;
        } else {
            const swell = Math.sin(Math.PI * Math.pow(t, 0.72));
            const waist = 1 - 0.1 * Math.sin(Math.PI * 2.0 * t);
            r = 0.62 * swell * waist + 0.02;
            y = t * 1.75 - 0.875;
        }

        points.push(new THREE.Vector2(Math.max(r, 0.012), y));
    }

    return points;
}

/**
 * Абстрактный объект из стекла — «предмет желания» без буквальности.
 *
 * Форма строится процедурно (LatheGeometry по профилю), материал —
 * MeshPhysicalMaterial с преломлением, иридесценцией и лаком; отражения берутся
 * из процедурного окружения в цветах бренда. Никаких внешних 3D-файлов.
 */
export default function ObjectStage({ className = '', discreet = false, shape = 'vessel' }: ObjectStageProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let group: THREE.Group;
        let ring: THREE.Mesh;
        let env: THREE.Texture;

        return mountScene(canvas, {
            maxDpr: 1.25, // преломление дорогое — не гонимся за ретиной
            alpha: true,
            camera: () => new THREE.PerspectiveCamera(32, 1, 0.1, 100),
            setup: ({ scene, camera, renderer }) => {
                camera.position.set(0, 0, 6.4);

                env = brandEnvironment(renderer);
                scene.environment = env;

                group = new THREE.Group();
                scene.add(group);

                const body = new THREE.Mesh(
                    new THREE.LatheGeometry(profile(shape), 160),
                    new THREE.MeshPhysicalMaterial({
                        color: new THREE.Color('#F3ECE2'),
                        transmission: 1,
                        thickness: 1.35,
                        ior: 1.52,
                        roughness: 0.06,
                        metalness: 0,
                        clearcoat: 1,
                        clearcoatRoughness: 0.08,
                        iridescence: 0.55,
                        iridescenceIOR: 1.32,
                        iridescenceThicknessRange: [120, 460],
                        attenuationColor: new THREE.Color('#4E1224'),
                        attenuationDistance: 1.1,
                        envMapIntensity: 1.25,
                    }),
                );
                group.add(body);

                // Тонкое антикварное золото — единственная «твёрдая» деталь.
                ring = new THREE.Mesh(
                    new THREE.TorusGeometry(0.72, 0.011, 24, 256),
                    new THREE.MeshStandardMaterial({
                        color: new THREE.Color('#C6A15B'),
                        metalness: 1,
                        roughness: 0.22,
                        envMapIntensity: 1.6,
                    }),
                );
                ring.rotation.x = Math.PI / 2.35;
                ring.visible = shape === 'vessel';
                group.add(ring);

                const key = new THREE.DirectionalLight('#E6CB88', 2.1);
                key.position.set(3, 4, 3);
                const rim = new THREE.DirectionalLight('#C24D59', 1.5);
                rim.position.set(-4, -1, -3);
                scene.add(key, rim, new THREE.AmbientLight('#4E1224', 0.5));
            },
            frame: ({ pointer, progress }, time) => {
                const calm = discreet ? 0.35 : 1;

                // Объект медленно поворачивается и слегка тянется к курсору.
                group.rotation.y = time * 0.16 * calm + (pointer.x - 0.5) * 0.9;
                group.rotation.x = Math.sin(time * 0.21) * 0.09 * calm + (pointer.y - 0.5) * -0.35;
                group.position.y = Math.sin(time * 0.35) * 0.06 * calm - progress() * 0.5;

                ring.rotation.z = time * 0.28 * calm;
            },
            dispose: () => env?.dispose(),
        });
    }, [discreet, shape]);

    return (
        <div className={`relative ${className}`}>
            {/* Тёплое свечение под объектом — дешёвая замена постпроцессному bloom */}
            <div
                className="pointer-events-none absolute inset-0 blur-3xl"
                style={{
                    background:
                        'radial-gradient(closest-side, color-mix(in oklab, var(--color-wine) 65%, transparent), transparent 70%)',
                    opacity: discreet ? 0.35 : 0.75,
                }}
                aria-hidden
            />
            <canvas ref={canvasRef} className="relative h-full w-full" aria-hidden />
        </div>
    );
}
