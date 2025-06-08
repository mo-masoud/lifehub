<?php

use App\Enums\PasswordTypes;
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
        Schema::create('passwords', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', PasswordTypes::values())->default('normal');
            $table->string('name');
            $table->string('username');
            $table->longText('password'); // Optimized for large encrypted payloads
            $table->text('encrypted_key')->nullable();
            $table->unsignedTinyInteger('key_version')->nullable();
            $table->string('url')->nullable();
            $table->text('notes')->nullable(); // Optimized for larger text content
            $table->foreignId('folder_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedBigInteger('copied')->default(0);
            $table->timestamp('last_used_at')->nullable();
            $table->date('expires_at')->nullable();
            $table->timestamps();

            // Unique constraints
            $table->unique(['user_id', 'name']);

            // Basic indexes (existing)
            $table->index(['user_id', 'name']);
            $table->index(['user_id', 'type', 'created_at']);
            $table->index(['user_id', 'folder_id', 'last_used_at']);
            $table->index(['user_id', 'expires_at']);

            // Optimized composite indexes for common query patterns
            $table->index(['user_id', 'type', 'last_used_at'], 'idx_passwords_user_type_last_used');
            $table->index(['user_id', 'folder_id', 'created_at'], 'idx_passwords_user_folder_created');
            $table->index(['user_id', 'expires_at', 'created_at'], 'idx_passwords_user_expires_created');
            $table->index(['user_id', 'name', 'username'], 'idx_passwords_user_name_username');
            $table->index(['user_id', 'type', 'name'], 'idx_passwords_user_type_name');
            $table->index(['user_id', 'last_used_at', 'id'], 'idx_passwords_user_last_used_desc');
            $table->index(['user_id', 'copied', 'last_used_at'], 'idx_passwords_user_copied_usage');
            $table->index(['folder_id', 'user_id', 'name'], 'idx_passwords_folder_user_name');
            $table->index(['key_version', 'user_id'], 'idx_passwords_key_version_user');

            // Data integrity constraints would be added here in production MySQL
            // Skipped for SQLite compatibility in development
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('passwords');
    }
};
