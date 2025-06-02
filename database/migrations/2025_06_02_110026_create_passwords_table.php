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
            $table->string('password');
            $table->string('url')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('folder_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedBigInteger('copied')->default(0);
            $table->timestamp('last_used_at')->nullable();
            $table->date('expires_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'name']);
            $table->index(['user_id', 'name']);
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
