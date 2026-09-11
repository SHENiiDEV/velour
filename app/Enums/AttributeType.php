<?php

namespace App\Enums;

/**
 * Тип сенсорной характеристики.
 * scale — шкала 1..5 с подписями («мягко … твёрдо»), enum — набор значений, bool — да/нет.
 */
enum AttributeType: string
{
    case Scale = 'scale';
    case Enum = 'enum';
    case Bool = 'bool';
}
