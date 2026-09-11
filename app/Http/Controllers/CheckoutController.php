<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\CartResource;
use App\Models\Order;
use App\Services\CartService;
use App\Services\CheckoutService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class CheckoutController extends Controller
{
    public function __construct(
        protected CartService $carts,
        protected CheckoutService $checkout,
    ) {}

    public function index(): Response|RedirectResponse
    {
        $cart = $this->carts->current();

        if (! $cart || $cart->items->isEmpty()) {
            return redirect()->route('cart.index');
        }

        $cart->load('items.variant.product.media');

        return Inertia::render('checkout/index', [
            'cart' => new CartResource($cart),
            'privacy' => [
                'discreetPackagingDefault' => (bool) config('velour.discreet_packaging_default'),
                'statementDescriptor' => config('velour.statement_descriptor'),
            ],
        ]);
    }

    public function store(StoreOrderRequest $request): RedirectResponse|SymfonyResponse
    {
        $cart = $this->carts->current();

        if (! $cart || $cart->items->isEmpty()) {
            return redirect()->route('cart.index');
        }

        $intent = $this->checkout->place($cart, $request->orderData());

        // Гостю кладём номер заказа в сессию — по нему покажем страницу успеха.
        $request->session()->put('order.recent', $intent->payment->order->number);

        // Hosted payment page провайдера лежит на чужом домене: Inertia умеет
        // уходить туда только через Inertia::location(), обычный 302 он съест.
        return $this->isExternal($intent->redirectUrl)
            ? Inertia::location($intent->redirectUrl)
            : redirect()->to($intent->redirectUrl);
    }

    protected function isExternal(string $url): bool
    {
        return parse_url($url, PHP_URL_HOST) !== parse_url(config('app.url'), PHP_URL_HOST);
    }

    public function success(Request $request, Order $order): Response
    {
        $this->authorizeView($request, $order);

        $order->load('items');

        return Inertia::render('checkout/success', [
            'order' => [
                'number' => $order->number,
                'status' => $order->status->value,
                'statusLabel' => $order->status->label(),
                'email' => $order->email,
                'currency' => $order->currency,
                'totalCents' => $order->total_cents,
                'isDiscreetPackaging' => $order->is_discreet_packaging,
                'statementDescriptor' => $order->statement_descriptor,
                'items' => $order->items->map(fn ($item) => [
                    'name' => $item->product_name_snapshot,
                    'variant' => $item->variant_name_snapshot,
                    'qty' => $item->qty,
                    'totalCents' => $item->total_cents,
                ]),
            ],
        ]);
    }

    /** Владелец, админ — или гость с номером заказа в текущей сессии. */
    protected function authorizeView(Request $request, Order $order): void
    {
        if ($request->session()->get('order.recent') === $order->number) {
            return;
        }

        abort_unless($request->user() && $request->user()->can('view', $order), 404);
    }
}
