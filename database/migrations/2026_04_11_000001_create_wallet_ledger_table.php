<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('wallet_ledger')) {
            return;
        }

        Schema::create('wallet_ledger', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->index()->constrained()->cascadeOnDelete();
            $table->string('direction', 16); // credit | debit
            $table->unsignedBigInteger('amount');
            $table->unsignedBigInteger('balance_before');
            $table->unsignedBigInteger('balance_after');

            $table->string('source_type', 32)->default('unknown');
            $table->string('source_id', 64)->nullable();
            $table->string('description', 255)->default('');
            $table->json('meta')->nullable();

            $table->timestamp('event_at')->useCurrent();
            $table->timestamps();

            $table->index(['user_id', 'event_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallet_ledger');
    }
};
