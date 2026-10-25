<?php

namespace App\Support;

use DOMDocument;
use DOMElement;
use DOMNode;
use DOMText;

/**
 * Приводит «грязный» HTML описаний (WooCommerce, Word, ChatGPT-копипаст)
 * к короткому безопасному набору тегов, который фронт рендерит как есть.
 *
 * - Белый список тегов; все атрибуты срезаются (кроме безопасного href у <a>).
 * - Обёртки без смысла (span, div, font…) разворачиваются, содержимое остаётся.
 * - script/style/meta/iframe/img… удаляются целиком.
 * - Пустые абзацы выкидываются, обычный текст превращается в <p>.
 */
class HtmlSanitizer
{
    /** Разрешённые теги → во что переименовать. */
    protected const ALLOWED = [
        'p' => 'p', 'br' => 'br',
        'strong' => 'strong', 'b' => 'strong',
        'em' => 'em', 'i' => 'em',
        'ul' => 'ul', 'ol' => 'ol', 'li' => 'li',
        'h1' => 'h3', 'h2' => 'h3', 'h3' => 'h3', 'h4' => 'h4', 'h5' => 'h4', 'h6' => 'h4',
        'blockquote' => 'blockquote',
        'table' => 'table', 'thead' => 'thead', 'tbody' => 'tbody', 'tr' => 'tr', 'th' => 'th', 'td' => 'td',
        'a' => 'a',
    ];

    /** Удаляются вместе с содержимым. */
    protected const DROP = [
        'script', 'style', 'meta', 'link', 'title', 'head', 'iframe', 'object', 'embed',
        'img', 'picture', 'video', 'audio', 'source', 'svg', 'canvas', 'form', 'input',
        'button', 'select', 'textarea', 'noscript', 'template',
    ];

    public static function clean(?string $html, bool $allowLinks = true): ?string
    {
        if ($html === null || trim($html) === '') {
            return null;
        }

        // HTML, сохранённый экранированным (&lt;p&gt;…), — раскодируем один раз.
        if (! str_contains($html, '<') && str_contains($html, '&lt;')) {
            $html = html_entity_decode($html, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        }

        // Обычный текст без тегов — абзацы по пустым строкам, переносы по одиночным.
        if (strip_tags($html) === $html) {
            return self::fromPlainText($html);
        }

        $doc = new DOMDocument('1.0', 'UTF-8');
        $previous = libxml_use_internal_errors(true);
        $doc->loadHTML(
            '<?xml encoding="UTF-8"?><div id="__root">'.$html.'</div>',
            LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD | LIBXML_NONET
        );
        libxml_clear_errors();
        libxml_use_internal_errors($previous);

        $root = $doc->getElementById('__root');
        if (! $root) {
            return self::fromPlainText(strip_tags($html));
        }

        self::walk($root, $doc, $allowLinks);
        self::removeEmpty($root);

        $out = '';
        foreach (iterator_to_array($root->childNodes) as $child) {
            $out .= $doc->saveHTML($child);
        }

        // Голый текст на верхнем уровне (между блоками) — тоже в абзацы.
        $out = self::wrapLooseText($out);
        $out = preg_replace('/(&nbsp;|\x{00A0})+/u', ' ', $out);
        $out = preg_replace("/\n{2,}/", "\n", trim($out));

        return $out === '' ? null : $out;
    }

    protected static function walk(DOMNode $node, DOMDocument $doc, bool $allowLinks = true): void
    {
        foreach (iterator_to_array($node->childNodes) as $child) {
            if ($child instanceof DOMText) {
                continue;
            }

            if (! $child instanceof DOMElement) {
                // комментарии, processing instructions (<?xml …>, MSO) и т.п.
                $node->removeChild($child);
                continue;
            }

            $tag = strtolower($child->tagName);

            if (in_array($tag, self::DROP, true)) {
                $node->removeChild($child);
                continue;
            }

            // Сначала чистим потомков — затем решаем судьбу самого узла.
            self::walk($child, $doc, $allowLinks);

            if (! isset(self::ALLOWED[$tag])) {
                self::unwrap($child);
                continue;
            }

            $target = self::ALLOWED[$tag];
            $href = $tag === 'a' && $allowLinks ? self::safeHref($child->getAttribute('href')) : null;

            if ($tag === 'a' && $href === null) {
                self::unwrap($child);
                continue;
            }

            $clean = $target === $tag ? $child : self::rename($child, $target, $doc);

            while ($clean->attributes->length > 0) {
                $clean->removeAttributeNode($clean->attributes->item(0));
            }

            if ($href !== null) {
                $clean->setAttribute('href', $href);
                $clean->setAttribute('rel', 'nofollow noopener noreferrer');
                $clean->setAttribute('target', '_blank');
            }
        }
    }

    protected static function unwrap(DOMElement $el): void
    {
        $parent = $el->parentNode;
        while ($el->firstChild) {
            $parent->insertBefore($el->firstChild, $el);
        }
        $parent->removeChild($el);
    }

    protected static function rename(DOMElement $el, string $tag, DOMDocument $doc): DOMElement
    {
        $new = $doc->createElement($tag);
        while ($el->firstChild) {
            $new->appendChild($el->firstChild);
        }
        $el->parentNode->replaceChild($new, $el);

        return $new;
    }

    protected static function safeHref(string $href): ?string
    {
        $href = trim($href);

        return preg_match('#^(https?://|mailto:)#i', $href) ? $href : null;
    }

    /** Пустые p/li/strong/em/h* (только пробелы и <br>) удаляются снизу вверх. */
    protected static function removeEmpty(DOMNode $node): void
    {
        foreach (iterator_to_array($node->childNodes) as $child) {
            if (! $child instanceof DOMElement) {
                continue;
            }

            self::removeEmpty($child);

            $tag = $child->tagName;
            if (in_array($tag, ['br', 'td', 'th', 'tr', 'table', 'thead', 'tbody'], true)) {
                continue;
            }

            $text = trim(str_replace("\u{00A0}", ' ', $child->textContent));
            if ($text === '') {
                $node->removeChild($child);
            }
        }

        // Ведущие/хвостовые <br> внутри блоков.
        if ($node instanceof DOMElement && in_array($node->tagName, ['p', 'li', 'td', 'th'], true)) {
            foreach (['firstChild', 'lastChild'] as $edge) {
                while ($node->$edge && (
                    ($node->$edge instanceof DOMElement && $node->$edge->tagName === 'br')
                    || ($node->$edge instanceof DOMText && trim($node->$edge->textContent) === '')
                )) {
                    $node->removeChild($node->$edge);
                }
            }
        }
    }

    /** Текст верхнего уровня вне блочных тегов → <p>. */
    protected static function wrapLooseText(string $html): string
    {
        $parts = preg_split(
            '#(<(?:p|ul|ol|h3|h4|blockquote|table)\b[^>]*>.*?</(?:p|ul|ol|h3|h4|blockquote|table)>)#is',
            $html,
            -1,
            PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY
        );

        $out = '';
        foreach ($parts as $part) {
            if (preg_match('#^<(p|ul|ol|h3|h4|blockquote|table)\b#i', $part)) {
                $out .= $part."\n";
                continue;
            }

            foreach (preg_split('#(?:<br\s*/?>\s*){2,}|\n\s*\n#i', $part) as $chunk) {
                $chunk = trim(preg_replace('#^(?:<br\s*/?>\s*)+|(?:<br\s*/?>\s*)+$#i', '', trim($chunk)));
                if ($chunk !== '') {
                    $out .= '<p>'.$chunk."</p>\n";
                }
            }
        }

        return $out;
    }

    protected static function fromPlainText(string $text): ?string
    {
        $text = trim(str_replace(["\r\n", "\r"], "\n", $text));
        if ($text === '') {
            return null;
        }

        $paragraphs = preg_split("/\n{2,}/", $text);

        return implode("\n", array_map(
            fn ($p) => '<p>'.nl2br(e(trim($p)), false).'</p>',
            $paragraphs
        ));
    }
}
