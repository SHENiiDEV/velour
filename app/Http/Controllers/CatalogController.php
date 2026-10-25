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
use Inertia\Inertia;
use Inertia\Response;

class CatalogController extends Controller
{
    public function index(Request $request, ?Category $category = null): Response
    {
        $definitions = AttributeDefinition::where('is_filterable', true)->orderBy('position')->get();

        $query = Product::query()
            ->live()
            ->with(['media', 'variants'])
            ->when($category, fn ($q) => $q->where('category_id', $category->id));

        // Фильтры по сенсорным характеристикам: ?firmness[]=1&firmness[]=2
        foreach ($definitions as $definition) {
            if ($request->filled($definition->key)) {
                $query->withAttribute($definition->key, $request->input($definition->key));
            }
        }

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

        $this->applySorting($query, $request->string('sort')->toString());

        return Inertia::render('catalog/index', [
            'category' => $category ? [
                'slug' => $category->slug,
                'name' => $category->name,
                'tagline' => $category->tagline,
                'description' => $category->description,
            ] : null,
            // Пустые категории (например, после снятия мерча) в навигации не показываем.
            'categories' => Category::visible()
                ->whereHas('products', fn ($q) => $q->live())
                ->orderBy('position')
                ->get(['slug', 'name', 'tagline']),
            'filters' => $this->availableFilters($definitions, $category),
            'active' => $request->only([...$definitions->pluck('key')->all(), 'q', 'sort', 'available']),
            'products' => ProductCardResource::collection(
                $query->paginate(12)->withQueryString()
            ),
        ]);
    }

    public function show(Product $product): Response
    {
        // Черновики видны только админам — правило живёт в политике, не в запросе.
        $this->authorize('view', $product);

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
        $minVariant = '(select min(v.price_cents) from variants v where v.product_id = products.id and v.is_active = true and v.price_cents > 0)';
        $displayPrice = "case when {$minVariant} is not null and {$minVariant} < products.price_cents then {$minVariant} else products.price_cents end";
        $stock = '(select coalesce(sum(v.stock), 0) from variants v where v.product_id = products.id and v.is_active = true)';

        $query->select('products.*')
            ->orderByRaw("case when {$stock} > 0 then 0 else 1 end");

        match ($sort) {
            'price-asc' => $query->orderByRaw("{$displayPrice} asc")->orderBy('products.id'),
            'price-desc' => $query->orderByRaw("{$displayPrice} desc")->orderBy('products.id'),
            default => $query->orderByDesc('is_featured')->orderByDesc('published_at'),
        };
    }

    /**
     * Показываем только те фильтры и варианты, по которым реально есть товары,
     * со счётчиком. Если у всех товаров одно значение — фильтр бессмысленен (В2).
     *
     * @param  \Illuminate\Support\Collection<int, AttributeDefinition>  $definitions
     */
    protected function availableFilters($definitions, ?Category $category): array
    {
        $productIds = Product::query()->live()
            ->when($category, fn ($q) => $q->where('category_id', $category->id))
            ->select('id');

        $counts = ProductAttribute::query()
            ->whereIn('product_id', $productIds)
            ->select('key', 'value_text', 'value_numeric', DB::raw('count(*) as total'))
            ->groupBy('key', 'value_text', 'value_numeric')
            ->get()
            ->groupBy('key');

        return $definitions
            ->map(function (AttributeDefinition $d) use ($counts) {
                $values = collect($counts->get($d->key, []))
                    ->mapWithKeys(fn ($row) => [
                        $this->normalizeValue((string) ($row->value_text ?? $row->value_numeric)) => (int) $row->total,
                    ]);

                if ($values->count() < 2) {
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
            ->values()
            ->all();
    }

    /** 3.00 → "3" — чтобы ключи совпадали со значениями шкалы/bool на фронте. */
    protected function normalizeValue(string $value): string
    {
        return is_numeric($value) ? (string) (0 + $value) : $value;
    }
}
