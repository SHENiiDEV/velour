<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Откуда приехал товар — чтобы повторный импорт обновлял, а не плодил.
            $table->string('source')->nullable()->after('status');
            $table->string('source_id')->nullable()->after('source');

            $table->string('brand')->nullable()->after('source_id');
            $table->string('gtin')->nullable()->after('brand');   // UPC / EAN / ISBN
            $table->string('mpn')->nullable()->after('gtin');     // артикул производителя

            $table->unique(['source', 'source_id']);
            $table->index('brand');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropUnique(['source', 'source_id']);
            $table->dropIndex(['brand']);
            $table->dropColumn(['source', 'source_id', 'brand', 'gtin', 'mpn']);
        });
    }
};
