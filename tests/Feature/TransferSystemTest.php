<?php

namespace Tests\Feature;

use App\Models\SavingsStorageLocation;
use App\Models\Transaction;
use App\Models\TransactionCategory;
use App\Models\User;
use App\Models\UserSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransferSystemTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected SavingsStorageLocation $sourceLocation;

    protected SavingsStorageLocation $destinationLocation;

    protected TransactionCategory $category;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();

        // Set up exchange rates for testing
        UserSetting::set($this->user, 'usd_rate_fallback', 52.0);
        UserSetting::set($this->user, 'gold24_rate_fallback', 4800.0);
        UserSetting::set($this->user, 'gold21_rate_fallback', 4200.0);

        $this->sourceLocation = SavingsStorageLocation::create([
            'user_id' => $this->user->id,
            'name' => 'Source Wallet',
        ]);

        $this->destinationLocation = SavingsStorageLocation::create([
            'user_id' => $this->user->id,
            'name' => 'Destination Wallet',
        ]);

        $this->category = TransactionCategory::create([
            'user_id' => $this->user->id,
            'name' => 'Test Category',
            'direction' => 'transfer',
        ]);
    }

    public function test_can_create_transfer_with_new_system()
    {
        $this->actingAs($this->user);

        $response = $this->post(route('dashboard.savings.transactions.store'), [
            'type' => 'USD',
            'amount' => 100.0,
            'direction' => 'transfer',
            'source_location_id' => $this->sourceLocation->id,
            'destination_location_id' => $this->destinationLocation->id,
            'notes' => 'Test transfer',
            'date' => now()->toDateString(),
        ]);

        $response->assertRedirect();

        $transaction = Transaction::first();
        $this->assertNotNull($transaction);
        $this->assertEquals('transfer', $transaction->direction);
        $this->assertEquals($this->sourceLocation->id, $transaction->source_location_id);
        $this->assertEquals($this->destinationLocation->id, $transaction->destination_location_id);
        $this->assertEquals('EGP', $transaction->type); // Converted to EGP
        $this->assertEquals('USD', $transaction->original_type); // Original type preserved
        $this->assertEquals(100.0, $transaction->original_amount);
        $this->assertEquals(5200.0, $transaction->amount); // 100 * 52
    }

    public function test_transfer_validation_requires_both_locations()
    {
        $this->actingAs($this->user);

        // Test missing source location
        $response = $this->post(route('dashboard.savings.transactions.store'), [
            'type' => 'USD',
            'amount' => 100.0,
            'direction' => 'transfer',
            'destination_location_id' => $this->destinationLocation->id,
            'notes' => 'Test transfer',
            'date' => now()->toDateString(),
        ]);

        $response->assertSessionHasErrors(['source_location_id']);

        // Test missing destination location
        $response = $this->post(route('dashboard.savings.transactions.store'), [
            'type' => 'USD',
            'amount' => 100.0,
            'direction' => 'transfer',
            'source_location_id' => $this->sourceLocation->id,
            'notes' => 'Test transfer',
            'date' => now()->toDateString(),
        ]);

        $response->assertSessionHasErrors(['destination_location_id']);
    }

    public function test_transfer_validation_prevents_same_location()
    {
        $this->actingAs($this->user);

        $response = $this->post(route('dashboard.savings.transactions.store'), [
            'type' => 'USD',
            'amount' => 100.0,
            'direction' => 'transfer',
            'source_location_id' => $this->sourceLocation->id,
            'destination_location_id' => $this->sourceLocation->id, // Same as source
            'notes' => 'Test transfer',
            'date' => now()->toDateString(),
        ]);

        $response->assertSessionHasErrors(['destination_location_id']);
    }

    public function test_transfer_currency_conversion()
    {
        $this->actingAs($this->user);

        // Create a USD transfer
        $this->post(route('dashboard.savings.transactions.store'), [
            'type' => 'USD',
            'amount' => 100.0,
            'direction' => 'transfer',
            'source_location_id' => $this->sourceLocation->id,
            'destination_location_id' => $this->destinationLocation->id,
            'notes' => 'USD transfer test',
            'date' => now()->toDateString(),
        ]);

        $transaction = Transaction::first();

        // Verify currency conversion
        $this->assertEquals('USD', $transaction->original_type);
        $this->assertEquals(100.0, $transaction->original_amount);
        $this->assertEquals('EGP', $transaction->type); // Converted to EGP
        $this->assertEquals(5200.0, $transaction->amount); // 100 * 52
    }
}
