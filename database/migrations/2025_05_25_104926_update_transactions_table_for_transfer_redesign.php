<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Remove old transfer fields
            $table->dropColumn(['from_type', 'from_amount']);

            // Add new transfer fields
            $table->foreignId('source_location_id')->nullable()->constrained('savings_storage_locations')->cascadeOnDelete();
            $table->foreignId('destination_location_id')->nullable()->constrained('savings_storage_locations')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Restore old transfer fields
            $table->string('from_type')->nullable();
            $table->decimal('from_amount', 15, 2)->nullable();

            // Remove new transfer fields
            $table->dropForeign(['source_location_id']);
            $table->dropForeign(['destination_location_id']);
            $table->dropColumn(['source_location_id', 'destination_location_id']);
        });
    }
};
