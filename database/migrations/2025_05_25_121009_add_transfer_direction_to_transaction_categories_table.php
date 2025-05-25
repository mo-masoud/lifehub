<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // For SQLite, we need to recreate the table to modify the enum
        // First, let's check if we're using SQLite
        if (DB::connection()->getDriverName() === 'sqlite') {
            // Backup data
            $categories = DB::table('transaction_categories')->get();

            // Drop the table
            Schema::dropIfExists('transaction_categories');

            // Recreate with the new enum
            Schema::create('transaction_categories', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
                $table->string('name');
                $table->enum('direction', ['in', 'out', 'transfer']);
                $table->timestamps();

                $table->unique(['user_id', 'name', 'direction']);
            });

            // Restore data
            foreach ($categories as $category) {
                DB::table('transaction_categories')->insert((array) $category);
            }
        } else {
            // For other databases, use ALTER TABLE
            Schema::table('transaction_categories', function (Blueprint $table) {
                $table->dropColumn('direction');
            });

            Schema::table('transaction_categories', function (Blueprint $table) {
                $table->enum('direction', ['in', 'out', 'transfer'])->after('name');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::connection()->getDriverName() === 'sqlite') {
            // Backup data
            $categories = DB::table('transaction_categories')->where('direction', '!=', 'transfer')->get();

            // Drop the table
            Schema::dropIfExists('transaction_categories');

            // Recreate with the original enum
            Schema::create('transaction_categories', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
                $table->string('name');
                $table->enum('direction', ['in', 'out']);
                $table->timestamps();

                $table->unique(['user_id', 'name', 'direction']);
            });

            // Restore data (excluding transfer categories)
            foreach ($categories as $category) {
                DB::table('transaction_categories')->insert((array) $category);
            }
        } else {
            Schema::table('transaction_categories', function (Blueprint $table) {
                $table->dropColumn('direction');
            });

            Schema::table('transaction_categories', function (Blueprint $table) {
                $table->enum('direction', ['in', 'out'])->after('name');
            });
        }
    }
};
