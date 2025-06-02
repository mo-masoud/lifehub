<?php

namespace App\Enums;

enum PasswordTypes: string
{
    case Normal = 'normal';
    case SSH = 'ssh';

    public static function values(): array
    {
        return [
            self::Normal->value,
            self::SSH->value,
        ];
    }
}
