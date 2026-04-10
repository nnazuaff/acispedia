<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\MedanpediaClient;
use App\Services\TripayClient;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class ConnectionsController extends Controller
{
    public function index(Request $request, MedanpediaClient $medanpedia): Response
    {
        $medanpediaConfigured = $medanpedia->isConfigured();
        $tripayConfigured = TripayClient::isConfigured();

        $medanpediaProfile = null;
        $tripayChannels = null;

        if ($medanpediaConfigured) {
            try {
                $result = $medanpedia->getProfile();
                $medanpediaProfile = $result;
            } catch (Throwable) {
                $medanpediaProfile = null;
            }
        }

        // Tripay payment channels are not implemented in this codebase; show config status only.
        $tripayChannels = null;

        return Inertia::render('admin/connections', [
            'connections' => [
                'medanpedia' => [
                    'configured' => $medanpediaConfigured,
                    'profile' => $medanpediaProfile,
                ],
                'tripay' => [
                    'configured' => $tripayConfigured,
                    'channels' => $tripayChannels,
                ],
            ],
        ]);
    }
}
