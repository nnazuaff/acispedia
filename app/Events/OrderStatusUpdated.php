<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderStatusUpdated implements ShouldBroadcastNow
{
    use Dispatchable;
    use SerializesModels;

    public function __construct(public Order $order)
    {
        //
    }

    public function broadcastOn(): array
    {
        return [new PrivateChannel('orders.'.$this->order->user_id)];
    }

    public function broadcastAs(): string
    {
        return 'order.status.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'order' => [
                'id' => $this->order->id,
                'service_id' => $this->order->service_id,
                'service_name' => $this->order->service_name,
                'provider_order_id' => $this->order->provider_order_id,
                'status' => $this->order->status,
                'remains' => $this->order->remains,
                'start_count' => $this->order->start_count,
                'charge' => $this->order->charge,
                'updated_at' => optional($this->order->updated_at)->toISOString(),
            ],
        ];
    }
}
