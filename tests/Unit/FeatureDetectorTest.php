<?php

use App\Services\Catalog\FeatureDetector;

it('detects type and features only from what the card says', function () {
    $detector = new FeatureDetector;

    expect($detector->detect('EMMA NEO 2', 'A powerful wand with app control via the SVAKOM Connect app. IPX7 waterproof, USB charging.'))
        ->toBe(['kind' => 'wand', 'app_control' => true, 'waterproof' => true, 'rechargeable' => true]);

    expect($detector->detect('ERICA PLUS', 'A wearable vibrator for couples, hands-free.'))
        ->toMatchArray(['kind' => 'wearable', 'hands_free' => true, 'couples' => true]);
});

it('does not invent anything when the card is silent', function () {
    expect((new FeatureDetector)->detect('TAMMY PRO', ''))->toBe([]);
});

it('treats cables and cleaners as accessories without device features', function () {
    expect((new FeatureDetector)->detect('USB-A TO USB-C CHARGING CABLE', 'Magnetic charging, rechargeable toys, waterproof connector.'))
        ->toBe(['kind' => 'accessory']);
});

it('does not call a vibrator an accessory because its description mentions a cable', function () {
    expect((new FeatureDetector)->detect('NOVA', 'A rabbit vibrator. Comes with a charging cable.')['kind'])->toBe('rabbit');
});
