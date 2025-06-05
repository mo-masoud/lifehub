<?php

namespace App\Utils;

class MarkdownFaker
{
    public static function generate(int $paragraphs = 3): string
    {
        $content = [];

        // Add title
        $content[] = '# ' . fake()->sentence(fake()->numberBetween(3, 6));

        // Add content
        for ($i = 0; $i < $paragraphs; $i++) {
            if (fake()->boolean(20)) {
                $content[] = '## ' . fake()->sentence(fake()->numberBetween(2, 4));
            }

            $paragraph = fake()->paragraph();

            // Add formatting
            if (fake()->boolean(30)) {
                $paragraph = self::addRandomFormatting($paragraph);
            }

            $content[] = $paragraph;
        }

        return implode("\n\n", $content);
    }

    private static function addRandomFormatting(string $text): string
    {
        $words = explode(' ', $text);
        $totalWords = count($words);

        // Add bold
        if (fake()->boolean(50)) {
            $index = fake()->numberBetween(0, $totalWords - 1);
            $words[$index] = '**' . $words[$index] . '**';
        }

        // Add italic
        if (fake()->boolean(30)) {
            $index = fake()->numberBetween(0, $totalWords - 1);
            $words[$index] = '_' . $words[$index] . '_';
        }

        // Add inline code
        if (fake()->boolean(20)) {
            $index = fake()->numberBetween(0, $totalWords - 1);
            $words[$index] = '`' . $words[$index] . '`';
        }

        return implode(' ', $words);
    }
}
