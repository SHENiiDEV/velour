import { Link, router } from '@inertiajs/react';
import Filters from '@/components/velour/Filters';
import ProductCard from '@/components/velour/ProductCard';
import VelourLayout from '@/layouts/velour-layout';
import type { FilterDefinition, Paginated, ProductCard as ProductCardProps } from '@/types/catalog';

interface CatalogProps {
    category: { slug: string; name: string; tagline: string | null; description: string | null } | null;
    categories: Array<{ slug: string; name: string; tagline: string | null }>;
    filters: FilterDefinition[];
    active: Record<string, string | string[] | undefined>;
    products: Paginated<ProductCardProps>;
}

const sorts = [
    { value: '', label: 'default' },
    { value: 'price-asc', label: 'lower price' },
    { value: 'price-desc', label: 'higher price' },
];

export default function CatalogIndex({ category, categories, filters, active, products }: CatalogProps) {
    const baseUrl = category ? `/catalog/${category.slug}` : '/catalog';
    const currentSort = typeof active.sort === 'string' ? active.sort : '';

    const setSort = (value: string) =>
        router.get(baseUrl, { ...active, sort: value || undefined }, { preserveState: true, preserveScroll: true, replace: true, only: ['products', 'active'] });

    return (
        <VelourLayout title={`${category?.name ?? 'Collection'} — VELOUR`}>
            {/* Заголовок раздела: один вход, огромная типографика, воздух */}
            <section className="stagger px-[6vw] pb-16 pt-40">
                <p className="font-sans text-sm font-light text-gold/90" style={{ '--i': 0 } as React.CSSProperties}>
                    {category?.tagline ?? 'First collection'}
                </p>
                <h1 className="text-cine-lg mt-4 font-display font-light text-ivory" style={{ '--i': 1 } as React.CSSProperties}>
                    {category?.name ?? 'Everything'}
                </h1>
                {category?.description && (
                    <p className="mt-6 max-w-lg font-sans text-base font-light leading-relaxed text-mute" style={{ '--i': 2 } as React.CSSProperties}>
                        {category.description}
                    </p>
                )}

                <nav className="mt-12 flex flex-wrap gap-x-8 gap-y-3" aria-label="Sections" style={{ '--i': 3 } as React.CSSProperties}>
                    <Link href="/catalog" className="thread font-display text-xl text-ivory/70 hover:text-ivory" aria-current={!category ? 'page' : undefined}>
                        Everything
                    </Link>
                    {categories.map((c) => (
                        <Link
                            key={c.slug}
                            href={`/catalog/${c.slug}`}
                            className="thread font-display text-xl text-ivory/70 hover:text-ivory"
                            aria-current={category?.slug === c.slug ? 'page' : undefined}
                        >
                            {c.name}
                        </Link>
                    ))}
                </nav>
            </section>

            <div className="hairline mx-[6vw]" />

            <section className="grid gap-16 px-[6vw] py-16 lg:grid-cols-[260px_1fr]">
                <div className="lg:sticky lg:top-32 lg:self-start">
                    <Filters filters={filters} active={active} baseUrl={baseUrl} />

                    <div className="mt-10">
                        <p className="font-sans text-xs font-light tracking-wide text-mute">Order</p>
                        <div className="mt-3 flex flex-wrap gap-x-5">
                            {sorts.map((s) => (
                                <button
                                    key={s.value}
                                    type="button"
                                    onClick={() => setSort(s.value)}
                                    className={`thread font-display text-lg ${currentSort === s.value ? 'text-gold-2' : 'text-ivory/70 hover:text-ivory'}`}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div>
                    {products.data.length === 0 ? (
                        <p className="max-w-md font-display text-3xl font-light leading-snug text-ivory/80">
                            Nothing matches that combination yet. Let go of one filter and something will appear.
                        </p>
                    ) : (
                        <div className="stagger grid gap-x-8 gap-y-16 sm:grid-cols-2 xl:grid-cols-3">
                            {products.data.map((p, i) => (
                                <ProductCard key={p.id} product={p} index={i} />
                            ))}
                        </div>
                    )}

                    {((products.meta?.last_page ?? products.last_page ?? 1) > 1) && (
                        <nav className="mt-20 flex items-center justify-between font-sans text-sm font-light text-mute" aria-label="Pages">
                            <span>
                                {products.meta?.current_page ?? products.current_page ?? 1} of {products.meta?.last_page ?? products.last_page ?? 1}
                            </span>
                            <div className="flex gap-8">
                                {(Array.isArray(products.meta?.links)
                                    ? products.meta.links
                                    : Array.isArray(products.links)
                                      ? products.links
                                      : []
                                ).map((l, i) =>
                                    l.url && (l.label.includes('Previous') || l.label.includes('Next') || l.label.includes('&laquo;') || l.label.includes('&raquo;')) ? (
                                        <Link key={i} href={l.url} preserveScroll className="thread text-ivory/80 hover:text-ivory">
                                            {l.label.includes('Previous') || l.label.includes('&laquo;') ? 'Back' : 'Next'}
                                        </Link>
                                    ) : null,
                                )}
                            </div>
                        </nav>
                    )}
                </div>
            </section>
        </VelourLayout>
    );
}
