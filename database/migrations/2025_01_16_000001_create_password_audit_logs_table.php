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
        Schema::create('password_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('password_id')->constrained('passwords')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('action', 50); // created, updated, deleted, copied, viewed, etc.
            $table->string('ip_address', 45)->nullable(); // IPv6 compatible
            $table->string('context', 20)->default('web'); // web, api, cli, etc.
            $table->json('metadata')->nullable(); // Additional context data
            $table->timestamp('created_at');

            // Indexes for performance
            $table->index(['password_id', 'created_at']);
            $table->index(['user_id', 'created_at']);
            $table->index(['action', 'created_at']);
            $table->index(['user_id', 'action']);
            $table->index(['password_id', 'action']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('password_audit_logs');
    }
};
