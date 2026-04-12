<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Arr;

/**
 * @property int $id
 * @property int $user_id
 * @property int $amount
 * @property int $final_amount
 * @property string $payment_method
 * @property string $status
 * @property string|null $tripay_merchant_ref
 * @property string|null $tripay_reference
 * @property string|null $tripay_method
 * @property string|null $tripay_pay_code
 * @property string|null $tripay_checkout_url
 * @property string|null $tripay_status
 * @property \Illuminate\Support\Carbon|null $expired_at
 * @property \Illuminate\Support\Carbon|null $processed_at
 * @property array|null $provider_payload
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read User|null $user
 */
class Deposit extends Model
{
    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'amount',
        'final_amount',
        'payment_method',
        'status',
        'tripay_merchant_ref',
        'tripay_reference',
        'tripay_method',
        'tripay_pay_code',
        'tripay_checkout_url',
        'tripay_status',
        'expired_at',
        'processed_at',
        'provider_payload',
    ];

    /**
     * @return BelongsTo<User, Deposit>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'user_id' => 'integer',
            'amount' => 'integer',
            'final_amount' => 'integer',
            'expired_at' => 'datetime',
            'processed_at' => 'datetime',
            'provider_payload' => 'array',
        ];
    }

    public function paymentUrl(): ?string
    {
        $checkoutUrl = trim((string) ($this->tripay_checkout_url ?? ''));
        if ($checkoutUrl !== '') {
            return $checkoutUrl;
        }

        $payload = is_array($this->provider_payload) ? $this->provider_payload : [];

        foreach (['redirect_url', 'payment_url', 'checkout_url', 'actions.0.url'] as $path) {
            $value = Arr::get($payload, $path);
            if (is_string($value) && trim($value) !== '') {
                return trim($value);
            }
        }

        return null;
    }

    public function providerReference(): ?string
    {
        $reference = trim((string) ($this->tripay_reference ?? ''));
        if ($reference !== '') {
            return $reference;
        }

        $payload = is_array($this->provider_payload) ? $this->provider_payload : [];
        $orderId = Arr::get($payload, 'order_id');

        return is_string($orderId) && trim($orderId) !== '' ? trim($orderId) : null;
    }

    public function providerTransactionId(): ?string
    {
        $payload = is_array($this->provider_payload) ? $this->provider_payload : [];
        $transactionId = Arr::get($payload, 'transaction_id');

        return is_string($transactionId) && trim($transactionId) !== '' ? trim($transactionId) : null;
    }

    public function providerStatus(): ?string
    {
        $status = trim((string) ($this->tripay_status ?? ''));
        if ($status !== '') {
            return $status;
        }

        $payload = is_array($this->provider_payload) ? $this->provider_payload : [];
        $providerStatus = Arr::get($payload, 'transaction_status', Arr::get($payload, 'status'));

        return is_string($providerStatus) && trim($providerStatus) !== '' ? trim($providerStatus) : null;
    }

    public function paymentChannel(): ?string
    {
        $channel = trim((string) ($this->tripay_method ?? ''));
        if ($channel !== '') {
            return $channel;
        }

        $payload = is_array($this->provider_payload) ? $this->provider_payload : [];
        $paymentType = Arr::get($payload, 'payment_type', Arr::get($payload, 'requested_channel'));

        return is_string($paymentType) && trim($paymentType) !== '' ? trim($paymentType) : null;
    }

    public function snapToken(): ?string
    {
        $payload = is_array($this->provider_payload) ? $this->provider_payload : [];

        foreach (['snap_token', 'token', 'snap_response.token'] as $path) {
            $value = Arr::get($payload, $path);
            if (is_string($value) && trim($value) !== '') {
                return trim($value);
            }
        }

        return null;
    }
}
