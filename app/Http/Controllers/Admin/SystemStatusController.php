<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class SystemStatusController extends Controller
{
    public function index(Request $request): Response
    {
        $queueConnection = (string) config('queue.default', 'sync');
        $broadcastDriver = (string) config('broadcasting.default', '');

        $reverbAppId = (string) data_get(config('reverb.apps.apps'), '0.app_id', '');
        $reverbKey = (string) data_get(config('reverb.apps.apps'), '0.key', '');
        $reverbSecret = (string) data_get(config('reverb.apps.apps'), '0.secret', '');

        $reverbConfigured = $reverbAppId !== '' && $reverbKey !== '' && $reverbSecret !== '';

        $serverName = (string) config('reverb.default', 'reverb');
        $serverHost = (string) data_get(config('reverb.servers'), $serverName . '.host', '');
        $serverPort = (int) data_get(config('reverb.servers'), $serverName . '.port', 0);

        $tcpOk = null;
        $tcpError = null;

        if ($serverPort > 0) {
            $hostToCheck = $serverHost !== '' ? $serverHost : '127.0.0.1';
            if ($hostToCheck === '0.0.0.0') {
                $hostToCheck = '127.0.0.1';
            }

            try {
                $errno = 0;
                $errstr = '';
                $fp = @fsockopen($hostToCheck, $serverPort, $errno, $errstr, 0.3);
                if (is_resource($fp)) {
                    fclose($fp);
                    $tcpOk = true;
                } else {
                    $tcpOk = false;
                    $tcpError = trim($errno . ': ' . $errstr);
                }
            } catch (Throwable $e) {
                $tcpOk = false;
                $tcpError = $e->getMessage();
            }
        }

        $pendingJobs = null;
        $failedJobs = null;

        if ($queueConnection === 'database') {
            try {
                if (Schema::hasTable('jobs')) {
                    $pendingJobs = (int) DB::table('jobs')->count();
                }

                if (Schema::hasTable('failed_jobs')) {
                    $failedJobs = (int) DB::table('failed_jobs')->count();
                }
            } catch (Throwable) {
                $pendingJobs = null;
                $failedJobs = null;
            }
        }

        $queueSizeHint = null;
        try {
            $queueSizeHint = (int) Queue::size();
        } catch (Throwable) {
            $queueSizeHint = null;
        }

        return Inertia::render('admin/system-status', [
            'app' => [
                'env' => (string) config('app.env', ''),
                'debug' => (bool) config('app.debug', false),
            ],
            'queue' => [
                'connection' => $queueConnection,
                'active_hint' => $queueConnection !== 'sync',
                'pending_jobs' => $pendingJobs,
                'failed_jobs' => $failedJobs,
                'size_hint' => $queueSizeHint,
            ],
            'reverb' => [
                'broadcast_driver' => $broadcastDriver,
                'configured' => $reverbConfigured,
                'app' => [
                    'app_id' => $reverbAppId !== '' ? $reverbAppId : null,
                    'key_set' => $reverbKey !== '',
                    'secret_set' => $reverbSecret !== '',
                ],
                'server' => [
                    'name' => $serverName,
                    'host' => $serverHost,
                    'port' => $serverPort,
                ],
                'tcp' => [
                    'ok' => $tcpOk,
                    'error' => $tcpError,
                ],
            ],
        ]);
    }
}
