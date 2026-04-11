<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\UserActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserActivityLogsController extends Controller
{
    public function index(Request $request): Response
    {
        $perPage = (int) $request->query('per_page', 25);
        if (!in_array($perPage, [25, 50, 100, 200], true)) {
            $perPage = 25;
        }

        $paginator = UserActivityLog::query()
            ->with(['user:id,name,email'])
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();

        $rows = $paginator->getCollection()->map(function (UserActivityLog $log) {
            return [
                'id' => (int) $log->id,
                'action' => (string) ($log->action ?? ''),
                'message' => (string) ($log->message ?? ''),
                'ip' => $log->ip !== null ? (string) $log->ip : null,
                'created_at_wib' => $log->created_at?->setTimezone('Asia/Jakarta')->format('Y-m-d H:i'),
                'user' => [
                    'id' => (int) ($log->user?->id ?? 0),
                    'name' => $log->user?->name,
                    'email' => $log->user?->email,
                ],
            ];
        })->all();

        $paginator->setCollection(collect($rows));

        return Inertia::render('admin/user-activity-logs', [
            'logs' => $paginator,
            'filters' => [
                'per_page' => $perPage,
            ],
        ]);
    }
}
