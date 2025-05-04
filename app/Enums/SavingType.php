<?php

namespace App\Enums;

enum SavingType: string
{
    case USD = 'USD';
    case EGP = 'EGP';
    case GOLD24 = 'GOLD24';
    case GOLD21 = 'GOLD21';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function label(): string
    {
        return match ($this) {
            self::USD => 'US Dollar',
            self::EGP => 'Egyptian Pound',
            self::GOLD24 => 'Gold 24K',
            self::GOLD21 => 'Gold 21K',
        };
    }
}
