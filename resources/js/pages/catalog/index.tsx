import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
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
    { value: '', label: 'Featured' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
];

export default function CatalogIndex({ category, categories, filters, active, products }: CatalogProps) {
    const baseUrl = category ? `/catalog/${category.slug}` : '/catalog';
    const currentSort = typeof active.sort === 'string' ? active.sort : '';
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    const setSort = (value: string) => {
        router.get(
            baseUrl,
            { ...active, sort: value || undefined },
            { preserveState: true, preserveScroll: true, replace: true, only: ['products', 'active'] }
        );
    };

    // Calculate active filter count
    const activeFilterCount = Object.entries(active).reduce((acc, [k, v]) => {
        if (k === 'sort' || k === 'q' || v === undefined) return acc;
        if (Array.isArray(v)) return acc + v.length;
        if (typeof v === 'string' && v.length > 0) return acc + 1;
        return acc;
    }, 0);

    return (
        <VelourLayout title={`${category?.name ?? 'Collection'} — VELOUR`}>
            {/* Header Section */}
            <section className="px-[5vw] pb-8 pt-32 sm:px-[6vw] sm:pb-12 sm:pt-40">
                <div className="max-w-4xl">
                    <p className="font-sans text-xs font-light tracking-[0.25em] text-gold-2 uppercase">
                        {category?.tagline ?? 'Curated Selection'}
                    </p>
                    <h1 className="mt-2 font-display text-4xl font-light text-ivory sm:text-6xl md:text-7xl">
                        {category?.name ?? 'Complete Archive'}
                    </h1>
                    {category?.description && (
                        <p className="mt-4 max-w-xl font-sans text-sm font-light leading-relaxed text-mute sm:text-base">
                            {category.description}
                        </p>
                    )}
                </div>

                {/* Horizontal Category Carousel Navigation (Smooth Scroll on Mobile) */}
                <div className="mt-8 -mx-[5vw] px-[5vw] sm:mx-0 sm:px-0">
                    <nav
                        className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 sm:flex-wrap sm:gap-3"
                        aria-label="Categories"
                    >
                        <Link
                            href="/catalog"
                            className={`shrink-0 rounded-full border px-4 py-2 font-sans text-xs transition-all ${
                                !category
                                    ? 'border-gold bg-gold/15 text-gold-2 font-medium shadow-[0_0_15px_rgba(198,161,91,0.15)]'
                                    : 'border-ivory/15 bg-surface/30 text-mute hover:border-ivory/40 hover:text-ivory'
                            }`}
                            aria-current={!category ? 'page' : undefined}
                        >
                            All Objects
                        </Link>
                        {categories.map((c) => {
                            const isCurrent = category?.slug === c.slug;
                            return (
                                <Link
                                    key={c.slug}
                                    href={`/catalog/${c.slug}`}
                                    className={`shrink-0 rounded-full border px-4 py-2 font-sans text-xs transition-all ${
                                        isCurrent
                                            ? 'border-gold bg-gold/15 text-gold-2 font-medium shadow-[0_0_15px_rgba(198,161,91,0.15)]'
                                            : 'border-ivory/15 bg-surface/30 text-mute hover:border-ivory/40 hover:text-ivory'
                                    }`}
                                    aria-current={isCurrent ? 'page' : undefined}
                                >
                                    {c.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </section>

            <div className="hairline mx-[5vw] sm:mx-[6vw]" />

            {/* Mobile Filter & Sort Bar (< lg) */}
            <div className="sticky top-16 z-20 flex items-center justify-between border-b border-ivory/10 bg-void/90 px-[5vw] py-3.5 backdrop-blur-md lg:hidden">
                <button
                    type="button"
                    onClick={() => setMobileFilterOpen(true)}
                    className="flex items-center gap-2 rounded-full border border-ivory/15 bg-surface/50 px-4 py-1.5 font-sans text-xs font-light text-ivory transition-colors hover:border-gold/40"
                >
                    <svg className="h-3.5 w-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <span>Filters</span>
                    {activeFilterCount > 0 && (
                        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 font-sans text-[10px] font-bold text-void">
                            {activeFilterCount}
                        </span>
                    )}
                </button>

                {/* Sort Dropdown for Mobile */}
                <div className="flex items-center gap-2">
                    <select
                        value={currentSort}
                        onChange={(e) => setSort(e.target.value)}
                        className="rounded-full border border-ivory/15 bg-surface/50 px-3 py-1.5 font-sans text-xs font-light text-ivory outline-none focus:border-gold"
                    >
                        {sorts.map((s) => (
                            <option key={s.value} value={s.value} className="bg-surface text-ivory">
                                {s.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Main Catalog Grid & Desktop Sidebar */}
            <section className="grid gap-12 px-[5vw] py-8 sm:px-[6vw] sm:py-16 lg:grid-cols-[280px_1fr] lg:gap-16">
                {/* Desktop Sidebar Filters */}
                <div className="hidden lg:sticky lg:top-32 lg:block lg:self-start space-y-8">
                    <div>
                        <p className="font-sans text-xs font-medium tracking-wider text-mute uppercase">Order By</p>
                        <div className="mt-3 flex flex-col gap-1.5">
                            {sorts.map((s) => (
                                <button
                                    key={s.value}
                                    type="button"
                                    onClick={() => setSort(s.value)}
                                    className={`text-left font-sans text-sm transition-colors py-1 ${
                                        currentSort === s.value
                                            ? 'text-gold-2 font-medium'
                                            : 'text-mute hover:text-ivory'
                                    }`}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-ivory/10 pt-6">
                        <Filters filters={filters} active={active} baseUrl={baseUrl} />
                    </div>
                </div>

                {/* Product Grid */}
                <div>
                    {products.data.length === 0 ? (
                        <div className="py-16 text-center max-w-md mx-auto">
                            <p className="font-display text-3xl font-light leading-snug text-ivory/80">
                                No objects match your criteria.
                            </p>
                            <p className="mt-3 font-sans text-sm font-light text-mute">
                                Try resetting filters to explore our complete collection.
                            </p>
                            <Link
                                href={baseUrl}
                                className="btn-gold mt-8 inline-block px-8 py-3.5 font-sans text-xs"
                            >
                                Reset All Filters
                            </Link>
                        </div>
                    ) : (
                        <div className="stagger grid grid-cols-2 gap-3.5 sm:gap-6 lg:grid-cols-2 xl:grid-cols-3">
                            {products.data.map((p, i) => (
                                <ProductCard key={p.id} product={p} index={i} />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {((products.meta?.last_page ?? products.last_page ?? 1) > 1) && (
                        <nav className="mt-16 flex items-center justify-between border-t border-ivory/10 pt-8 font-sans text-sm font-light text-mute" aria-label="Pages">
                            <span>
                                Page {products.meta?.current_page ?? products.current_page ?? 1} of {products.meta?.last_page ?? products.last_page ?? 1}
                            </span>
                            <div className="flex gap-6">
                                {(Array.isArray(products.meta?.links)
                                    ? products.meta.links
                                    : Array.isArray(products.links)
                                      ? products.links
                                      : []
                                ).map((l, i) =>
                                    l.url && (l.label.includes('Previous') || l.label.includes('Next') || l.label.includes('&laquo;') || l.label.includes('&raquo;')) ? (
                                        <Link
                                            key={i}
                                            href={l.url}
                                            preserveScroll
                                            className="thread text-xs uppercase tracking-wider text-ivory/80 hover:text-gold-2"
                                        >
                                            {l.label.includes('Previous') || l.label.includes('&laquo;') ? '← Previous' : 'Next →'}
                                        </Link>
                                    ) : null,
                                )}
                            </div>
                        </nav>
                    )}
                </div>
            </section>

            {/* Mobile Filter Drawer (Bottom Sheet) */}
            {mobileFilterOpen && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end bg-void/80 backdrop-blur-md lg:hidden">
                    <div
                        className="fixed inset-0"
                        onClick={() => setMobileFilterOpen(false)}
                        aria-hidden
                    />
                    <div className="relative max-h-[85vh] w-full overflow-y-auto rounded-t-2xl border-t border-ivory/20 bg-surface p-6 shadow-2xl pb-safe">
                        <div className="flex items-center justify-between border-b border-ivory/10 pb-4">
                            <h3 className="font-display text-2xl font-light text-ivory">Filter Collection</h3>
                            <button
                                type="button"
                                onClick={() => setMobileFilterOpen(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-void/50 text-ivory hover:text-gold-2"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="py-6">
                            <Filters
                                filters={filters}
                                active={active}
                                baseUrl={baseUrl}
                                onApply={() => setMobileFilterOpen(false)}
                            />
                        </div>

                        <div className="mt-4 border-t border-ivory/10 pt-4">
                            <button
                                type="button"
                                onClick={() => setMobileFilterOpen(false)}
                                className="btn-gold block w-full py-4 text-center font-sans text-sm font-medium"
                            >
                                View Results ({products.total ?? products.data.length})
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </VelourLayout>
    );
}
