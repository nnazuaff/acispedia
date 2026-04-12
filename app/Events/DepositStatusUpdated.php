<?php

namespace App\Events;

use App\Models\Deposit;
use Carbon\CarbonInterface;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DepositStatusUpdated implements ShouldBroadcastNow
{
    use Dispatchable;
    use SerializesModels;

    public function __construct(public Deposit $deposit)
    {
        //
    }

    public function broadcastOn(): array
    {
        return [new PrivateChannel('deposits.'.$this->deposit->user_id)];
    }

    public function broadcastAs(): string
    {
        return 'deposit.status.updated';
    }

    private function fmtWib(?CarbonInterface $dt): ?string
    {
        if (! $dt) {
            return null;
        }

        return $dt->copy()->timezone('Asia/Jakarta')->format('d/m/Y H:i').' WIB';
    }

    public function broadcastWith(): array
    {
        return [
            'deposit' => [
                'id' => (int) $this->deposit->id,
                'amount' => (int) $this->deposit->amount,
                'final_amount' => (int) $this->deposit->final_amount,
                'status' => (string) $this->deposit->status,
                'payment_method' => (string) $this->deposit->payment_method,
                'tripay_method' => $this->deposit->tripay_method ? (string) $this->deposit->tripay_method : null,
                'tripay_merchant_ref' => $this->deposit->tripay_merchant_ref ? (string) $this->deposit->tripay_merchant_ref : null,
                'tripay_reference' => $this->deposit->tripay_reference ? (string) $this->deposit->tripay_reference : null,
                'tripay_pay_code' => $this->deposit->tripay_pay_code ? (string) $this->deposit->tripay_pay_code : null,
                'tripay_checkout_url' => $this->deposit->tripay_checkout_url ? (string) $this->deposit->tripay_checkout_url : null,
                'tripay_status' => $this->deposit->tripay_status ? (string) $this->deposit->tripay_status : null,
                'payment_url' => $this->deposit->paymentUrl(),
                'payment_channel' => $this->deposit->paymentChannel(),
                'provider_reference' => $this->deposit->providerReference(),
                'provider_transaction_id' => $this->deposit->providerTransactionId(),
                'provider_status' => $this->deposit->providerStatus(),
                'created_at' => $this->deposit->created_at?->toISOString(),
                'created_at_wib' => $this->fmtWib($this->deposit->created_at),
                'expired_at' => $this->deposit->expired_at?->toISOString(),
                'expired_at_wib' => $this->fmtWib($this->deposit->expired_at),
                'processed_at' => $this->deposit->processed_at?->toISOString(),
                'processed_at_wib' => $this->fmtWib($this->deposit->processed_at),
                'updated_at' => $this->deposit->updated_at?->toISOString(),
            ],
        ];
    }
}
