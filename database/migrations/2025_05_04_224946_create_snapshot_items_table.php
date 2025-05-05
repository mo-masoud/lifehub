<?php

use App\Enums\SavingType;
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
        Schema::create('snapshot_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('snapshot_id')->constrained()->cascadeOnDelete();
            $table->enum('type', SavingType::values());
            $table->foreignId('storage_location_id')->constrained('savings_storage_locations')->cascadeOnDelete();
            $table->decimal('amount', 15, 2);
            $table->decimal('rate', 15, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('snapshot_items');
    }
};
