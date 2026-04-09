<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('orders')) {
            return;
        }

        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->unsignedBigInteger('service_id');
            $table->string('service_name');

            // Provider price is per 1000 units. Store money as integer Rupiah.
            $table->unsignedBigInteger('base_price')->default(0);
            $table->unsignedBigInteger('price_per_1000')->default(0);
            $table->unsignedBigInteger('total_price');

            $table->text('target');
            $table->mediumText('comments')->nullable();
            $table->unsignedInteger('quantity');

            $table->string('provider_order_id')->nullable()->index();
            $table->string('status')->default('Pending')->index();

            $table->unsignedBigInteger('start_count')->nullable();
            $table->unsignedBigInteger('remains')->nullable();
            $table->unsignedBigInteger('charge')->nullable();

            $table->timestamp('last_status_check')->nullable()->index();
            $table->unsignedInteger('status_check_attempts')->default(0);

            $table->timestamps();

            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
