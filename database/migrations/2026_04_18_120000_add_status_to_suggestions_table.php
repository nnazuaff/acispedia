<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('suggestions', function (Blueprint $table) {
            $table->string('status', 20)->default('belum_selesai')->after('message');
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::table('suggestions', function (Blueprint $table) {
            $table->dropIndex(['status', 'created_at']);
            $table->dropColumn('status');
        });
    }
};
