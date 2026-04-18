<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property string $name
 * @property string $phone
 * @property string $category
 * @property string $message
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
#[Fillable(['user_id', 'name', 'phone', 'category', 'message', 'status'])]
class Suggestion extends Model
{
	/**
	 * @return BelongsTo<User, Suggestion>
	 */
	public function user(): BelongsTo
	{
		return $this->belongsTo(User::class);
	}
}
