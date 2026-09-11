interface KineticHeadlineProps {
    lines: string[];
    className?: string;
    as?: 'h1' | 'h2' | 'p';
    id?: string;
}

/**
 * Per-glyph masked entrance headline.
 * Emits full string for screen readers and search engines, and split glyphs with aria-hidden.
 */
export default function KineticHeadline({ lines, className = '', as: Tag = 'h1', id }: KineticHeadlineProps) {
    const fullText = lines.join(' ');

    let globalCharIndex = 0;

    return (
        <Tag id={id} className={`font-display leading-none font-light tracking-tight ${className}`} aria-label={fullText}>
            <span className="sr-only">{fullText}</span>
            <span aria-hidden="true" className="inline-block">
                {lines.map((line, lineIdx) => {
                    const words = line.split(' ');
                    return (
                        <span key={lineIdx} className="block whitespace-nowrap">
                            {words.map((word, wordIdx) => {
                                const chars = Array.from(word);
                                return (
                                    <span key={wordIdx} className="mr-[0.3em] inline-block whitespace-nowrap">
                                        {chars.map((char, charIdx) => {
                                            const delay = (globalCharIndex++ * 0.016 + 0.1).toFixed(3);
                                            return (
                                                <span key={charIdx} className="inline-block overflow-hidden align-baseline">
                                                    <span className="animate-rise inline-block" style={{ animationDelay: `${delay}s` }}>
                                                        {char}
                                                    </span>
                                                </span>
                                            );
                                        })}
                                    </span>
                                );
                            })}
                        </span>
                    );
                })}
            </span>
        </Tag>
    );
}
