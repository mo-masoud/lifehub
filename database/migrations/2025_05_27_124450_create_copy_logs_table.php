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
        Schema::create('copy_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->morphs('copyable'); // Creates copyable_id and copyable_type columns
            $table->string('field'); // password, username, prompt
            $table->timestamp('copied_at');
            $table->timestamps();

            $table->index(['user_id', 'copyable_type', 'copyable_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('copy_logs');
    }
};
