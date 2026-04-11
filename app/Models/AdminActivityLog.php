<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $admin_user_id
 * @property string $action
 * @property string|null $entity_type
 * @property string|null $entity_id
 * @property string $message
 * @property array|null $meta
 * @property string|null $ip
 * @property string|null $user_agent
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read User|null $adminUser
 */
class AdminActivityLog extends Model
{
    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'admin_user_id',
        'action',
        'entity_type',
        'entity_id',
        'message',
        'meta',
        'ip',
        'user_agent',
    ];

    /**
     * @return BelongsTo<User, AdminActivityLog>
     */
    public function adminUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_user_id');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'admin_user_id' => 'integer',
            'meta' => 'array',
        ];
    }
}
