<?php

use App\Models\TransactionCategory;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
});

describe('TransactionCategory API', function () {
    it('can fetch transaction categories', function () {
        // Create user categories
        TransactionCategory::factory()->count(2)->create(['user_id' => $this->user->id]);

        // Create system categories (user_id = null)
        TransactionCategory::factory()->count(3)->create(['user_id' => null]);

        // Create categories for other users (should not be returned)
        TransactionCategory::factory()->count(2)->create();

        $response = $this->actingAs($this->user)
            ->getJson(route('api.dashboard.savings.transaction-categories.index'));

        $response->assertOk()
            ->assertJsonCount(5); // 2 user + 3 system categories
    });

    it('can create a new transaction category', function () {
        $categoryData = [
            'name' => 'Test Category',
            'direction' => 'in'
        ];

        $response = $this->actingAs($this->user)
            ->postJson(route('api.dashboard.savings.transaction-categories.store'), $categoryData);

        $response->assertCreated()
            ->assertJsonFragment([
                'name' => 'Test Category',
                'direction' => 'in'
            ]);

        $this->assertDatabaseHas('transaction_categories', [
            'name' => 'Test Category',
            'direction' => 'in',
            'user_id' => $this->user->id
        ]);
    });

    it('validates required fields when creating', function () {
        $response = $this->actingAs($this->user)
            ->postJson(route('api.dashboard.savings.transaction-categories.store'), []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'direction']);
    });

    it('prevents creating duplicate categories', function () {
        TransactionCategory::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'Existing Category',
            'direction' => 'in'
        ]);

        $response = $this->actingAs($this->user)
            ->postJson(route('api.dashboard.savings.transaction-categories.store'), [
                'name' => 'Existing Category',
                'direction' => 'in'
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name'])
            ->assertJsonFragment(['Transaction category already exists.']);
    });

    it('requires authentication', function () {
        $response = $this->getJson(route('api.dashboard.savings.transaction-categories.index'));
        $response->assertUnauthorized();

        $response = $this->postJson(route('api.dashboard.savings.transaction-categories.store'), [
            'name' => 'Test',
            'direction' => 'in'
        ]);
        $response->assertUnauthorized();
    });
});
