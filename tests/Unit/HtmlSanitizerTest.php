<?php

use App\Support\HtmlSanitizer;

test('strips woo/word junk attributes and wrappers', function () {
    $html = '<p data-start="70" data-end="293">Hello&nbsp;world</p>'
        .'<p>The end.<span style="mso-ansi-language: EN-US;" lang="EN-US"></span></p><p>&nbsp;</p>'
        .'<table style="width:100%"><tbody><tr style="height:19px"><td style="width:33%"><strong>COLOR</strong></td>'
        .'<td><meta charset="utf-8">Black</td></tr></tbody></table>';

    expect(HtmlSanitizer::clean($html))
        ->toContain('<p>Hello world</p>')
        ->toContain('<p>The end.</p>')
        ->toContain('<td><strong>COLOR</strong></td>')
        ->toContain('<td>Black</td>')
        ->not->toContain('data-')
        ->not->toContain('style=')
        ->not->toContain('<meta')
        ->not->toContain('<span');
});

test('removes scripts and unsafe links', function () {
    $out = HtmlSanitizer::clean('<p>a<script>alert(1)</script><a href="javascript:x" onclick="y">bad</a></p>');

    expect($out)->toBe('<p>abad</p>');
});

test('keeps safe links with rel attributes', function () {
    expect(HtmlSanitizer::clean('<p><a href="https://example.com" class="x">ok</a></p>'))
        ->toContain('href="https://example.com"')
        ->toContain('rel="nofollow noopener noreferrer"')
        ->not->toContain('class=');
});

test('plain text becomes escaped paragraphs', function () {
    expect(HtmlSanitizer::clean("One\ntwo\n\nThree"))->toBe("<p>One<br>\ntwo</p>\n<p>Three</p>");
});

test('decodes html that was stored escaped', function () {
    expect(HtmlSanitizer::clean('&lt;p data-x="1"&gt;Escaped&lt;/p&gt;'))->toBe('<p>Escaped</p>');
});

test('empty input returns null', function () {
    expect(HtmlSanitizer::clean('  '))->toBeNull()
        ->and(HtmlSanitizer::clean('<p>&nbsp;</p>'))->toBeNull();
});
