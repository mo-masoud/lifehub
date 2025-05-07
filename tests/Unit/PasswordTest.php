<?php

use function Pest\Laravel\assertDatabaseHas;
use App\Models\Password;
use Tests\TestCase;

uses(TestCase::class);

test('password encryption and decryption', function () {
    $plainPassword = 'securePassword123';

    // Create a Password instance
    $password = new Password();
    $password->password = $plainPassword;

    // Assert the password is encrypted in the database
    expect($password->getAttributes()['password'])->not->toBe($plainPassword);

    // Assert the password can be decrypted correctly
    expect($password->password)->toBe($plainPassword);
});
