<?php

use App\Console\Commands\CheckPasswordExpirations;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command(CheckPasswordExpirations::class)
    ->daily()
    ->at('00:00')
    ->description('Check for password expirations and send notifications');
