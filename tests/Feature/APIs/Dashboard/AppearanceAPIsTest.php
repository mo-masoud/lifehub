<?php

use App\Models\User;
use App\Models\UserSetting;

beforeEach(function () {
    $this->user = User::factory()->create();
});

describe('Appearance API', function () {
    it('can update color theme preference', function () {
        $this->actingAs($this->user)
            ->patch(route('appearance.color-theme.update'), [
                'colorTheme' => 'blue',
            ])
            ->assertOk()
            ->assertJson([
                'message' => 'Color theme updated successfully',
                'colorTheme' => 'blue',
            ]);

        expect(UserSetting::get($this->user, 'color_theme'))->toBe('blue');
    });

    it('validates color theme values', function () {
        $this->actingAs($this->user)
            ->patch(route('appearance.color-theme.update'), [
                'colorTheme' => 'invalid-color',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['colorTheme']);
    });

    it('requires authentication', function () {
        $this->patch(route('appearance.color-theme.update'), [
            'colorTheme' => 'blue',
        ])
            ->assertRedirect(route('login'));
    });

    it('shows appearance page with current color theme', function () {
        UserSetting::set($this->user, 'color_theme', 'green');

        $response = $this->actingAs($this->user)
            ->get(route('appearance'))
            ->assertOk();

        expect($response->viewData('page')['props']['colorTheme'])->toBe('green');
    });

    it('defaults to violet theme when no preference is set', function () {
        $response = $this->actingAs($this->user)
            ->get(route('appearance'))
            ->assertOk();

        expect($response->viewData('page')['props']['colorTheme'])->toBe('violet');
    });
});
