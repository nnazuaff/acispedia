<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Facades\Schema;
use Throwable;

class LastLoginRecorder
{
    public static function record(User $user): void
    {
        try {
            static $hasColumns = null;
            if ($hasColumns === null) {
                try {
                    $hasColumns = Schema::hasColumns('users', ['last_login_at', 'last_activity_at']);
                } catch (Throwable) {
                    $hasColumns = false;
                }
            }

            if (! $hasColumns) {
                return;
            }

            $now = now();

            $user->forceFill([
                'last_login_at' => $now,
                'last_activity_at' => $now,
            ])->save();

            \App\Support\UserActivity::log($user, 'login', 'User login');
        } catch (Throwable) {
            // Best-effort only.
        }
    }
}
