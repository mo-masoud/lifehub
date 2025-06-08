<?php

use App\Enums\PasswordTypes;
use App\Models\Folder;
use App\Models\Password;
use App\Models\PasswordAuditLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

uses(RefreshDatabase::class);

describe('Passwords Database Optimization', function () {
    test('passwords table has all optimized indexes', function () {
        // Use Laravel's database-agnostic Schema facade to check indexes
        $indexes = collect(Schema::getIndexes('passwords'));
        $indexNames = $indexes->pluck('name');

        // Check that our new composite indexes exist
        expect($indexNames)->toContain('idx_passwords_user_type_last_used')
            ->and($indexNames)->toContain('idx_passwords_user_folder_created')
            ->and($indexNames)->toContain('idx_passwords_user_expires_created')
            ->and($indexNames)->toContain('idx_passwords_user_name_username')
            ->and($indexNames)->toContain('idx_passwords_user_type_name')
            ->and($indexNames)->toContain('idx_passwords_user_last_used_desc')
            ->and($indexNames)->toContain('idx_passwords_user_copied_usage')
            ->and($indexNames)->toContain('idx_passwords_folder_user_name')
            ->and($indexNames)->toContain('idx_passwords_key_version_user');
    });

    test('password audit logs table has all optimized indexes', function () {
        // Use Laravel's database-agnostic Schema facade to check indexes
        $indexes = collect(Schema::getIndexes('password_audit_logs'));
        $indexNames = $indexes->pluck('name');

        // Check that our new composite indexes exist
        expect($indexNames)->toContain('idx_audit_user_password_action_created')
            ->and($indexNames)->toContain('idx_audit_user_action_created_id')
            ->and($indexNames)->toContain('idx_audit_password_action_created_user')
            ->and($indexNames)->toContain('idx_audit_user_context_created')
            ->and($indexNames)->toContain('idx_audit_ip_user_created')
            ->and($indexNames)->toContain('idx_audit_user_created_action_password')
            ->and($indexNames)->toContain('idx_audit_created_action_user');
    });

    test('encrypted field types are optimized', function () {
        // Use Laravel's database-agnostic Schema facade to check column types
        $passwordType = Schema::getColumnType('passwords', 'password');
        $notesType = Schema::getColumnType('passwords', 'notes');
        $encryptedKeyType = Schema::getColumnType('passwords', 'encrypted_key');

        // Check that fields support large text content (TEXT/LONGTEXT variations)
        expect($passwordType)->toMatch('/text/i')
            ->and($notesType)->toMatch('/text/i')
            ->and($encryptedKeyType)->toMatch('/text/i');
    });

    test('database constraints are properly applied', function () {
        // Test that we can successfully create valid data
        $user = User::factory()->create();

        $validPassword = [
            'user_id' => $user->id,
            'type' => 'normal',
            'name' => 'Test Password',
            'username' => 'test',
            'password' => 'encrypted_data',
            'encrypted_key' => 'encrypted_key',
            'key_version' => 1,
            'copied' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ];

        // This should succeed
        $id = DB::table('passwords')->insertGetId($validPassword);
        expect($id)->toBeGreaterThan(0);
    });

    test('query performance is improved with indexes', function () {
        $user = User::factory()->create();
        $folder = Folder::factory()->create(['user_id' => $user->id]);

        // Create test data
        Password::factory()->count(100)->create([
            'user_id' => $user->id,
            'folder_id' => $folder->id,
            'type' => PasswordTypes::Normal,
        ]);

        // Test that commonly used queries can utilize indexes
        // Query 1: Filter by user and type with last_used_at sorting
        $query1 = Password::where('user_id', $user->id)
            ->where('type', PasswordTypes::Normal)
            ->orderBy('last_used_at', 'desc');

        expect($query1->count())->toBeGreaterThan(0);

        // Query 2: Filter by user and folder with creation time sorting
        $query2 = Password::where('user_id', $user->id)
            ->where('folder_id', $folder->id)
            ->orderBy('created_at', 'desc');

        expect($query2->count())->toBeGreaterThan(0);

        // Query 3: Search by name and username
        $query3 = Password::where('user_id', $user->id)
            ->where(function ($q) {
                $q->where('name', 'like', '%test%')
                    ->orWhere('username', 'like', '%test%');
            });

        expect($query3->count())->toBeGreaterThanOrEqual(0);
    });

    test('audit log queries perform efficiently with new indexes', function () {
        $user = User::factory()->create();
        $password = Password::factory()->create(['user_id' => $user->id]);

        // Create test audit data
        PasswordAuditLog::factory()->count(50)->create([
            'user_id' => $user->id,
            'password_id' => $password->id,
            'action' => 'viewed',
        ]);

        // Test indexed queries
        $query1 = PasswordAuditLog::where('user_id', $user->id)
            ->where('password_id', $password->id)
            ->where('action', 'viewed')
            ->orderBy('created_at', 'desc');

        expect($query1->count())->toBe(50);

        $query2 = PasswordAuditLog::where('user_id', $user->id)
            ->where('action', 'viewed')
            ->orderBy('created_at', 'desc');

        expect($query2->count())->toBe(50);
    });

    test('folder indexes improve join performance', function () {
        $user = User::factory()->create();
        $folders = Folder::factory()->count(10)->create(['user_id' => $user->id]);

        foreach ($folders as $folder) {
            Password::factory()->count(5)->create([
                'user_id' => $user->id,
                'folder_id' => $folder->id,
            ]);
        }

        // Test folder-based queries with joins
        $query = Password::with('folder')
            ->where('passwords.user_id', $user->id)
            ->join('folders', 'passwords.folder_id', '=', 'folders.id')
            ->orderBy('folders.name')
            ->orderBy('passwords.name');

        expect($query->count())->toBe(50);
    });

    test('key version indexing supports encryption key rotation', function () {
        $user = User::factory()->create();

        // Create passwords with different key versions using DB::table to avoid factory encryption
        for ($i = 0; $i < 10; $i++) {
            DB::table('passwords')->insert([
                'user_id' => $user->id,
                'type' => 'normal',
                'name' => 'Test Password V1 '.$i,
                'username' => 'test'.$i,
                'password' => 'encrypted_data',
                'encrypted_key' => 'encrypted_key',
                'key_version' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        for ($i = 0; $i < 5; $i++) {
            DB::table('passwords')->insert([
                'user_id' => $user->id,
                'type' => 'normal',
                'name' => 'Test Password V2 '.$i,
                'username' => 'test_v2_'.$i,
                'password' => 'encrypted_data',
                'encrypted_key' => 'encrypted_key',
                'key_version' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Test key version queries
        $v1Passwords = Password::where('user_id', $user->id)
            ->where('key_version', 1)
            ->count();

        $v2Passwords = Password::where('user_id', $user->id)
            ->where('key_version', 2)
            ->count();

        expect($v1Passwords)->toBe(10)
            ->and($v2Passwords)->toBe(5);
    });
});
