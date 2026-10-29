<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Billing descriptor сменился с «VLR RETAIL» на «VELOUR» (как в анкете эквайера TPF).
 * Строка хранится в заказе снимком и выводится в письмах и PDF-инвойсе — обновляем
 * уже созданные заказы. Оплат через провайдера ещё не было, расхождения с выпиской нет.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('orders')
            ->where('statement_descriptor', 'VLR RETAIL')
            ->update(['statement_descriptor' => config('velour.statement_descriptor', 'VELOUR')]);
    }

    public function down(): void
    {
        // Необратимо по смыслу: прежняя строка не соответствует анкете провайдера.
    }
};
