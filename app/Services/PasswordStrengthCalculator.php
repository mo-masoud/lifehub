<?php

namespace App\Services;

class PasswordStrengthCalculator
{
    public string $label;
    public int $score;
    public array $feedback;

    /**
     * Calculate password strength and return label
     *
     * @param string $password
     * @return array ['score' => int, 'label' => string, 'feedback' => array]
     */
    public function calculateStrength($password)
    {
        $score = 0;
        $feedback = [];

        // Length scoring
        $length = strlen($password);
        if ($length >= 8) {
            $score += 25;
        } elseif ($length >= 6) {
            $score += 15;
        } elseif ($length >= 4) {
            $score += 5;
        } else {
            $feedback[] = "Password should be at least 8 characters long";
        }

        // Bonus for longer passwords
        if ($length >= 12) $score += 10;
        if ($length >= 16) $score += 10;

        // Character variety scoring
        $hasLower = preg_match('/[a-z]/', $password);
        $hasUpper = preg_match('/[A-Z]/', $password);
        $hasNumbers = preg_match('/[0-9]/', $password);
        $hasSymbols = preg_match('/[^a-zA-Z0-9]/', $password);

        $charTypes = $hasLower + $hasUpper + $hasNumbers + $hasSymbols;

        switch ($charTypes) {
            case 4:
                $score += 25;
                break;
            case 3:
                $score += 20;
                break;
            case 2:
                $score += 10;
                break;
            case 1:
                $score += 0;
                $feedback[] = "Use a mix of character types";
                break;
        }

        // Specific character type feedback
        if (!$hasLower) $feedback[] = "Add lowercase letters";
        if (!$hasUpper) $feedback[] = "Add uppercase letters";
        if (!$hasNumbers) $feedback[] = "Add numbers";
        if (!$hasSymbols) $feedback[] = "Add special characters";

        // Pattern checks
        if (!preg_match('/(.)\1{2,}/', $password)) {
            $score += 10; // No repeated characters (3+ in a row)
        } else {
            $feedback[] = "Avoid repeating characters";
        }

        if (!preg_match('/(?:012|123|234|345|456|567|678|789|890|abc|bcd|cde|def)/i', $password)) {
            $score += 10; // No sequential characters
        } else {
            $feedback[] = "Avoid sequential patterns";
        }

        // Common pattern penalties
        if (preg_match('/^[a-zA-Z]+[0-9]+$/', $password)) {
            $score -= 10; // Letters followed by numbers
            $feedback[] = "Mix characters throughout the password";
        }

        // Dictionary/common password check (basic)
        $commonPasswords = [
            'password',
            '123456',
            '12345678',
            'qwerty',
            'abc123',
            'password123',
            'admin',
            'letmein',
            'welcome',
            'monkey'
        ];

        if (in_array(strtolower($password), $commonPasswords)) {
            $score -= 30;
            $feedback[] = "Avoid common passwords";
        }

        // Ensure score is within bounds
        $score = max(0, min(100, $score));

        // Determine label based on score
        if ($score >= 95) {
            $label = 'Awesome';
        } elseif ($score >= 90) {
            $label = 'Very strong';
        } elseif ($score >= 80) {
            $label = 'Strong';
        } elseif ($score >= 60) {
            $label = 'Good';
        } elseif ($score >= 40) {
            $label = 'Medium';
        } else {
            $label = 'Weak';
        }

        $this->label = $label;
        $this->score = $score;
        $this->feedback = $feedback;

        return [
            'score' => $score,
            'label' => $label,
            'feedback' => $feedback
        ];
    }
}
