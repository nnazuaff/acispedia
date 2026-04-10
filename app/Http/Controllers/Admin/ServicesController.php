<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\MedanpediaClient;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class ServicesController extends Controller
{
    public function index(Request $request, MedanpediaClient $medanpedia): Response
    {
        $q = trim((string) $request->query('q', ''));
        $category = trim((string) $request->query('category', ''));

        $perPage = (int) $request->query('per_page', 25);
        if (!in_array($perPage, [25, 50, 100, 200], true)) {
            $perPage = 25;
        }

        $page = (int) $request->query('page', 1);
        if ($page < 1) {
            $page = 1;
        }

        $services = [];
        $error = null;

        try {
            $api = $medanpedia->getServices();

            if (($api['status'] ?? false) && isset($api['data']) && is_array($api['data'])) {
                $services = $api['data'];
            } else {
                $services = [];
                $error = (string) ($api['msg'] ?? 'Gagal mengambil data services dari provider.');
            }
        } catch (Throwable $e) {
            report($e);
            $services = [];
            $error = 'Gagal mengambil data services dari provider.';
        }

        $services = is_array($services) ? $services : [];

        $categories = collect($services)
            ->map(fn ($s) => (string) Arr::get($s, 'category', Arr::get($s, 'kategori', '')))
            ->filter(fn ($c) => $c !== '')
            ->unique()
            ->sort()
            ->values()
            ->all();

        $filtered = array_values(array_filter($services, function ($s) use ($q, $category) {
            $name = (string) Arr::get($s, 'name', Arr::get($s, 'service_name', Arr::get($s, 'title', '')));
            $cat = (string) Arr::get($s, 'category', Arr::get($s, 'kategori', ''));

            if ($category !== '' && $cat !== $category) {
                return false;
            }

            if ($q === '') {
                return true;
            }

            $code = (string) Arr::get($s, 'id', Arr::get($s, 'service', Arr::get($s, 'service_id', Arr::get($s, 'code', ''))));
            $hay = strtolower($name.' '.$cat.' '.$code);

            return str_contains($hay, strtolower($q));
        }));

        $total = count($filtered);
        $offset = ($page - 1) * $perPage;
        $pageItems = array_slice($filtered, $offset, $perPage);

        $rows = array_map(function ($s) {
            $code = (string) Arr::get($s, 'id', Arr::get($s, 'service', Arr::get($s, 'service_id', Arr::get($s, 'code', ''))));
            $name = (string) Arr::get($s, 'name', Arr::get($s, 'service_name', Arr::get($s, 'title', '')));
            $cat = (string) Arr::get($s, 'category', Arr::get($s, 'kategori', ''));
            $price = Arr::get($s, 'price', Arr::get($s, 'rate', 0));

            return [
                'code' => $code,
                'name' => $name,
                'category' => $cat,
                'min' => (int) Arr::get($s, 'min', 0),
                'max' => (int) Arr::get($s, 'max', 0),
                'price' => (int) (is_numeric($price) ? $price : 0),
                'status' => (string) Arr::get($s, 'status', ''),
            ];
        }, $pageItems);

        $lastPage = (int) max(1, (int) ceil($total / $perPage));
        if ($page > $lastPage) {
            $page = $lastPage;
        }

        return Inertia::render('admin/services', [
            'services' => [
                'data' => $rows,
                'meta' => [
                    'total' => $total,
                    'per_page' => $perPage,
                    'current_page' => $page,
                    'last_page' => $lastPage,
                ],
            ],
            'filters' => [
                'q' => $q,
                'category' => $category,
                'per_page' => $perPage,
            ],
            'categories' => $categories,
            'error' => $error,
        ]);
    }
}
