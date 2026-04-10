<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financial_reports', function (Blueprint $table) {
            $table->id();
            $table->date('report_date')->index();

            $table->unsignedBigInteger('vendor_medanpedia')->default(0);
            $table->unsignedBigInteger('vendor_serpul_h2h')->default(0);
            $table->unsignedBigInteger('vendor_serpul_manual')->default(0);
            $table->unsignedBigInteger('vendor_serpul_voucher')->default(0);
            $table->unsignedBigInteger('vendor_pt_yus')->default(0);
            $table->unsignedBigInteger('vendor_digiflazz')->default(0);
            $table->unsignedBigInteger('vendor_acispay')->default(0);

            $table->unsignedBigInteger('bank_bri')->default(0);
            $table->unsignedBigInteger('bank_bni')->default(0);
            $table->unsignedBigInteger('bank_bca')->default(0);

            $table->unsignedBigInteger('wallet_ovo')->default(0);
            $table->unsignedBigInteger('wallet_dana')->default(0);
            $table->unsignedBigInteger('wallet_gojek')->default(0);
            $table->unsignedBigInteger('wallet_other')->default(0);

            $table->unsignedBigInteger('cash_on_hand')->default(0);
            $table->unsignedBigInteger('total_receivables')->default(0);

            $table->unsignedBigInteger('total_financial')->default(0);
            $table->unsignedBigInteger('customer_balance')->default(0);
            $table->bigInteger('difference_amount')->default(0);

            $table->string('updated_by')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_reports');
    }
};
