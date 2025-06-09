import ReactMarkdown from 'react-markdown';

interface MarkdownReaderProps {
    children: string;
}

export function MarkdownReader({ children }: MarkdownReaderProps) {
    return (
        <div className="prose prose-xs prose-neutral dark:prose-invert max-w-none text-xs [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <ReactMarkdown
                components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    h1: ({ children }) => <h1 className="mb-1 text-sm font-bold">{children}</h1>,
                    h2: ({ children }) => <h2 className="mb-1 text-sm font-semibold">{children}</h2>,
                    h3: ({ children }) => <h3 className="mb-1 text-xs font-semibold">{children}</h3>,
                    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                    code: ({ children }) => <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">{children}</code>,
                    ul: ({ children }) => <ul className="mb-2 list-inside list-disc space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="mb-2 list-inside list-decimal space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="text-xs">{children}</li>,
                    blockquote: ({ children }) => <blockquote className="border-muted-foreground border-l-2 pl-2 italic">{children}</blockquote>,
                }}
            >
                {children}
            </ReactMarkdown>
        </div>
    );
}
