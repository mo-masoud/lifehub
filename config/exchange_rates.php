<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Exchange Rate API Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for fetching exchange rates from external APIs
    |
    */

    'api_url' => env('EXCHANGE_RATE_API_URL', 'https://api.exchangerate-api.com/v4/latest/USD'),

    /*
    |--------------------------------------------------------------------------
    | Manual API Call Limits
    |--------------------------------------------------------------------------
    |
    | Maximum number of manual API calls a user can make per day
    |
    */

    'max_manual_calls_per_day' => env('EXCHANGE_RATE_MAX_MANUAL_CALLS_PER_DAY', 3),

    /*
    |--------------------------------------------------------------------------
    | Default Cache Duration
    |--------------------------------------------------------------------------
    |
    | Default cache duration in hours for exchange rates
    |
    */

    'default_cache_hours' => env('EXCHANGE_RATE_DEFAULT_CACHE_HOURS', 24),

    /*
    |--------------------------------------------------------------------------
    | Available Fetch Frequencies
    |--------------------------------------------------------------------------
    |
    | Available options for how often users can automatically fetch rates
    |
    */

    'fetch_frequencies' => [
        'daily' => [
            'label' => 'Daily',
            'hours' => 24,
        ],
        'weekly' => [
            'label' => 'Weekly',
            'hours' => 168, // 24 * 7
        ],
        'monthly' => [
            'label' => 'Monthly',
            'hours' => 720, // 24 * 30
        ],
    ],

];
