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
        Schema::create('exchange_rates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('currency_code', 3); // USD, EGP, etc.
            $table->decimal('rate', 15, 8); // Exchange rate with high precision
            $table->string('source')->default('api'); // api, manual, fallback
            $table->timestamp('fetched_at'); // When this rate was fetched
            $table->timestamp('expires_at')->nullable(); // When this rate expires
            $table->boolean('is_active')->default(true); // Current active rate
            $table->json('api_response')->nullable(); // Full API response for debugging
            $table->timestamps();

            // Indexes for performance
            $table->index(['user_id', 'currency_code', 'is_active']);
            $table->index(['user_id', 'currency_code', 'fetched_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exchange_rates');
    }
};
