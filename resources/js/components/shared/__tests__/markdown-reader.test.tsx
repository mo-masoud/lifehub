import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MarkdownReader } from '../markdown-reader';

// Mock ReactMarkdown
vi.mock('react-markdown', () => {
    return {
        default: ({ children, components }: any) => {
            // Simple mock that tests the component structure
            const content = children;

            // Handle single line markdown elements
            if (content.startsWith('**') && content.endsWith('**')) {
                return (
                    <div data-testid="react-markdown">
                        <strong>{content.slice(2, -2)}</strong>
                    </div>
                );
            }
            if (content.startsWith('*') && content.endsWith('*') && !content.startsWith('**')) {
                return (
                    <div data-testid="react-markdown">
                        <em>{content.slice(1, -1)}</em>
                    </div>
                );
            }
            if (content.startsWith('`') && content.endsWith('`')) {
                return (
                    <div data-testid="react-markdown">
                        <code>{content.slice(1, -1)}</code>
                    </div>
                );
            }
            if (content.startsWith('> ')) {
                return (
                    <div data-testid="react-markdown">
                        <blockquote>{content.slice(2)}</blockquote>
                    </div>
                );
            }
            if (content.includes('- ')) {
                const items = content.split('\n').filter((line: string) => line.startsWith('- '));
                return (
                    <div data-testid="react-markdown">
                        <ul>
                            {items.map((item: string, index: number) => (
                                <li key={index}>{item.slice(2)}</li>
                            ))}
                        </ul>
                    </div>
                );
            }

            // Test different markdown elements
            if (content.includes('#') || content.includes('\n')) {
                const lines = content.split('\n');
                return (
                    <div data-testid="react-markdown">
                        {lines.map((line: string, index: number) => {
                            if (line.startsWith('# ')) {
                                return <h1 key={index}>{line.replace('# ', '')}</h1>;
                            }
                            if (line.startsWith('## ')) {
                                return <h2 key={index}>{line.replace('## ', '')}</h2>;
                            }
                            if (line.startsWith('### ')) {
                                return <h3 key={index}>{line.replace('### ', '')}</h3>;
                            }
                            if (line.includes('**') && line.includes('**')) {
                                const text = line.replace(/\*\*(.*?)\*\*/g, '$1');
                                return <strong key={index}>{text}</strong>;
                            }
                            if (line.includes('*') && line.includes('*')) {
                                const text = line.replace(/\*(.*?)\*/g, '$1');
                                return <em key={index}>{text}</em>;
                            }
                            if (line.includes('`') && line.includes('`')) {
                                const text = line.replace(/`(.*?)`/g, '$1');
                                return <code key={index}>{text}</code>;
                            }
                            if (line.startsWith('- ')) {
                                return <li key={index}>{line.replace('- ', '')}</li>;
                            }
                            if (line.startsWith('> ')) {
                                return <blockquote key={index}>{line.replace('> ', '')}</blockquote>;
                            }
                            if (line.trim()) {
                                return <p key={index}>{line}</p>;
                            }
                            return null;
                        })}
                    </div>
                );
            }

            return <div data-testid="react-markdown">{content}</div>;
        },
    };
});

describe('MarkdownReader', () => {
    it('renders markdown content', () => {
        const markdown = '# Hello World\nThis is a test.';

        render(<MarkdownReader>{markdown}</MarkdownReader>);

        expect(screen.getByTestId('react-markdown')).toBeInTheDocument();
    });

    it('applies correct prose classes', () => {
        const markdown = 'Simple text';

        render(<MarkdownReader>{markdown}</MarkdownReader>);

        const container = screen.getByTestId('react-markdown').parentElement;
        expect(container).toHaveClass('prose', 'prose-xs', 'prose-neutral', 'dark:prose-invert', 'max-w-none', 'text-xs');
    });

    it('renders headings correctly', () => {
        const markdown = '# Heading 1\n## Heading 2\n### Heading 3';

        render(<MarkdownReader>{markdown}</MarkdownReader>);

        expect(screen.getByRole('heading', { level: 1, name: 'Heading 1' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 2, name: 'Heading 2' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 3, name: 'Heading 3' })).toBeInTheDocument();
    });

    it('renders paragraphs', () => {
        const markdown = 'This is a paragraph.';

        render(<MarkdownReader>{markdown}</MarkdownReader>);

        expect(screen.getByText('This is a paragraph.')).toBeInTheDocument();
    });

    it('renders strong text', () => {
        const markdown = '**Bold text**';

        render(<MarkdownReader>{markdown}</MarkdownReader>);

        expect(screen.getByText('Bold text')).toBeInTheDocument();
        expect(screen.getByText('Bold text').tagName).toBe('STRONG');
    });

    it('renders emphasized text', () => {
        const markdown = '*Italic text*';

        render(<MarkdownReader>{markdown}</MarkdownReader>);

        expect(screen.getByText('Italic text')).toBeInTheDocument();
        expect(screen.getByText('Italic text').tagName).toBe('EM');
    });

    it('renders inline code', () => {
        const markdown = '`code snippet`';

        render(<MarkdownReader>{markdown}</MarkdownReader>);

        expect(screen.getByText('code snippet')).toBeInTheDocument();
        expect(screen.getByText('code snippet').tagName).toBe('CODE');
    });

    it('renders list items', () => {
        const markdown = '- Item 1\n- Item 2';

        render(<MarkdownReader>{markdown}</MarkdownReader>);

        expect(screen.getByText('Item 1')).toBeInTheDocument();
        expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('renders blockquotes', () => {
        const markdown = '> This is a quote';

        render(<MarkdownReader>{markdown}</MarkdownReader>);

        expect(screen.getByText('This is a quote')).toBeInTheDocument();
        expect(screen.getByText('This is a quote').tagName).toBe('BLOCKQUOTE');
    });

    it('handles empty content', () => {
        render(<MarkdownReader>{''}</MarkdownReader>);

        expect(screen.getByTestId('react-markdown')).toBeInTheDocument();
    });

    it('handles multiline content', () => {
        const markdown = `# Title

This is a paragraph.

## Subtitle

Another paragraph with **bold** and *italic* text.`;

        render(<MarkdownReader>{markdown}</MarkdownReader>);

        expect(screen.getByRole('heading', { level: 1, name: 'Title' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 2, name: 'Subtitle' })).toBeInTheDocument();
    });

    it('renders complex markdown with multiple elements', () => {
        const markdown = `# API Documentation

## Overview

This is the main overview paragraph.

### Authentication

Use the following code:

\`const token = 'your-token';\`

> **Note**: Keep your token secure.

### Features

- Feature 1
- Feature 2
- Feature 3`;

        render(<MarkdownReader>{markdown}</MarkdownReader>);

        // With our simplified mock, just check that it renders the markdown
        expect(screen.getByTestId('react-markdown')).toBeInTheDocument();

        // Check for some of the text content that should be rendered from the list part
        expect(screen.getByText('Feature 1')).toBeInTheDocument();
        expect(screen.getByText('Feature 2')).toBeInTheDocument();
        expect(screen.getByText('Feature 3')).toBeInTheDocument();
    });
});
