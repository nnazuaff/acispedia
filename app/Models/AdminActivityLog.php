<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
