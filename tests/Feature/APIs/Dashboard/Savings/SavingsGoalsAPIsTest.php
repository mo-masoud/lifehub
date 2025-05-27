<?php

use App\Models\SavingsGoal;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
});

describe('SavingsGoals API', function () {
    it('can fetch goals for dashboard widgets', function () {
        // Create some goals for the user
        SavingsGoal::factory()->count(3)->create(['user_id' => $this->user->id]);

        // Create goals for other users (should not be returned)
        SavingsGoal::factory()->count(2)->create();

        $response = $this->actingAs($this->user)
            ->getJson(route('api.dashboard.savings.goals.index'));

        $response->assertOk()
            ->assertJsonCount(3);
    });

    it('can filter important goals', function () {
        // Create important and non-important goals
        SavingsGoal::factory()->create([
            'user_id' => $this->user->id,
            'severity' => 'high'
        ]);
        SavingsGoal::factory()->create([
            'user_id' => $this->user->id,
            'severity' => 'low'
        ]);

        $response = $this->actingAs($this->user)
            ->getJson(route('api.dashboard.savings.goals.index', ['important' => true]));

        $response->assertOk()
            ->assertJsonCount(1);
    });

    it('can filter active goals', function () {
        // Create achieved and active goals
        SavingsGoal::factory()->create([
            'user_id' => $this->user->id,
            'is_achieved' => true,
            'achieved_at' => now()
        ]);
        SavingsGoal::factory()->create([
            'user_id' => $this->user->id,
            'is_achieved' => false,
            'achieved_at' => null
        ]);

        $response = $this->actingAs($this->user)
            ->getJson(route('api.dashboard.savings.goals.index', ['active' => true]));

        $response->assertOk()
            ->assertJsonCount(1);
    });

    it('can limit the number of results', function () {
        SavingsGoal::factory()->count(10)->create(['user_id' => $this->user->id]);

        $response = $this->actingAs($this->user)
            ->getJson(route('api.dashboard.savings.goals.index', ['limit' => 5]));

        $response->assertOk()
            ->assertJsonCount(5);
    });

    it('requires authentication', function () {
        $response = $this->getJson(route('api.dashboard.savings.goals.index'));

        $response->assertUnauthorized();
    });
});
