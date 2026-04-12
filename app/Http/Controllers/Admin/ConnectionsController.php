<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Services\MedanpediaClient;
use App\Services\MidtransClient;
use App\Services\TripayClient;
use App\Support\AdminActivity;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class ConnectionsController extends Controller
{
    public function index(Request $request, MedanpediaClient $medanpedia): Response
    {
        $medanpediaConfigured = $medanpedia->isConfigured();
        $midtransEnabled = MidtransClient::isEnabled();
        $midtransConfigured = MidtransClient::isConfigured();
        $tripayEnabled = TripayClient::isEnabled();
        $tripayConfigured = TripayClient::isConfigured();

        $markupAmount = AppSetting::getInt('smm_markup_amount', (int) config('medanpedia.markup_amount', 200));

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
                'midtrans' => [
                    'enabled' => $midtransEnabled,
                    'configured' => $midtransConfigured,
                    'environment' => MidtransClient::isProduction() ? 'production' : 'sandbox',
                ],
                'tripay' => [
                    'enabled' => $tripayEnabled,
                    'configured' => $tripayConfigured,
                    'channels' => $tripayChannels,
                ],
            ],
            'markup_amount' => $markupAmount,
        ]);
    }

    public function updateMarkup(Request $request)
    {
        $validated = $request->validate([
            'markup_amount' => ['required', 'integer', 'min:0', 'max:1000000'],
        ]);

        $value = (int) $validated['markup_amount'];
        AppSetting::putInt('smm_markup_amount', $value);

        AdminActivity::log($request, 'connections_markup_update', 'setting', 'smm_markup_amount', 'Update markup amount', [
            'markup_amount' => $value,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Pengaturan berhasil disimpan.']);
        return back();
    }
}
