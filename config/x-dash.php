<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Dashboard URL Prefix
    |--------------------------------------------------------------------------
    |
    | This is the prefix that will be used for the dashboard routes. For
    | example, if you set this to "dashboard", your dashboard will be accessible
    | at "/dashboard". You can change this to whatever you like.
    |
    | Note: This prefix is used in the routes/web.php file and should not
    | be changed after the application has been deployed.
    |
    */
    'prefix' => '/dashboard',

    /*
    |--------------------------------------------------------------------------
    | Available Languages
    |--------------------------------------------------------------------------
    |
    | This is the list of languages that are available in the application.
    | You can add or remove languages as needed. Each language should have
    | a name and a direction (ltr or rtl).
    |
    */
    'available_languages' => [
        'en' => [
            'name' => 'English',
            'dir' => 'ltr',
            'key' => 'en',
        ],
        'ar' => [
            'name' => 'العربية',
            'dir' => 'rtl',
            'key' => 'ar',
        ],
    ],
];
