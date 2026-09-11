<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('tagline')->nullable();
            $table->text('description')->nullable();
            $table->unsignedSmallInteger('position')->default(0);
            $table->boolean('is_visible')->default(true);
            $table->timestamps();

            $table->index(['is_visible', 'position']);
        });

        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('tagline')->nullable();          // одна строка «намёка»
            $table->text('description')->nullable();        // markdown
            $table->text('story')->nullable();              // редакционный текст, тихий регистр
            $table->text('care')->nullable();               // уход и совместимость смазок

            // Честность про материалы — часть бренда, не мелкий шрифт.
            $table->json('materials')->nullable();          // ["Медицинский силикон", ...]
            $table->json('attributes')->nullable();         // сенсорные: {"firmness":2,"noise":1,...}

            $table->unsignedInteger('price_cents');         // «от» — витринная цена
            $table->char('currency', 3)->default('EUR');
            $table->string('status')->default('draft');     // ProductStatus
            $table->boolean('is_body_safe')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'published_at']);
            $table->index(['category_id', 'status']);
        });

        Schema::create('variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('sku')->unique();
            $table->string('name');                          // «Оникс · M»
            $table->json('options')->nullable();             // {"color":"onyx","size":"M"}
            $table->unsignedInteger('price_cents')->nullable(); // null → цена товара
            $table->integer('stock')->default(0);
            $table->unsignedInteger('weight_g')->nullable();
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['product_id', 'is_active']);
        });

        /*
        | Словарь сенсорных характеристик. Новый атрибут = новая строка,
        | а не миграция: значения живут в products.attributes (json).
        */
        Schema::create('attribute_definitions', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();                 // firmness, texture, noise…
            $table->string('label');
            $table->string('type')->default('scale');        // AttributeType
            $table->json('scale')->nullable();               // {"min":1,"max":5,"labels":{"1":"мягко","5":"твёрдо"}}
            $table->json('options')->nullable();             // для type=enum
            $table->boolean('is_filterable')->default(true);
            $table->unsignedSmallInteger('position')->default(0);
            $table->timestamps();
        });

        /*
        | Плоский индекс атрибутов для фильтров — синхронизируется ProductObserver.
        | Читаем из json, фильтруем по этой таблице (работает и в MySQL, и в Postgres).
        */
        Schema::create('product_attributes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('key');
            $table->decimal('value_numeric', 8, 2)->nullable();
            $table->string('value_text')->nullable();
            $table->timestamps();

            $table->unique(['product_id', 'key']);
            $table->index(['key', 'value_numeric']);
        });

        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->morphs('mediable');                      // Product / Variant / Category
            $table->string('disk')->default('public');
            $table->string('path');
            $table->string('alt')->nullable();
            $table->string('kind')->default('image');        // MediaKind
            /*
            | Можно ли показывать превью в скрытном режиме без blur
            | (абстрактные кадры — материал, свет — можно; предметный крупный план — нет).
            */
            $table->boolean('is_discreet_safe')->default(false);
            $table->unsignedSmallInteger('position')->default(0);
            $table->json('meta')->nullable();                // {"w":2000,"h":2500,"blurhash":"..."}
            $table->timestamps();

            $table->index(['mediable_type', 'mediable_id', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media');
        Schema::dropIfExists('product_attributes');
        Schema::dropIfExists('attribute_definitions');
        Schema::dropIfExists('variants');
        Schema::dropIfExists('products');
        Schema::dropIfExists('categories');
    }
};
