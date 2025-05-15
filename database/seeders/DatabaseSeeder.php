<?php

namespace Database\Seeders;

use App\Models\SavingsStorageLocation;
use Illuminate\Database\Seeder;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // User::factory()->create([
        //    'name' => 'Test User',
        //  'email' => 'test@example.com',
        // ]);

        $defaultLocations = ['home', 'bank'];

        foreach ($defaultLocations as $name) {
            SavingsStorageLocation::firstOrCreate([
                'user_id' => null,
                'name' => $name,
            ]);
        }

        $this->call([
            TransactionCategoriesSeeder::class,
        ]);
    }
}
