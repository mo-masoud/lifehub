<?php

namespace Tests\Unit;

use App\Models\Password;
use Illuminate\Support\Facades\Crypt;
use Tests\TestCase;

class PasswordTest extends TestCase
{
    public function test_password_encryption_and_decryption()
    {
        $plainPassword = 'securePassword123';

        // Create a Password instance
        $password = new Password();
        $password->password = $plainPassword;

        // Assert the password is encrypted in the database
        $this->assertNotEquals($plainPassword, $password->getAttributes()['password']);

        // Assert the password can be decrypted correctly
        $this->assertEquals($plainPassword, $password->password);
    }
}
