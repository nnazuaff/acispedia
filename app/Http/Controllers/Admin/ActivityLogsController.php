<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogsController extends Controller
{
    public function index(Request $request): Response
    {
        $q = trim((string) $request->query('q', ''));
        $action = trim((string) $request->query('action', ''));

        $perPage = (int) $request->query('per_page', 20);
        if ($perPage < 1) {
            $perPage = 20;
        }
        if ($perPage > 200) {
            $perPage = 200;
        }

        $query = AdminActivityLog::query()->with(['adminUser:id,name,email']);

        if ($q !== '') {
            $query->where(function ($sq) use ($q) {
                $sq->where('message', 'like', "%{$q}%")
                    ->orWhere('entity_type', 'like', "%{$q}%")
                    ->orWhere('entity_id', 'like', "%{$q}%")
                    ->orWhereHas('adminUser', function ($uq) use ($q) {
                        $uq->where('name', 'like', "%{$q}%")
                            ->orWhere('email', 'like', "%{$q}%");
                    });
            });
        }

        if ($action !== '') {
            $query->where('action', $action);
        }

        $paginator = $query->orderByDesc('id')->paginate($perPage)->withQueryString();

        $rows = $paginator->getCollection()->map(function (AdminActivityLog $log) {
            return [
                'id' => (int) $log->id,
                'action' => (string) ($log->action ?? ''),
                'entity_type' => $log->entity_type !== null ? (string) $log->entity_type : null,
                'entity_id' => $log->entity_id !== null ? (string) $log->entity_id : null,
                'message' => (string) ($log->message ?? ''),
                'ip' => $log->ip !== null ? (string) $log->ip : null,
                'created_at_wib' => $log->created_at?->setTimezone('Asia/Jakarta')->format('Y-m-d H:i'),
                'admin_user' => [
                    'id' => (int) ($log->adminUser?->id ?? 0),
                    'name' => $log->adminUser?->name,
                    'email' => $log->adminUser?->email,
                ],
            ];
        })->all();

        $paginator->setCollection(collect($rows));

        $knownActions = AdminActivityLog::query()->select('action')->distinct()->orderBy('action')->pluck('action')->values()->all();

        return Inertia::render('admin/activity-logs', [
            'logs' => $paginator,
            'filters' => [
                'q' => $q,
                'action' => $action,
                'per_page' => $perPage,
            ],
            'known_actions' => $knownActions,
        ]);
    }
}
