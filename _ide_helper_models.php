<?php

// @formatter:off
// phpcs:ignoreFile
/**
 * A helper file for your Eloquent Models
 * Copy the phpDocs from this file to the correct Model,
 * And remove them from this file, to prevent double declarations.
 *
 * @author Barry vd. Heuvel <barryvdh@gmail.com>
 */


namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property int $user_id
 * @property string $currency_code
 * @property numeric $rate
 * @property string $source
 * @property \Illuminate\Support\Carbon $fetched_at
 * @property \Illuminate\Support\Carbon|null $expires_at
 * @property bool $is_active
 * @property array<array-key, mixed>|null $api_response
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ExchangeRate newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ExchangeRate newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ExchangeRate query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ExchangeRate whereApiResponse($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ExchangeRate whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ExchangeRate whereCurrencyCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ExchangeRate whereExpiresAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ExchangeRate whereFetchedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ExchangeRate whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ExchangeRate whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ExchangeRate whereRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ExchangeRate whereSource($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ExchangeRate whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ExchangeRate whereUserId($value)
 */
	class ExchangeRate extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property int $user_id
 * @property string $name
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Password> $passwords
 * @property-read int|null $passwords_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SSH> $sshs
 * @property-read int|null $sshs_count
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Folder newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Folder newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Folder query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Folder whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Folder whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Folder whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Folder whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Folder whereUserId($value)
 */
	class Folder extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property int $user_id
 * @property \App\Enums\SavingType $type
 * @property numeric $amount
 * @property int $storage_location_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\SavingsStorageLocation $storageLocation
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InitialSaving newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InitialSaving newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InitialSaving query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InitialSaving whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InitialSaving whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InitialSaving whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InitialSaving whereStorageLocationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InitialSaving whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InitialSaving whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InitialSaving whereUserId($value)
 */
	class InitialSaving extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property int $user_id
 * @property string $name
 * @property string|null $username
 * @property \Illuminate\Support\Carbon|null $last_used_at
 * @property string|null $url
 * @property \Illuminate\Support\Carbon|null $expiry_at
 * @property string $password
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property int|null $folder_id
 * @property-read \App\Models\Folder|null $folder
 * @property-read \App\Models\User $user
 * @method static \Database\Factories\PasswordFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Password newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Password newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Password query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Password whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Password whereExpiryAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Password whereFolderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Password whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Password whereLastUsedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Password whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Password wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Password whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Password whereUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Password whereUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Password whereUsername($value)
 */
	class Password extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property int $user_id
 * @property string $name
 * @property string $username
 * @property string $ip
 * @property string $password
 * @property \Illuminate\Support\Carbon|null $last_used_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property int|null $folder_id
 * @property-read \App\Models\Folder|null $folder
 * @property-read mixed $prompt
 * @property-read \App\Models\User $user
 * @method static \Database\Factories\SSHFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SSH newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SSH newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SSH query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SSH whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SSH whereFolderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SSH whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SSH whereIp($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SSH whereLastUsedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SSH whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SSH wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SSH whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SSH whereUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SSH whereUsername($value)
 */
	class SSH extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property int $user_id
 * @property string $title
 * @property numeric $target_amount_usd
 * @property string $severity
 * @property \Illuminate\Support\Carbon|null $target_date
 * @property bool $is_achieved
 * @property \Illuminate\Support\Carbon|null $achieved_at
 * @property bool $success_notification_dismissed
 * @property \Illuminate\Support\Carbon|null $success_notification_shown_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read mixed $current_amount_egp
 * @property-read mixed $current_amount_usd
 * @property-read mixed $is_overdue
 * @property-read mixed $progress_percentage
 * @property-read mixed $target_amount_egp
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SavingsGoal active()
 * @method static \Database\Factories\SavingsGoalFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SavingsGoal important()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SavingsGoal newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SavingsGoal newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SavingsGoal query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SavingsGoal whereAchievedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SavingsGoal whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SavingsGoal whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SavingsGoal whereIsAchieved($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SavingsGoal whereSeverity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SavingsGoal whereSuccessNotificationDismissed($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SavingsGoal whereSuccessNotificationShownAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SavingsGoal whereTargetAmountUsd($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SavingsGoal whereTargetDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SavingsGoal whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SavingsGoal whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SavingsGoal whereUserId($value)
 */
	class SavingsGoal extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property int|null $user_id
 * @property string $name
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\InitialSaving> $initialSavings
 * @property-read int|null $initial_savings_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SnapshotItem> $latestSnapshotItems
 * @property-read int|null $latest_snapshot_items_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Transaction> $transactions
 * @property-read int|null $transactions_count
 * @property-read \App\Models\User|null $user
 * @method static \Database\Factories\SavingsStorageLocationFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SavingsStorageLocation newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SavingsStorageLocation newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SavingsStorageLocation query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SavingsStorageLocation whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SavingsStorageLocation whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SavingsStorageLocation whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SavingsStorageLocation whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SavingsStorageLocation whereUserId($value)
 */
	class SavingsStorageLocation extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property int $user_id
 * @property string $usd_rate
 * @property string $gold24_price
 * @property string $gold21_price
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read mixed $date
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SnapshotItem> $items
 * @property-read int|null $items_count
 * @property-read mixed $total_egp
 * @property-read mixed $total_usd
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Snapshot newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Snapshot newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Snapshot query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Snapshot whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Snapshot whereGold21Price($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Snapshot whereGold24Price($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Snapshot whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Snapshot whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Snapshot whereUsdRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Snapshot whereUserId($value)
 */
	class Snapshot extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property int $snapshot_id
 * @property string $type
 * @property int $storage_location_id
 * @property string $amount
 * @property string $rate
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Snapshot $snapshot
 * @property-read \App\Models\SavingsStorageLocation $storageLocation
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SnapshotItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SnapshotItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SnapshotItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SnapshotItem whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SnapshotItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SnapshotItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SnapshotItem whereRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SnapshotItem whereSnapshotId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SnapshotItem whereStorageLocationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SnapshotItem whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SnapshotItem whereUpdatedAt($value)
 */
	class SnapshotItem extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property int $user_id
 * @property string $type
 * @property float $amount
 * @property string $direction
 * @property int $storage_location_id
 * @property string|null $notes
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property int|null $transaction_category_id
 * @property float|null $original_amount
 * @property string|null $original_type
 * @property int|null $source_location_id
 * @property int|null $destination_location_id
 * @property-read \App\Models\TransactionCategory|null $category
 * @property-read mixed $date
 * @property-read \App\Models\SavingsStorageLocation|null $destinationLocation
 * @property-read \App\Models\SavingsStorageLocation|null $sourceLocation
 * @property-read \App\Models\SavingsStorageLocation $storageLocation
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction whereDestinationLocationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction whereDirection($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction whereNotes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction whereOriginalAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction whereOriginalType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction whereSourceLocationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction whereStorageLocationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction whereTransactionCategoryId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction whereUserId($value)
 */
	class Transaction extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property int|null $user_id
 * @property string $name
 * @property string $direction
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Transaction> $transactions
 * @property-read int|null $transactions_count
 * @property-read \App\Models\User|null $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionCategory newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionCategory newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionCategory query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionCategory whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionCategory whereDirection($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionCategory whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionCategory whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionCategory whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionCategory whereUserId($value)
 */
	class TransactionCategory extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $name
 * @property string $email
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ExchangeRate> $exchangeRates
 * @property-read int|null $exchange_rates_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Folder> $folders
 * @property-read int|null $folders_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\InitialSaving> $initialSavings
 * @property-read int|null $initial_savings_count
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Password> $passwords
 * @property-read int|null $passwords_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SavingsGoal> $savingsGoals
 * @property-read int|null $savings_goals_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\UserSetting> $settings
 * @property-read int|null $settings_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Snapshot> $snapshots
 * @property-read int|null $snapshots_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SSH> $sshs
 * @property-read int|null $sshs_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Transaction> $transactions
 * @property-read int|null $transactions_count
 * @method static \Database\Factories\UserFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmailVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUpdatedAt($value)
 */
	class User extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property int $user_id
 * @property string $key
 * @property string $value
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserSetting newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserSetting newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserSetting query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserSetting whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserSetting whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserSetting whereKey($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserSetting whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserSetting whereUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserSetting whereValue($value)
 */
	class UserSetting extends \Eloquent {}
}

