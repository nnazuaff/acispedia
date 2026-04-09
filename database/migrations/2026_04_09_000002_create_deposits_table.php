<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deposits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->unsignedInteger('amount');
            $table->unsignedInteger('final_amount');

            $table->string('payment_method', 20)->default('tripay');

            $table->string('status', 20)->default('pending'); // pending|success|failed|expired

            // Tripay fields
            $table->string('tripay_merchant_ref', 64)->nullable();
            $table->string('tripay_reference', 64)->nullable()->index();
            $table->string('tripay_method', 32)->nullable();
            $table->string('tripay_pay_code', 64)->nullable();
            $table->string('tripay_checkout_url', 255)->nullable();
            $table->string('tripay_status', 32)->nullable();

            $table->timestamp('expired_at')->nullable()->index();
            $table->timestamp('processed_at')->nullable();

            $table->json('provider_payload')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deposits');
    }
};
