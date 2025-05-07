<?php

namespace Tests\Unit;

use App\Models\SSH;
use Tests\TestCase;

uses(TestCase::class);

test('ssh password encryption and decryption', function () {
    $plainPassword = 'sshPassword456';

    // Create an SSH instance
    $ssh = new SSH();
    $ssh->password = $plainPassword;

    // Assert the password is encrypted in the database
    expect($ssh->getAttributes()['password'])->not->toBe($plainPassword);

    // Assert the password can be decrypted correctly
    expect($ssh->password)->toBe($plainPassword);
});
