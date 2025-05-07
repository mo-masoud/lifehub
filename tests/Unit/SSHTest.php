<?php

namespace Tests\Unit;

use App\Models\SSH;
use Illuminate\Support\Facades\Crypt;
use Tests\TestCase;

class SSHTest extends TestCase
{
    public function test_ssh_password_encryption_and_decryption()
    {
        $plainPassword = 'sshPassword456';

        // Create an SSH instance
        $ssh = new SSH();
        $ssh->password = $plainPassword;

        // Assert the password is encrypted in the database
        $this->assertNotEquals($plainPassword, $ssh->getAttributes()['password']);

        // Assert the password can be decrypted correctly
        $this->assertEquals($plainPassword, $ssh->password);
    }
}
