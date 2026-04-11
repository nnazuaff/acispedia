<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $key
 * @property string|null $value
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
class AppSetting extends Model
{
    protected $table = 'app_settings';

    protected $fillable = [
        'key',
        'value',
    ];

    public static function getString(string $key, ?string $default = null): ?string
    {
        $row = static::query()->where('key', $key)->first();
        if (! $row) {
            return $default;
        }

        $value = $row->value;
        return $value !== null ? (string) $value : $default;
    }

    public static function getInt(string $key, int $default = 0): int
    {
        $raw = static::getString($key, null);
        if ($raw === null) {
            return $default;
        }

        $clean = preg_replace('/[^0-9\-]/', '', $raw);
        if ($clean === null || trim($clean) === '') {
            return $default;
        }

        $value = (int) $clean;
        if ($value < 0) {
            $value = 0;
        }

        return $value;
    }

    public static function putString(string $key, ?string $value): void
    {
        static::query()->updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );
    }

    public static function putInt(string $key, int $value): void
    {
        if ($value < 0) {
            $value = 0;
        }

        static::putString($key, (string) $value);
    }
}
