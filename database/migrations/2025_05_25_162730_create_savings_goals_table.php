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
        Schema::create('savings_goals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->decimal('target_amount_usd', 15, 2); // Always stored in USD
            $table->enum('severity', ['low', 'medium', 'high', 'very-high'])->default('medium');
            $table->date('target_date')->nullable();
            $table->boolean('is_achieved')->default(false);
            $table->timestamp('achieved_at')->nullable();
            $table->boolean('success_notification_dismissed')->default(false);
            $table->timestamp('success_notification_shown_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'is_achieved']);
            $table->index(['user_id', 'target_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('savings_goals');
    }
};
