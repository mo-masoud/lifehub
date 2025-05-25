<?php

// Quick demonstration script to show currency conversion fix in action
// This script creates test data and shows the corrected behavior

require_once __DIR__ . '/vendor/autoload.php';

use App\Models\User;
use App\Models\Transaction;
use App\Models\TransactionCategory;
use App\Models\SavingsStorageLocation;
use App\Models\UserSetting;
use App\Services\DashboardStatsService;
use App\Enums\TransactionDirection;
use App\Enums\SavingType;
use Illuminate\Support\Facades\Auth;

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Foundation\Console\Kernel')->bootstrap();

echo "=== Currency Conversion Bug Fix Demonstration ===\n\n";

// Find a user or create one for testing
$user = User::first();
if (!$user) {
    echo "No users found. Please run database seeders first.\n";
    exit(1);
}

Auth::login($user);

// Set conversion rates for demonstration
UserSetting::set($user, 'usd_rate_fallback', 52.0); // 1 USD = 52 EGP
UserSetting::set($user, 'gold24_rate_fallback', 4800.0);
UserSetting::set($user, 'gold21_rate_fallback', 4200.0);

echo "Conversion rates set:\n";
echo "- USD: 52 EGP per USD\n";
echo "- GOLD24: 4800 EGP per gram\n";
echo "- GOLD21: 4200 EGP per gram\n\n";

// Get or create storage location and category
$storageLocation = SavingsStorageLocation::where('user_id', $user->id)->first()
    ?? SavingsStorageLocation::create(['user_id' => $user->id, 'name' => 'Demo Wallet']);

$category = TransactionCategory::where('user_id', $user->id)->where('direction', 'out')->first()
    ?? TransactionCategory::create(['user_id' => $user->id, 'name' => 'Demo Category', 'direction' => 'out']);

// Clear previous demo transactions
Transaction::where('user_id', $user->id)
    ->where('notes', 'LIKE', 'DEMO:%')
    ->delete();

echo "Creating test transactions:\n";

// Create the problematic scenario: $200 USD vs 1000 EGP
$usdTransaction = Transaction::create([
    'user_id' => $user->id,
    'type' => SavingType::USD->value,
    'amount' => 200.0,
    'direction' => TransactionDirection::OUT->value,
    'storage_location_id' => $storageLocation->id,
    'transaction_category_id' => $category->id,
    'notes' => 'DEMO: $200 USD transaction',
    'created_at' => now(),
]);

$egpTransaction = Transaction::create([
    'user_id' => $user->id,
    'type' => SavingType::EGP->value,
    'amount' => 1000.0,
    'direction' => TransactionDirection::OUT->value,
    'storage_location_id' => $storageLocation->id,
    'transaction_category_id' => $category->id,
    'notes' => 'DEMO: 1000 EGP transaction',
    'created_at' => now(),
]);

echo "1. USD Transaction: $200 USD\n";
echo "2. EGP Transaction: 1000 EGP\n\n";

// Test the service
$service = new DashboardStatsService();
$topTransactions = $service->getTopTransactionsByPeriod();
$weekTransaction = $topTransactions['week'];

echo "=== RESULTS (Fixed Behavior) ===\n";
echo "Top transaction for this week:\n";

if ($weekTransaction) {
    echo "- Type: {$weekTransaction['type']}\n";
    echo "- Original Amount: {$weekTransaction['amount']}\n";
    echo "- Amount in EGP: {$weekTransaction['amount_egp']}\n";
    echo "- Amount in USD: {$weekTransaction['amount_usd']}\n\n";

    if ($weekTransaction['type'] === 'USD') {
        echo "✅ CORRECT: USD transaction ranks higher because:\n";
        echo "   $200 USD × 52 EGP/USD = 10,400 EGP > 1000 EGP\n\n";
    } else {
        echo "❌ ERROR: EGP transaction incorrectly ranks higher\n\n";
    }
} else {
    echo "No transactions found\n\n";
}

// Test category aggregation
$topCategories = $service->getTopCategoriesByPeriod();
$weekCategories = $topCategories['week'];

echo "Category aggregation test:\n";
if (!empty($weekCategories)) {
    $categoryData = $weekCategories[0];
    $expectedTotal = (200 * 52) + 1000; // USD converted + EGP

    echo "- Category: {$categoryData['name']}\n";
    echo "- Total EGP: {$categoryData['total_egp']}\n";
    echo "- Expected: {$expectedTotal} EGP\n";

    if (abs($categoryData['total_egp'] - $expectedTotal) < 0.01) {
        echo "✅ CORRECT: Category aggregation properly converts currencies\n\n";
    } else {
        echo "❌ ERROR: Category aggregation has conversion issues\n\n";
    }
}

// Test total calculation
$totalExpenses = $service->getTotalExpensesByPeriod();
$weekExpenses = $totalExpenses['week'];
$expectedWeekTotal = (200 * 52) + 1000;

echo "Total expenses calculation:\n";
echo "- Week Total: {$weekExpenses} EGP\n";
echo "- Expected: {$expectedWeekTotal} EGP\n";

if (abs($weekExpenses - $expectedWeekTotal) < 0.01) {
    echo "✅ CORRECT: Total calculation properly converts currencies\n\n";
} else {
    echo "❌ ERROR: Total calculation has conversion issues\n\n";
}

echo "=== Summary ===\n";
echo "The currency conversion bug has been fixed in DashboardStatsService.\n";
echo "All methods now properly convert transaction amounts to EGP before:\n";
echo "- Finding top transactions (getTopTransactionForPeriod)\n";
echo "- Aggregating category totals (getTopCategoriesForPeriod)\n";
echo "- Calculating period totals (getTotalForPeriod)\n\n";

echo "This ensures accurate comparisons and calculations regardless of mixed currency types.\n";

// Clean up demo transactions
Transaction::where('user_id', $user->id)
    ->where('notes', 'LIKE', 'DEMO:%')
    ->delete();

echo "\nDemo completed. Test transactions cleaned up.\n";
