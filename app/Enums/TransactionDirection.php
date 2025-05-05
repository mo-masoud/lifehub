<?php

namespace App\Enums;

enum TransactionDirection: string
{
    case IN = 'in';
    case OUT = 'out';
    case TRANSFER = 'transfer';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function label(): string
    {
        return match ($this) {
            self::IN => 'In',
            self::OUT => 'Out',
            self::TRANSFER => 'Transfer',
        };
    }
}
