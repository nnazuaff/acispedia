<?php

namespace App\Support;

use App\Models\AdminActivityLog;
use Illuminate\Http\Request;
use Throwable;

final class AdminActivity
{
    /**
     * @param  array<string, mixed>|null  $meta
     */
    public static function log(Request $request, string $action, ?string $entityType, ?string $entityId, string $message, ?array $meta = null): void
    {
        try {
            AdminActivityLog::query()->create([
                'admin_user_id' => $request->user()?->id,
                'action' => $action,
                'entity_type' => $entityType,
                'entity_id' => $entityId,
                'message' => $message,
                'meta' => $meta,
                'ip' => $request->ip(),
                'user_agent' => substr((string) $request->userAgent(), 0, 255),
            ]);
        } catch (Throwable) {
            // Best-effort only.
        }
    }
}
