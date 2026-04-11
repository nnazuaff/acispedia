<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserActivityLog extends Model
{
    protected $fillable = [
        'user_id',
        'action',
        'message',
        'meta',
        'ip',
        'user_agent',
    ];

    protected $casts = [
        'meta' => 'array',
    ];
}
