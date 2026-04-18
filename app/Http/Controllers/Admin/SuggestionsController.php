<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Suggestion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Support\WibDateRange;

class SuggestionsController extends Controller
{
    public function index(Request $request): Response
    {
        $perPage = (int) $request->query('per_page', 25);
        if (! in_array($perPage, [25, 50, 100, 200], true)) {
            $perPage = 25;
        }

        $today = WibDateRange::todayDateString();
        $date = trim((string) $request->query('date', $today));
        $id = (int) $request->query('id', 0);
        $user = trim((string) $request->query('user', ''));
        $category = trim((string) $request->query('category', ''));
        $status = trim((string) $request->query('status', ''));

        if (! in_array($category, ['', 'saran', 'keluhan', 'lainnya'], true)) {
            $category = '';
        }

        if (! in_array($status, ['', 'belum_selesai', 'selesai'], true)) {
            $status = '';
        }

        $range = WibDateRange::resolve($date, $date);
        $startUtc = $range['start_utc'];
        $endUtc = $range['end_utc'];

        $paginator = Suggestion::query()
            ->with(['user:id,name,email'])
            ->whereBetween('created_at', [$startUtc, $endUtc])
            ->when($id > 0, fn ($q) => $q->where('id', $id))
            ->when($category !== '', fn ($q) => $q->where('category', $category))
            ->when($status !== '', fn ($q) => $q->where('status', $status))
            ->when($user !== '', function ($q) use ($user) {
                $needle = '%'.$user.'%';

                $q->where(function ($qq) use ($needle) {
                    $qq->where('name', 'like', $needle)
                        ->orWhereHas('user', function ($u) use ($needle) {
                            $u->where('name', 'like', $needle)
                                ->orWhere('email', 'like', $needle);
                        });
                });
            })
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();

        $rows = $paginator->getCollection()->map(function (Suggestion $row): array {
            return [
                'id' => (int) $row->id,
                'user_id' => (int) $row->user_id,
                'user_name' => (string) ($row->user?->name ?? ''),
                'user_email' => (string) ($row->user?->email ?? ''),
                'name' => (string) ($row->name ?? ''),
                'phone' => (string) ($row->phone ?? ''),
                'category' => (string) ($row->category ?? ''),
                'message' => (string) ($row->message ?? ''),
                'status' => (string) ($row->status ?? 'belum_selesai'),
                'created_at_wib' => $row->created_at?->setTimezone('Asia/Jakarta')->format('Y-m-d H:i'),
            ];
        })->all();

        $paginator->setCollection(collect($rows));

        return Inertia::render('admin/kotak-saran', [
            'suggestions' => $paginator,
            'filters' => [
                'per_page' => $perPage,
                'date' => $range['date_from'],
                'id' => $id > 0 ? $id : null,
                'user' => $user !== '' ? $user : null,
                'category' => $category !== '' ? $category : null,
                'status' => $status !== '' ? $status : null,
            ],
        ]);
    }

    public function markDone(Suggestion $suggestion): RedirectResponse
    {
        if ($suggestion->status !== 'selesai') {
            $suggestion->update(['status' => 'selesai']);
        }

        return back();
    }
}
