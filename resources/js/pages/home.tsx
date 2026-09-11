import { Link } from '@inertiajs/react';
import AmbientWordmark from '@/components/velour/AmbientWordmark';
import CinematicHero from '@/components/velour/CinematicHero';
import CloseUp from '@/components/velour/CloseUp';
import DiscretionPanel from '@/components/velour/DiscretionPanel';
import DoorList from '@/components/velour/DoorList';
import EditorialFilm from '@/components/velour/EditorialFilm';
import FeaturedCarousel from '@/components/velour/FeaturedCarousel';
import JournalTeaser from '@/components/velour/JournalTeaser';
import ObjectStage from '@/components/velour/ObjectStage';
import SensoryTaxonomy from '@/components/velour/SensoryTaxonomy';
import Statement from '@/components/velour/Statement';
import VelourLayout from '@/layouts/velour-layout';
import { useReveal } from '@/lib/reveal';
import { usePrivacy } from '@/lib/velour';
import { money } from '@/lib/money';
import type { ProductCard as ProductCardProps } from '@/types/catalog';

interface HomeProps {
    featured: { data: ProductCardProps[] };
    closeUp: { data: ProductCardProps[] };
    categories: Array<{ slug: string; name: string; tagline: string | null }>;
    shipping: { freeFromCents: number; currency: string };
    statementDescriptor: string;
}

const pillars = [
    {
        title: 'Material',
        text: 'Latex, medical-grade silicone, borosilicate glass, polished steel. We name every material outright — and stock only what is body-safe.',
    },
    {
        title: 'Quiet',
        text: 'A parcel with no logos. A neutral line on your statement. Discreet mode at a single touch.',
    },
    {
        title: 'No judgement',
        text: 'For any body, any pair, any pace. Here the question is “how does it feel”, never “why”.',
    },
];

/**
 * Главная в одиннадцать актов: кино → манифест → редакционный кадр → двери →
 * крупный план → витрина → материалы → приватность → опоры → журнал → имя.
 * Три WebGL-сцены и одно видео, и всё это засыпает вне кадра.
 */
export default function Home({ featured, closeUp, categories, shipping, statementDescriptor }: HomeProps) {
    const { discreet } = usePrivacy();
    const pillarsRef = useReveal<HTMLElement>();

    return (
        <VelourLayout title="VELOUR — dark luxury for adults">
            {/* I. Кино */}
            <CinematicHero
                eyebrow="VELOUR · first collection"
                lines={['Quieter.', 'Closer.']}
                lede="Glass, latex and polished steel, made for adults who read the label. Everything shipped in a box that says nothing."
                discreet={discreet}
                object={<ObjectStage className="h-full w-full" discreet={discreet} shape="plug" />}
            >
                <Link href="/catalog" data-magnetic className="btn-gold inline-flex items-center px-8 py-3 font-sans text-sm font-light">
                    See the collection
                </Link>
            </CinematicHero>

            {/* II. Манифест */}
            <Statement />

            {/* III. Редакционный кадр — единственный человек на сайте */}
            <EditorialFilm
                lines={['An hour', 'that belongs', 'to nobody else.']}
                caption="Shot in a room where the phone stays face down."
            />

            {/* IV. Двери разделов */}
            <DoorList categories={categories} />

            {/* V. Крупный план — товар без эвфемизмов */}
            <CloseUp products={closeUp.data} />

            {/* VI. Витрина */}
            <FeaturedCarousel products={featured.data} />

            {/* VII. Материалы под рукой */}
            <SensoryTaxonomy />

            {/* VIII. Приватность */}
            <DiscretionPanel statementDescriptor={statementDescriptor} />

            {/* IX. Три опоры бренда */}
            <section ref={pillarsRef} className="reveal px-[6vw] pb-32">
                <div className="grid gap-16 md:grid-cols-3">
                    {pillars.map((p, i) => (
                        <article key={p.title} style={{ '--i': i } as React.CSSProperties}>
                            <h3 className="font-display text-3xl text-ivory">{p.title}</h3>
                            <p className="mt-4 max-w-xs font-sans text-base leading-relaxed text-mute">{p.text}</p>
                        </article>
                    ))}
                </div>
                <p className="mt-16 font-sans text-sm font-light text-mute">
                    Free delivery from {money(shipping.freeFromCents, shipping.currency)} · unmarked packaging on every order
                </p>
            </section>

            {/* X. Журнал */}
            <JournalTeaser />

            {/* XI. Имя */}
            <AmbientWordmark />
        </VelourLayout>
    );
}
