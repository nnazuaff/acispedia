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
        $q = trim((string) $request->query('q', ''));
        $userId = (int) $request->integer('user_id', 0);

        $perPage = (int) $request->query('per_page', 25);
        if (!in_array($perPage, [25, 50, 100, 200], true)) {
            $perPage = 25;
        }

        $query = UserActivityLog::query()
            ->with(['user:id,name,email'])
            ->orderByDesc('id');

        if ($userId > 0) {
            $query->where('user_id', $userId);
        }

        if ($q !== '') {
            $query->where(function ($sub) use ($q) {
                $sub->where('action', 'like', "%{$q}%")
                    ->orWhere('message', 'like', "%{$q}%")
                    ->orWhere('ip', 'like', "%{$q}%")
                    ->orWhereHas('user', function ($uq) use ($q) {
                        $uq->where('name', 'like', "%{$q}%")
                            ->orWhere('email', 'like', "%{$q}%")
                            ->orWhere('id', $q);
                    });
            });
        }

        $paginator = $query->paginate($perPage)->withQueryString();

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
                'q' => $q,
                'user_id' => $userId > 0 ? $userId : null,
                'per_page' => $perPage,
            ],
        ]);
    }
}
