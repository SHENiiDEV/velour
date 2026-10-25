<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="dark">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
        <meta name="color-scheme" content="dark">
        <meta name="theme-color" content="#100A0C">
        <link rel="icon" href="/favicon.ico" sizes="48x48">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">
        <link rel="manifest" href="/site.webmanifest">
        <meta name="rating" content="adult">
        <meta name="rating" content="RTA-5042-1996-1400-1577-RTA">

        <title inertia>{{ config('app.name', 'VELOUR') }}</title>
        <meta name="description" content="VELOUR — a discreet shop for adults: vibrators, strokers and app-connected pieces, shipped in an unmarked box." head-key="description" inertia>


        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="bg-void text-ivory font-sans antialiased">
        @inertia
    </body>
</html>
