<?php

namespace Database\Factories;

use App\Models\SavingsStorageLocation;
use Illuminate\Database\Eloquent\Factories\Factory;

class SavingsStorageLocationFactory extends Factory
{
    protected $model = SavingsStorageLocation::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->word(),
        ];
    }
}
