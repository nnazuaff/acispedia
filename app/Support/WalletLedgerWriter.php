<?php

namespace App\Support;

use App\Models\WalletLedger;
use Carbon\CarbonInterface;

final class WalletLedgerWriter
{
    /**
     * @param array<string, mixed>|null $meta
     */
    public static function record(
        int $userId,
        string $direction,
        int $amount,
        int $balanceBefore,
        int $balanceAfter,
        string $sourceType,
        ?string $sourceId,
        string $description,
        ?array $meta = null,
        ?CarbonInterface $eventAt = null,
    ): void {
        if ($userId <= 0) {
            return;
        }

        if (!in_array($direction, ['credit', 'debit'], true)) {
            $direction = 'credit';
        }

        $amount = max(0, (int) $amount);
        $balanceBefore = max(0, (int) $balanceBefore);
        $balanceAfter = max(0, (int) $balanceAfter);

        WalletLedger::query()->create([
            'user_id' => $userId,
            'direction' => $direction,
            'amount' => $amount,
            'balance_before' => $balanceBefore,
            'balance_after' => $balanceAfter,
            'source_type' => $sourceType !== '' ? $sourceType : 'unknown',
            'source_id' => $sourceId,
            'description' => $description,
            'meta' => $meta,
            'event_at' => $eventAt,
        ]);
    }
}
