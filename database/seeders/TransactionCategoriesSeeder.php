<?php

namespace Database\Seeders;

use App\Models\TransactionCategory;
use Illuminate\Database\Seeder;

class TransactionCategoriesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        TransactionCategory::insert([
            ['name' => 'grocery', 'user_id' => null, 'direction' => 'out',],
            ['name' => 'restaurant', 'user_id' => null, 'direction' => 'out',],
            ['name' => 'entertainment', 'user_id' => null, 'direction' => 'out',],
            ['name' => 'fuel', 'user_id' => null, 'direction' => 'out'],
            ['name' => 'car maintenance', 'user_id' => null, 'direction' => 'out'],
            ['name' => 'rent', 'user_id' => null, 'direction' => 'out'],
            ['name' => 'subscriptions', 'user_id' => null, 'direction' => 'out'],
            ['name' => 'internet', 'user_id' => null, 'direction' => 'out'],
            ['name' => 'mobile bill', 'user_id' => null, 'direction' => 'out'],
            ['name' => 'electricity', 'user_id' => null, 'direction' => 'out'],
            ['name' => 'water', 'user_id' => null, 'direction' => 'out'],
            ['name' => 'pharmacy', 'user_id' => null, 'direction' => 'out'],
            ['name' => 'clothes', 'user_id' => null, 'direction' => 'out'],
            ['name' => 'donation', 'user_id' => null, 'direction' => 'out'],
            ['name' => 'gifts', 'user_id' => null, 'direction' => 'out'],
            ['name' => 'education', 'user_id' => null, 'direction' => 'out'],
            ['name' => 'tools & electronics', 'user_id' => null, 'direction' => 'out'],
            ['name' => 'transportation', 'user_id' => null, 'direction' => 'out'],
            ['name' => 'kids expenses', 'user_id' => null, 'direction' => 'out'],
            ['name' => 'pets', 'user_id' => null, 'direction' => 'out'],
            ['name' => 'home maintenance', 'user_id' => null, 'direction' => 'out'],
            ['name' => 'vacation', 'user_id' => null, 'direction' => 'out'],
            ['name' => 'salary', 'user_id' => null, 'direction' => 'in'],

        ]);
    }
}
