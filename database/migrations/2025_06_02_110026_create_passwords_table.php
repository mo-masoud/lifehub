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
            $table->text('password');
            $table->text('encrypted_key')->nullable();
            $table->unsignedTinyInteger('key_version')->nullable();
            $table->string('url')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('folder_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedBigInteger('copied')->default(0);
            $table->timestamp('last_used_at')->nullable();
            $table->date('expires_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'name']);
            $table->index(['user_id', 'name']);
            $table->index(['user_id', 'type', 'created_at']);
            $table->index(['user_id', 'folder_id', 'last_used_at']);
            $table->index(['user_id', 'expires_at']);
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
