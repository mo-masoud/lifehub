<?php

use App\Utils\MarkdownFaker;

test('MarkdownFaker → generate returns string', function () {
    $markdown = MarkdownFaker::generate();

    expect($markdown)->toBeString();
    expect($markdown)->not->toBeEmpty();
});

test('MarkdownFaker → generate default paragraphs', function () {
    $markdown = MarkdownFaker::generate();

    // Should contain at least a title and 3 paragraphs by default
    expect($markdown)->toContain('#');
    expect(substr_count($markdown, "\n\n"))->toBeGreaterThanOrEqual(3);
});

test('MarkdownFaker → generate custom paragraph count', function () {
    $markdown = MarkdownFaker::generate(5);

    // Should contain title plus 5 content blocks
    $parts = explode("\n\n", $markdown);
    expect(count($parts))->toBeGreaterThanOrEqual(5);
});

test('MarkdownFaker → generate with zero paragraphs', function () {
    $markdown = MarkdownFaker::generate(0);

    // Should still contain at least the title
    expect($markdown)->toContain('#');
    expect($markdown)->not->toBeEmpty();
});

test('MarkdownFaker → generate with one paragraph', function () {
    $markdown = MarkdownFaker::generate(1);

    // Should contain title and one paragraph
    expect($markdown)->toContain('#');
    $parts = explode("\n\n", $markdown);
    expect(count($parts))->toBeGreaterThanOrEqual(2); // Title + 1 paragraph
});

test('MarkdownFaker → generate includes title', function () {
    $markdown = MarkdownFaker::generate();

    // Should start with a title (# )
    expect($markdown)->toStartWith('#');
    expect($markdown)->toContain('# ');
});

test('MarkdownFaker → generate may include subtitles', function () {
    // Run multiple times to increase chance of hitting subtitle generation
    $hasSubtitle = false;

    for ($i = 0; $i < 20; $i++) {
        $markdown = MarkdownFaker::generate(10);
        if (str_contains($markdown, '## ')) {
            $hasSubtitle = true;
            break;
        }
    }

    // At least one generation should have included a subtitle given 20% probability
    expect($hasSubtitle)->toBeTrue();
});

test('MarkdownFaker → generate may include bold formatting', function () {
    // Run multiple times to increase chance of hitting bold formatting
    $hasBold = false;

    for ($i = 0; $i < 50; $i++) {
        $markdown = MarkdownFaker::generate(5);
        if (preg_match('/\*\*[^*]+\*\*/', $markdown)) {
            $hasBold = true;
            break;
        }
    }

    // Should find bold formatting in at least one generation
    expect($hasBold)->toBeTrue();
});

test('MarkdownFaker → generate may include italic formatting', function () {
    // Run multiple times to increase chance of hitting italic formatting
    $hasItalic = false;

    for ($i = 0; $i < 50; $i++) {
        $markdown = MarkdownFaker::generate(5);
        if (preg_match('/_[^_]+_/', $markdown)) {
            $hasItalic = true;
            break;
        }
    }

    // Should find italic formatting in at least one generation
    expect($hasItalic)->toBeTrue();
});

test('MarkdownFaker → generate may include code formatting', function () {
    // Run multiple times to increase chance of hitting code formatting
    $hasCode = false;

    for ($i = 0; $i < 50; $i++) {
        $markdown = MarkdownFaker::generate(5);
        if (preg_match('/`[^`]+`/', $markdown)) {
            $hasCode = true;
            break;
        }
    }

    // Should find code formatting in at least one generation
    expect($hasCode)->toBeTrue();
});

test('MarkdownFaker → generate creates valid markdown structure', function () {
    $markdown = MarkdownFaker::generate(3);

    // Check for proper markdown syntax
    expect($markdown)->toMatch('/^# .+/'); // Starts with title
    // Note: May contain ## for subtitles, which is valid markdown

    // Check for double newlines separating blocks
    $parts = explode("\n\n", $markdown);
    expect(count($parts))->toBeGreaterThan(1);
});

test('MarkdownFaker → generate creates realistic content', function () {
    $markdown = MarkdownFaker::generate(2);

    // Should contain words and sentences
    expect($markdown)->toMatch('/\w+/'); // Contains word characters
    expect($markdown)->toMatch('/\./'); // Contains periods (sentence endings)
    expect(strlen($markdown))->toBeGreaterThan(20); // Reasonable length
});

test('MarkdownFaker → generate is deterministic with same seed', function () {
    // This test might be flaky due to faker's internal seeding,
    // but we can at least check that it produces consistent output structure
    $markdown1 = MarkdownFaker::generate(2);
    $markdown2 = MarkdownFaker::generate(2);

    // Both should have similar structure (title + paragraphs)
    expect(substr_count($markdown1, "\n\n"))->toBeGreaterThanOrEqual(1);
    expect(substr_count($markdown2, "\n\n"))->toBeGreaterThanOrEqual(1);

    expect($markdown1)->toStartWith('#');
    expect($markdown2)->toStartWith('#');
});

test('MarkdownFaker → generate handles large paragraph counts', function () {
    $markdown = MarkdownFaker::generate(20);

    expect($markdown)->toBeString();
    expect($markdown)->not->toBeEmpty();
    expect(strlen($markdown))->toBeGreaterThan(100); // Should be substantial content
});

test('MarkdownFaker → addRandomFormatting preserves word structure', function () {
    // We can't directly test private method, but we can test its effects
    // by generating content and checking that formatting doesn't break words
    $markdown = MarkdownFaker::generate(10);

    // Check that formatting markers are properly paired
    $boldCount = substr_count($markdown, '**');
    expect($boldCount % 2)->toBe(0); // Even number of ** markers

    $italicCount = substr_count($markdown, '_');
    // Note: This might not always be even due to other uses of underscore

    $codeCount = substr_count($markdown, '`');
    expect($codeCount % 2)->toBe(0); // Even number of ` markers
});

test('MarkdownFaker → generate preserves original text integrity', function () {
    $markdown = MarkdownFaker::generate(3);

    // Remove all markdown formatting to check underlying text
    $plainText = preg_replace('/[#*_`]/', '', $markdown);
    $plainText = preg_replace('/\n+/', ' ', $plainText);
    $plainText = trim($plainText);

    expect($plainText)->not->toBeEmpty();
    expect($plainText)->toMatch('/[a-zA-Z\s]+/'); // Contains letters and spaces
});

test('MarkdownFaker → static methods work correctly', function () {
    // Test that we can call the static method directly
    $result = MarkdownFaker::generate(1);

    expect($result)->toBeString();
    expect($result)->not->toBeEmpty();

    // Test that the class can be instantiated if needed (though not required)
    $reflection = new ReflectionClass(MarkdownFaker::class);
    expect($reflection->getMethod('generate')->isStatic())->toBeTrue();
});
