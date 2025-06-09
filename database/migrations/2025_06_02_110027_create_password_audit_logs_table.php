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
            $table->foreignId('password_id')->nullable()->constrained('passwords')->onDelete('set null');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('action', 50); // created, updated, deleted, copied, viewed, etc.
            $table->string('ip_address', 45)->nullable(); // IPv6 compatible
            $table->string('context', 20)->default('web'); // web, api, cli, etc.
            $table->json('metadata')->nullable(); // Additional context data
            $table->timestamp('created_at');

            // Basic indexes for performance
            $table->index(['password_id', 'created_at']);
            $table->index(['user_id', 'created_at']);
            $table->index(['action', 'created_at']);
            $table->index(['user_id', 'action']);
            $table->index(['password_id', 'action']);

            // Optimized composite indexes for complex filtering scenarios
            $table->index(['user_id', 'password_id', 'action', 'created_at'], 'idx_audit_user_password_action_created');
            $table->index(['user_id', 'action', 'created_at', 'id'], 'idx_audit_user_action_created_id');
            $table->index(['password_id', 'action', 'created_at', 'user_id'], 'idx_audit_password_action_created_user');
            $table->index(['user_id', 'context', 'created_at'], 'idx_audit_user_context_created');
            $table->index(['ip_address', 'user_id', 'created_at'], 'idx_audit_ip_user_created');
            $table->index(['user_id', 'created_at', 'action', 'password_id'], 'idx_audit_user_created_action_password');
            $table->index(['created_at', 'action', 'user_id'], 'idx_audit_created_action_user');
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
