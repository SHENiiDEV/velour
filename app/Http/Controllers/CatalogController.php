<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductCardResource;
use App\Http\Resources\ProductDetailResource;
use App\Models\AttributeDefinition;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductAttribute;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class CatalogController extends Controller
{
    /** Ценовые диапазоны фильтра — по цене «от», которую видит покупатель (в центах). */
    public const PRICE_BUCKETS = [
        'under-50' => ['label' => 'Under €50', 'min' => 0, 'max' => 4999],
        '50-100' => ['label' => '€50 – €100', 'min' => 5000, 'max' => 9999],
        '100-200' => ['label' => '€100 – €200', 'min' => 10000, 'max' => 19999],
        '200-plus' => ['label' => '€200 and up', 'min' => 20000, 'max' => null],
    ];

    public function index(Request $request, ?Category $category = null): Response
    {
        return $this->listing($request, $category, null);
    }

    /**
     * Подборка (edit) — та же витрина каталога с предустановленным отбором и своим вступлением:
     * /edit/new-in, /edit/first-time, /edit/for-two, /edit/gifts (config/velour.php → edits).
     */
    public function edit(Request $request, string $slug): Response
    {
        $edit = config("velour.edits.{$slug}");
        abort_if(! is_array($edit), 404);

        return $this->listing($request, null, ['slug' => $slug] + $edit);
    }

    /** @param  array<string, mixed>|null  $edit */
    protected function listing(Request $request, ?Category $category, ?array $edit): Response
    {
        $definitions = AttributeDefinition::where('is_filterable', true)->orderBy('position')->get();

        // База: витрина + раздел/подборка. От неё считаются счётчики фильтров.
        $base = fn () => Product::query()
            ->live()
            ->when($category, fn ($q) => $q->where('category_id', $category->id))
            ->when($edit, fn ($q) => $this->applyEdit($q, $edit));

        $query = $base()->with(['media', 'variants']);

        // Признаки: ?kind[]=wand&waterproof=1
        foreach ($definitions as $definition) {
            if ($request->filled($definition->key)) {
                $query->withAttribute($definition->key, $request->input($definition->key));
            }
        }

        // Цена: ?price[]=50-100
        $buckets = array_intersect_key(self::PRICE_BUCKETS, array_flip((array) $request->input('price', [])));
        if ($buckets !== []) {
            $query->where(function (Builder $q) use ($buckets) {
                foreach ($buckets as $bucket) {
                    $q->orWhereRaw($this->priceRangeSql($bucket), $this->priceRangeBindings($bucket));
                }
            });
        }

        // Бренд: ?brand[]=SVAKOM
        $query->when($request->filled('brand'), fn ($q) => $q->whereIn('brand', (array) $request->input('brand')));

        $query->when($request->filled('q'), function ($q) use ($request) {
            $term = '%'.$request->string('q')->trim().'%';
            $q->where(fn ($inner) => $inner
                ->where('name', 'like', $term)
                ->orWhere('tagline', 'like', $term)
                ->orWhere('brand', 'like', $term));
        });

        // Только в наличии: ?available=1
        $query->when($request->boolean('available'), fn ($q) => $q->whereHas(
            'variants',
            fn ($v) => $v->where('is_active', true)->where('stock', '>', 0)
        ));

        $this->applySorting($query, $request->string('sort')->toString() ?: ($edit['sort'] ?? ''));

        return Inertia::render('catalog/index', [
            'category' => $category ? [
                'slug' => $category->slug,
                'name' => $category->name,
                'tagline' => $category->tagline,
                'description' => $category->description,
            ] : null,
            'edit' => $edit ? [
                'slug' => $edit['slug'],
                'title' => $edit['title'],
                'tagline' => $edit['tagline'] ?? null,
                'lede' => $edit['lede'] ?? null,
                'notes' => $edit['notes'] ?? [],
                'sort' => $edit['sort'] ?? '',
            ] : null,
            // Пустые категории (например, после снятия мерча) в навигации не показываем.
            'categories' => Category::visible()
                ->whereHas('products', fn ($q) => $q->live())
                ->orderBy('position')
                ->get(['slug', 'name', 'tagline']),
            'edits' => self::editLinks(),
            'filters' => $this->availableFilters($definitions, $base),
            'active' => $request->only([...$definitions->pluck('key')->all(), 'price', 'brand', 'q', 'sort', 'available']),
            'products' => ProductCardResource::collection(
                $query->paginate(12)->withQueryString()
            ),
        ]);
    }

    /** Подборки для навигации: slug + название. */
    public static function editLinks(): array
    {
        return collect(config('velour.edits', []))
            ->map(fn ($e, $slug) => ['slug' => $slug, 'title' => $e['title'], 'nav' => $e['nav'] ?? $e['title']])
            ->values()
            ->all();
    }

    /** Предустановленный отбор подборки. */
    protected function applyEdit(Builder $query, array $edit): Builder
    {
        if (isset($edit['max_price_cents'])) {
            $query->whereRaw($this->displayPriceSql().' <= ?', [(int) $edit['max_price_cents']]);
        }

        if (! empty($edit['kinds'])) {
            $query->withAttribute('kind', $edit['kinds']);
        }

        if (! empty($edit['exclude_kinds'])) {
            $query->whereDoesntHave('attributeValues', fn ($q) => $q->where('key', 'kind')->whereIn('value_text', $edit['exclude_kinds']));
        }

        // Любой из признаков: «для двоих» = couples ИЛИ app_control.
        if (! empty($edit['any_features'])) {
            $query->whereHas('attributeValues', fn ($q) => $q->whereIn('key', $edit['any_features'])->where('value_numeric', 1));
        }

        if (! empty($edit['published_within_days'])) {
            $query->where('published_at', '>=', now()->subDays((int) $edit['published_within_days']));
        }

        return $query;
    }

    public function show(Product $product): Response
    {
        // Черновики видны только админам — правило живёт в политике, не в запросе.
        // Для покупателя снятый с витрины товар просто не существует: 404, а не 403 (М14).
        abort_unless(Gate::allows('view', $product), 404);

        $product->load(['media', 'variants.media', 'category']);

        $definitions = AttributeDefinition::all()->keyBy('key');

        // Рекомендации — только то, что можно купить прямо сейчас (В15).
        $related = Product::query()
            ->live()
            ->where('category_id', $product->category_id)
            ->whereKeyNot($product->id)
            ->whereHas('variants', fn ($v) => $v->where('is_active', true)->where('stock', '>', 0))
            ->with(['media', 'variants'])
            ->inRandomOrder()
            ->limit(3)
            ->get();

        return Inertia::render('product/show', [
            'product' => new ProductDetailResource($product, $definitions),
            'related' => ProductCardResource::collection($related),
        ]);
    }

    /**
     * Сначала то, что в наличии; цена — та же «от», что видит покупатель
     * (минимум среди активных вариантов), а не витринная колонка (В3, В15).
     */
    protected function applySorting(Builder $query, string $sort): void
    {
        $displayPrice = $this->displayPriceSql();
        $stock = '(select coalesce(sum(v.stock), 0) from variants v where v.product_id = products.id and v.is_active = true)';

        $query->select('products.*')
            ->orderByRaw("case when {$stock} > 0 then 0 else 1 end");

        match ($sort) {
            'price-asc' => $query->orderByRaw("{$displayPrice} asc")->orderBy('products.id'),
            'price-desc' => $query->orderByRaw("{$displayPrice} desc")->orderBy('products.id'),
            'new' => $query->orderByDesc('published_at')->orderByDesc('products.id'),
            default => $query->orderByDesc('is_featured')->orderByDesc('published_at'),
        };
    }

    /** Цена «от»: минимум среди активных вариантов или витринная цена. */
    protected function displayPriceSql(): string
    {
        $minVariant = '(select min(v.price_cents) from variants v where v.product_id = products.id and v.is_active = true and v.price_cents > 0)';

        return "(case when {$minVariant} is not null and {$minVariant} < products.price_cents then {$minVariant} else products.price_cents end)";
    }

    protected function priceRangeSql(array $bucket): string
    {
        return $bucket['max'] === null
            ? $this->displayPriceSql().' >= ?'
            : $this->displayPriceSql().' between ? and ?';
    }

    protected function priceRangeBindings(array $bucket): array
    {
        return $bucket['max'] === null ? [$bucket['min']] : [$bucket['min'], $bucket['max']];
    }

    /**
     * Показываем только фильтры и варианты, по которым реально есть товары, со счётчиком.
     * Шкалы/списки — от двух разных значений; признаки «да» — если есть хотя бы один товар
     * и не у всех (иначе фильтр ничего не отсеивает). Счётчики — по разделу/подборке.
     *
     * @param  \Illuminate\Support\Collection<int, AttributeDefinition>  $definitions
     * @param  callable(): Builder  $base
     */
    protected function availableFilters($definitions, callable $base): array
    {
        $total = $base()->count();
        $productIds = $base()->select('products.id');

        $counts = ProductAttribute::query()
            ->whereIn('product_id', $productIds)
            ->select('key', 'value_text', 'value_numeric', DB::raw('count(*) as total'))
            ->groupBy('key', 'value_text', 'value_numeric')
            ->get()
            ->groupBy('key');

        $filters = $definitions
            ->map(function (AttributeDefinition $d) use ($counts, $total) {
                $values = collect($counts->get($d->key, []))
                    ->mapWithKeys(fn ($row) => [
                        $this->normalizeValue((string) ($row->value_text ?? $row->value_numeric)) => (int) $row->total,
                    ]);

                $useful = $d->type->value === 'bool'
                    ? ($values->get('1', 0) > 0 && $values->get('1', 0) < $total)
                    : $values->count() >= 2;

                if (! $useful) {
                    return null;
                }

                return [
                    'key' => $d->key,
                    'label' => $d->label,
                    'type' => $d->type->value,
                    'scale' => $d->scale,
                    'options' => $d->options,
                    'counts' => $values->all(),
                ];
            })
            ->filter()
            ->values();

        // Цена — диапазоны с непустым счётчиком.
        $prices = $base()->selectRaw($this->displayPriceSql().' as display_price')->pluck('display_price');
        $priceCounts = collect(self::PRICE_BUCKETS)->map(fn ($b) => $prices
            ->filter(fn ($p) => $p >= $b['min'] && ($b['max'] === null || $p <= $b['max']))
            ->count());

        if ($priceCounts->filter()->count() >= 2) {
            $filters->splice(1, 0, [[
                'key' => 'price',
                'label' => 'Price',
                'type' => 'enum',
                'scale' => null,
                'options' => collect(self::PRICE_BUCKETS)->map(fn ($b, $v) => ['value' => $v, 'label' => $b['label']])->values()->all(),
                'counts' => $priceCounts->all(),
            ]]);
        }

        // Бренд — если их больше одного.
        $brands = $base()->whereNotNull('brand')->select('brand', DB::raw('count(*) as total'))
            ->groupBy('brand')->orderBy('brand')->pluck('total', 'brand');

        if ($brands->count() >= 2) {
            $filters->push([
                'key' => 'brand',
                'label' => 'Brand',
                'type' => 'enum',
                'scale' => null,
                'options' => $brands->keys()->map(fn ($b) => ['value' => $b, 'label' => $b])->values()->all(),
                'counts' => $brands->map(fn ($n) => (int) $n)->all(),
            ]);
        }

        return $filters->all();
    }

    /** 3.00 → "3" — чтобы ключи совпадали со значениями шкалы/bool на фронте. */
    protected function normalizeValue(string $value): string
    {
        return is_numeric($value) ? (string) (0 + $value) : $value;
    }
}
