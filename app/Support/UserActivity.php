<?php

namespace App\Support;

use App\Models\User;
use App\Models\UserActivityLog;
use Throwable;

final class UserActivity
{
    /**
     * @param  array<string, mixed>|null  $meta
     */
    public static function log(User $user, string $action, string $message, ?array $meta = null): void
    {
        try {
            $request = request();

            UserActivityLog::query()->create([
                'user_id' => (int) $user->id,
                'action' => $action,
                'message' => $message,
                'meta' => $meta,
                'ip' => method_exists($request, 'ip') ? $request->ip() : null,
                'user_agent' => method_exists($request, 'userAgent') ? substr((string) $request->userAgent(), 0, 255) : null,
            ]);
        } catch (Throwable) {
            // Best-effort only.
        }
    }
}
