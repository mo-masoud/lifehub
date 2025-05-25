<?php

namespace Tests\Unit;

use App\Models\User;
use App\Models\Transaction;
use App\Models\TransactionCategory;
use App\Models\SavingsStorageLocation;
use App\Models\UserSetting;
use App\Services\DashboardStatsService;
use App\Enums\TransactionDirection;
use App\Enums\SavingType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class DashboardStatsServiceTest extends TestCase
{
    use RefreshDatabase;

    private DashboardStatsService $service;
    private User $user;
    private SavingsStorageLocation $storageLocation;
    private TransactionCategory $category;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new DashboardStatsService();

        // Create test user
        $this->user = User::factory()->create();
        Auth::login($this->user);

        // Set up conversion rates for testing
        UserSetting::set($this->user, 'usd_rate_fallback', 52.0); // 1 USD = 52 EGP
        UserSetting::set($this->user, 'gold24_rate_fallback', 4800.0);
        UserSetting::set($this->user, 'gold21_rate_fallback', 4200.0);

        // Create test storage location and category
        $this->storageLocation = SavingsStorageLocation::create([
            'user_id' => $this->user->id,
            'name' => 'Test Wallet'
        ]);

        $this->category = TransactionCategory::create([
            'user_id' => $this->user->id,
            'name' => 'Test Category',
            'direction' => 'out'
        ]);
    }

    /**
     * Test the critical currency conversion bug fix:
     * $200 USD should rank higher than 1000 EGP when USD rate > 5
     */
    public function test_currency_conversion_ordering_in_top_transactions()
    {
        // Create a USD transaction: $200 USD
        $usdTransaction = Transaction::create([
            'user_id' => $this->user->id,
            'type' => SavingType::USD->value,
            'amount' => 200.0,
            'direction' => TransactionDirection::OUT->value,
            'storage_location_id' => $this->storageLocation->id,
            'transaction_category_id' => $this->category->id,
            'created_at' => now(),
        ]);

        // Create an EGP transaction: 1000 EGP
        $egpTransaction = Transaction::create([
            'user_id' => $this->user->id,
            'type' => SavingType::EGP->value,
            'amount' => 1000.0,
            'direction' => TransactionDirection::OUT->value,
            'storage_location_id' => $this->storageLocation->id,
            'transaction_category_id' => $this->category->id,
            'created_at' => now(),
        ]);

        // Get top transactions for current week
        $topTransactions = $this->service->getTopTransactionsByPeriod();
        $weekTransaction = $topTransactions['week'];

        // USD should be the top transaction because:
        // $200 USD * 52 EGP/USD = 10,400 EGP > 1000 EGP
        $this->assertNotNull($weekTransaction);
        $this->assertEquals('USD', $weekTransaction['type']);
        $this->assertEquals(200.0, $weekTransaction['amount']);
        $this->assertEquals(10400.0, $weekTransaction['amount_egp']); // 200 * 52
        $this->assertEquals(200.0, $weekTransaction['amount_usd']);
    }

    /**
     * Test category aggregation with mixed currencies
     */
    public function test_category_aggregation_with_currency_conversion()
    {
        // Create multiple transactions in different currencies for the same category
        Transaction::create([
            'user_id' => $this->user->id,
            'type' => SavingType::USD->value,
            'amount' => 100.0,
            'direction' => TransactionDirection::OUT->value,
            'storage_location_id' => $this->storageLocation->id,
            'transaction_category_id' => $this->category->id,
            'created_at' => now(),
        ]);

        Transaction::create([
            'user_id' => $this->user->id,
            'type' => SavingType::EGP->value,
            'amount' => 1000.0,
            'direction' => TransactionDirection::OUT->value,
            'storage_location_id' => $this->storageLocation->id,
            'transaction_category_id' => $this->category->id,
            'created_at' => now(),
        ]);

        Transaction::create([
            'user_id' => $this->user->id,
            'type' => SavingType::GOLD24->value,
            'amount' => 2.0, // 2 grams
            'direction' => TransactionDirection::OUT->value,
            'storage_location_id' => $this->storageLocation->id,
            'transaction_category_id' => $this->category->id,
            'created_at' => now(),
        ]);

        $topCategories = $this->service->getTopCategoriesByPeriod();
        $weekCategories = $topCategories['week'];

        $this->assertCount(1, $weekCategories);
        $categoryData = $weekCategories[0];

        // Expected total in EGP:
        // $100 USD = 100 * 52 = 5,200 EGP
        // 1000 EGP = 1,000 EGP
        // 2g GOLD24 = 2 * 4,800 = 9,600 EGP
        // Total = 5,200 + 1,000 + 9,600 = 15,800 EGP
        $expectedTotalEgp = (100 * 52) + 1000 + (2 * 4800);

        $this->assertEquals($expectedTotalEgp, $categoryData['total_egp']);
        $this->assertEquals($this->category->name, $categoryData['name']);
    }

    /**
     * Test total calculation with mixed currencies
     */
    public function test_total_calculation_with_currency_conversion()
    {
        // Create transactions in different currencies
        Transaction::create([
            'user_id' => $this->user->id,
            'type' => SavingType::USD->value,
            'amount' => 50.0,
            'direction' => TransactionDirection::OUT->value,
            'storage_location_id' => $this->storageLocation->id,
            'transaction_category_id' => $this->category->id,
            'created_at' => now(),
        ]);

        Transaction::create([
            'user_id' => $this->user->id,
            'type' => SavingType::EGP->value,
            'amount' => 500.0,
            'direction' => TransactionDirection::OUT->value,
            'storage_location_id' => $this->storageLocation->id,
            'transaction_category_id' => $this->category->id,
            'created_at' => now(),
        ]);

        $totalExpenses = $this->service->getTotalExpensesByPeriod();
        $weekExpenses = $totalExpenses['week'];

        // Expected total in EGP:
        // $50 USD = 50 * 52 = 2,600 EGP
        // 500 EGP = 500 EGP
        // Total = 2,600 + 500 = 3,100 EGP
        $expectedTotal = (50 * 52) + 500;

        $this->assertEquals($expectedTotal, $weekExpenses);
    }

    /**
     * Test that GOLD21 transactions are converted correctly
     */
    public function test_gold21_conversion()
    {
        Transaction::create([
            'user_id' => $this->user->id,
            'type' => SavingType::GOLD21->value,
            'amount' => 5.0, // 5 grams
            'direction' => TransactionDirection::OUT->value,
            'storage_location_id' => $this->storageLocation->id,
            'transaction_category_id' => $this->category->id,
            'created_at' => now(),
        ]);

        $topTransactions = $this->service->getTopTransactionsByPeriod();
        $weekTransaction = $topTransactions['week'];

        $this->assertNotNull($weekTransaction);
        $this->assertEquals('GOLD21', $weekTransaction['type']);
        $this->assertEquals(5.0, $weekTransaction['amount']);
        $this->assertEquals(21000.0, $weekTransaction['amount_egp']); // 5 * 4200
        $this->assertEquals(403.85, $weekTransaction['amount_usd']); // 21000 / 52, rounded to 2 decimal places
    }

    /**
     * Test edge case: transactions with same EGP equivalent
     */
    public function test_same_egp_equivalent_transactions()
    {
        // Create two transactions with same EGP equivalent
        // 1040 EGP transaction
        Transaction::create([
            'user_id' => $this->user->id,
            'type' => SavingType::EGP->value,
            'amount' => 1040.0,
            'direction' => TransactionDirection::OUT->value,
            'storage_location_id' => $this->storageLocation->id,
            'transaction_category_id' => $this->category->id,
            'created_at' => now()->subMinute(), // Created first
        ]);

        // $20 USD transaction (20 * 52 = 1040 EGP)
        Transaction::create([
            'user_id' => $this->user->id,
            'type' => SavingType::USD->value,
            'amount' => 20.0,
            'direction' => TransactionDirection::OUT->value,
            'storage_location_id' => $this->storageLocation->id,
            'transaction_category_id' => $this->category->id,
            'created_at' => now(), // Created second
        ]);

        $topTransactions = $this->service->getTopTransactionsByPeriod();
        $weekTransaction = $topTransactions['week'];

        $this->assertNotNull($weekTransaction);
        // When amounts are equal, the first transaction found should be returned
        // (since we use > not >= in the comparison)
        $this->assertEquals('EGP', $weekTransaction['type']);
        $this->assertEquals(1040.0, $weekTransaction['amount']);
        $this->assertEquals(1040.0, $weekTransaction['amount_egp']);
    }

    /**
     * Test that no transactions returns null
     */
    public function test_no_transactions_returns_null()
    {
        $topTransactions = $this->service->getTopTransactionsByPeriod();

        $this->assertNull($topTransactions['week']);
        $this->assertNull($topTransactions['month']);
        $this->assertNull($topTransactions['quarter']);
        $this->assertNull($topTransactions['year']);
    }

    /**
     * Test income transactions are excluded from expense calculations
     */
    public function test_income_transactions_excluded_from_expenses()
    {
        // Create an income transaction
        Transaction::create([
            'user_id' => $this->user->id,
            'type' => SavingType::USD->value,
            'amount' => 1000.0,
            'direction' => TransactionDirection::IN->value,
            'storage_location_id' => $this->storageLocation->id,
            'transaction_category_id' => $this->category->id,
            'created_at' => now(),
        ]);

        // Create an expense transaction
        Transaction::create([
            'user_id' => $this->user->id,
            'type' => SavingType::EGP->value,
            'amount' => 100.0,
            'direction' => TransactionDirection::OUT->value,
            'storage_location_id' => $this->storageLocation->id,
            'transaction_category_id' => $this->category->id,
            'created_at' => now(),
        ]);

        $topTransactions = $this->service->getTopTransactionsByPeriod();
        $totalExpenses = $this->service->getTotalExpensesByPeriod();

        // Top transaction should be the expense (income excluded)
        $this->assertEquals('EGP', $topTransactions['week']['type']);
        $this->assertEquals(100.0, $topTransactions['week']['amount']);

        // Total expenses should only include the expense transaction
        $this->assertEquals(100.0, $totalExpenses['week']);
    }
}
