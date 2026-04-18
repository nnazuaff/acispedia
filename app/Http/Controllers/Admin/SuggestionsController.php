<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Suggestion;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SuggestionsController extends Controller
{
    public function index(Request $request): Response
    {
        $perPage = (int) $request->query('per_page', 25);
        if (! in_array($perPage, [25, 50, 100, 200], true)) {
            $perPage = 25;
        }

        $paginator = Suggestion::query()
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();

        $rows = $paginator->getCollection()->map(function (Suggestion $row): array {
            return [
                'id' => (int) $row->id,
                'user_id' => (int) $row->user_id,
                'name' => (string) ($row->name ?? ''),
                'phone' => (string) ($row->phone ?? ''),
                'category' => (string) ($row->category ?? ''),
                'message' => (string) ($row->message ?? ''),
                'created_at_wib' => $row->created_at?->setTimezone('Asia/Jakarta')->format('Y-m-d H:i'),
            ];
        })->all();

        $paginator->setCollection(collect($rows));

        return Inertia::render('admin/kotak-saran', [
            'suggestions' => $paginator,
            'filters' => [
                'per_page' => $perPage,
            ],
        ]);
    }
}
