<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Журнал. У каждого эссе свой адрес /journal/<slug> — им можно поделиться,
 * «Назад» закрывает эссе, поисковик видит отдельную страницу (аудит, В5).
 * Цены «парных» товаров — из каталога, а не захардкожены в тексте.
 */
class JournalController extends Controller
{
    /** slug эссе → slug товара в пару (тексты эссе — в resources/js/pages/journal.tsx). */
    public const ESSAYS = [
        'geometry-of-goosebumps' => 'wearable-clitoral-vibrator-erica-plus',
        'cold-weight-of-borosilicate' => 'necklace-vibrator-braceleta',
        'subharmonic-frequencies' => 'emma-neo-2-interactive-wand-vibrator-massager',
        'the-melt-at-38-degrees' => null,
    ];

    public function __invoke(?string $essay = null): Response
    {
        abort_if($essay !== null && ! array_key_exists($essay, self::ESSAYS), 404);

        return Inertia::render('journal', [
            'essay' => $essay,
            'paired' => fn () => Product::query()
                ->live()
                ->whereIn('slug', array_filter(self::ESSAYS))
                ->with('variants')
                ->get()
                ->mapWithKeys(fn (Product $p) => [$p->slug => [
                    'slug' => $p->slug,
                    'name' => $p->name,
                    'priceFromCents' => $p->priceFromCents(),
                    'currency' => $p->currency,
                ]]),
        ]);
    }
}
