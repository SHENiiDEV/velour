<?php

namespace App\Models;

use App\Enums\MediaKind;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Facades\Storage;

class Media extends Model
{
    /** @use HasFactory<\Database\Factories\MediaFactory> */
    use HasFactory;

    protected $table = 'media';

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'kind' => MediaKind::class,
            'is_discreet_safe' => 'boolean',
            'meta' => 'array',
        ];
    }

    public function mediable(): MorphTo
    {
        return $this->morphTo();
    }

    public function url(): string
    {
        // External URLs or already absolute paths are returned as is.
        if (str_starts_with($this->path, 'http://') || str_starts_with($this->path, 'https://') || str_starts_with($this->path, '/')) {
            return $this->path;
        }

        return '/storage/' . ltrim($this->path, '/');
    }
}
