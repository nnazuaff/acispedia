<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Inertia\Inertia;
use Inertia\Response;

class AdminUsersController extends Controller
{
    public function index(Request $request): Response
    {
        $emails = Config::get('admin.emails', []);
        if (! is_array($emails)) {
            $emails = [];
        }

        $emails = array_values(array_filter(array_map(function ($v) {
            $v = strtolower(trim((string) $v));
            return $v !== '' ? $v : null;
        }, $emails)));

        $admins = User::query()
            ->whereIn('email', $emails)
            ->orderBy('id')
            ->get(['id', 'name', 'email', 'created_at']);

        $adminByEmail = $admins->keyBy(fn (User $u) => strtolower((string) $u->email));

        $rows = array_map(function (string $email) use ($adminByEmail) {
            /** @var User|null $user */
            $user = $adminByEmail->get($email);

            return [
                'email' => $email,
                'user' => $user ? [
                    'id' => (int) $user->id,
                    'name' => (string) ($user->name ?? ''),
                    'email' => (string) ($user->email ?? ''),
                    'created_at_wib' => $user->created_at?->setTimezone('Asia/Jakarta')->format('Y-m-d H:i'),
                ] : null,
                'exists' => $user !== null,
            ];
        }, $emails);

        return Inertia::render('admin/admin-users', [
            'admin_emails' => $rows,
        ]);
    }
}
