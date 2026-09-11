<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductCardResource;
use App\Http\Resources\ProductDetailResource;
use App\Models\AttributeDefinition;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
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
            $q->where(fn ($inner) => $inner->where('name', 'like', $term)->orWhere('tagline', 'like', $term));
        });

        $query->when(
            $request->string('sort')->toString(),
            fn ($q, $sort) => match ($sort) {
                'price-asc' => $q->orderBy('price_cents'),
                'price-desc' => $q->orderByDesc('price_cents'),
                default => $q->orderByDesc('is_featured')->orderByDesc('published_at'),
            },
            fn ($q) => $q->orderByDesc('is_featured')->orderByDesc('published_at'),
        );

        return Inertia::render('catalog/index', [
            'category' => $category ? [
                'slug' => $category->slug,
                'name' => $category->name,
                'tagline' => $category->tagline,
                'description' => $category->description,
            ] : null,
            'categories' => Category::visible()->orderBy('position')->get(['slug', 'name', 'tagline']),
            'filters' => $definitions->map(fn (AttributeDefinition $d) => [
                'key' => $d->key,
                'label' => $d->label,
                'type' => $d->type->value,
                'scale' => $d->scale,
                'options' => $d->options,
            ]),
            'active' => $request->only([...$definitions->pluck('key')->all(), 'q', 'sort']),
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

        $related = Product::query()
            ->live()
            ->where('category_id', $product->category_id)
            ->whereKeyNot($product->id)
            ->with(['media', 'variants'])
            ->limit(3)
            ->get();

        return Inertia::render('product/show', [
            'product' => new ProductDetailResource($product, $definitions),
            'related' => ProductCardResource::collection($related),
        ]);
    }
}
