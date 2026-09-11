<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductCardResource;
use App\Models\Category;
use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        $featured = Product::query()
            ->live()
            ->with(['media', 'variants'])
            ->orderByDesc('is_featured')
            ->orderByDesc('published_at')
            ->limit(8)   // лента прокручивается, поэтому берём с запасом
            ->get();

        // Крупный план: берём то, у чего есть фотография, и каждый раз разное.
        $closeUp = Product::query()
            ->live()
            ->whereHas('media')
            ->with(['media', 'variants'])
            ->inRandomOrder()
            ->limit(3)
            ->get();

        return Inertia::render('home', [
            'featured' => ProductCardResource::collection($featured),
            'closeUp' => ProductCardResource::collection($closeUp),
            'categories' => Category::visible()->whereNull('parent_id')->orderBy('position')->get(['slug', 'name', 'tagline']),
            'shipping' => [
                'freeFromCents' => (int) config('velour.shipping.free_from_cents'),
                'currency' => config('velour.currency'),
            ],
            // Та самая строка, которую покупатель увидит в банковском приложении.
            'statementDescriptor' => config('velour.statement_descriptor'),
        ]);
    }
}
