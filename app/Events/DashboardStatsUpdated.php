<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DashboardStatsUpdated implements ShouldBroadcastNow
{
    use Dispatchable;
    use SerializesModels;

    public function __construct(public int $userId, public array $stats)
    {
        //
    }

    public function broadcastOn(): array
    {
        return [new PrivateChannel('dashboard.'.$this->userId)];
    }

    public function broadcastAs(): string
    {
        return 'dashboard.stats.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'stats' => $this->stats,
        ];
    }
}
