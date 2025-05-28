<?php

use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
});

describe('SavingsGoals Form Validation', function () {
    it('accepts valid safety margin percentage', function () {
        $response = $this->actingAs($this->user)
            ->postJson(route('dashboard.savings.goals.store'), [
                'title' => 'Test Goal',
                'target_amount' => 1000,
                'currency' => 'USD',
                'safety_margin_percentage' => 15,
                'severity' => 'medium',
            ]);

        $response->assertRedirect()
            ->assertSessionHasNoErrors();
    });

    it('accepts zero safety margin percentage', function () {
        $response = $this->actingAs($this->user)
            ->postJson(route('dashboard.savings.goals.store'), [
                'title' => 'Test Goal',
                'target_amount' => 1000,
                'currency' => 'USD',
                'safety_margin_percentage' => 0,
                'severity' => 'medium',
            ]);

        $response->assertRedirect()
            ->assertSessionHasNoErrors();
    });

    it('accepts null safety margin percentage', function () {
        $response = $this->actingAs($this->user)
            ->postJson(route('dashboard.savings.goals.store'), [
                'title' => 'Test Goal',
                'target_amount' => 1000,
                'currency' => 'USD',
                'safety_margin_percentage' => null,
                'severity' => 'medium',
            ]);

        $response->assertRedirect()
            ->assertSessionHasNoErrors();
    });

    it('accepts maximum safety margin percentage', function () {
        $response = $this->actingAs($this->user)
            ->postJson(route('dashboard.savings.goals.store'), [
                'title' => 'Test Goal',
                'target_amount' => 1000,
                'currency' => 'USD',
                'safety_margin_percentage' => 100,
                'severity' => 'medium',
            ]);

        $response->assertRedirect()
            ->assertSessionHasNoErrors();
    });

    it('rejects negative safety margin percentage', function () {
        $response = $this->actingAs($this->user)
            ->postJson(route('dashboard.savings.goals.store'), [
                'title' => 'Test Goal',
                'target_amount' => 1000,
                'currency' => 'USD',
                'safety_margin_percentage' => -5,
                'severity' => 'medium',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['safety_margin_percentage']);
    });

    it('rejects safety margin percentage over 100', function () {
        $response = $this->actingAs($this->user)
            ->postJson(route('dashboard.savings.goals.store'), [
                'title' => 'Test Goal',
                'target_amount' => 1000,
                'currency' => 'USD',
                'safety_margin_percentage' => 150,
                'severity' => 'medium',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['safety_margin_percentage']);
    });

    it('rejects non-numeric safety margin percentage', function () {
        $response = $this->actingAs($this->user)
            ->postJson(route('dashboard.savings.goals.store'), [
                'title' => 'Test Goal',
                'target_amount' => 1000,
                'currency' => 'USD',
                'safety_margin_percentage' => 'invalid',
                'severity' => 'medium',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['safety_margin_percentage']);
    });

    it('updates goal with safety margin percentage', function () {
        $goal = \App\Models\SavingsGoal::factory()->create([
            'user_id' => $this->user->id,
            'safety_margin_percentage' => 5,
        ]);

        $response = $this->actingAs($this->user)
            ->putJson(route('dashboard.savings.goals.update', $goal), [
                'title' => $goal->title,
                'target_amount' => $goal->target_amount_usd,
                'currency' => 'USD',
                'safety_margin_percentage' => 20,
                'severity' => $goal->severity,
            ]);

        $response->assertRedirect()
            ->assertSessionHasNoErrors();

        expect((float) $goal->fresh()->safety_margin_percentage)->toBe(20.0);
    });
});
