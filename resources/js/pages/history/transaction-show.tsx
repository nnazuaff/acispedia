import { Head, Link, usePage } from '@inertiajs/react';
import * as React from 'react';

import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

type OrderDetail = {
    id: number;
    service_id: number;
    service_name: string;
    target: string;
    quantity: number;
    total_price: number;
    status: string;
    provider_order_id: string | null;
    start_count: number | null;
    remains: number | null;
    charge: number | null;
    created_at: string | null;
    last_status_check: string | null;
    status_check_attempts: number;
};

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID').format(value);
}

function badgeVariantForStatus(
    status: string
): React.ComponentProps<typeof Badge>['variant'] {
    const normalized = (status ?? '').toLowerCase();

    if (normalized === 'success') return 'secondary';
    if (normalized === 'canceled' || normalized === 'cancelled') return 'destructive';
    if (normalized === 'error') return 'destructive';
    if (normalized === 'partial') return 'outline';

    return 'default';
}

function badgeClassNameForStatus(status: string): string {
    const s = (status ?? '').toLowerCase();

    if (s === 'submitting') return 'border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300';
    if (s === 'pending') return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300';
    if (s === 'processing' || s === 'in progress') return 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300';
    if (s === 'success') return 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300';
    if (s === 'partial') return 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300';
    if (s === 'canceled' || s === 'cancelled') return 'border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300';
    if (s === 'error') return 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300';

    return '';
}

function fmtDate(iso: string | null): string {
    if (!iso) return '-';
    try {
        return new Date(iso).toLocaleString('id-ID');
    } catch {
        return iso;
    }
}

export default function TransactionShowPage() {
    const { order } = usePage().props as any as { order: OrderDetail };

    return (
        <>
            <Head title="Detail transaksi" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card className="py-4">
                    <CardHeader>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <Heading title="Detail transaksi" description={`Order #${order.id}`} />
                            <Button asChild variant="outline">
                                <Link href="/history/transaction" prefetch>
                                    Kembali
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-lg border p-4">
                                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Status
                                </div>
                                <div className="mt-2">
                                    <Badge
                                        variant={badgeVariantForStatus(order.status)}
                                        className={badgeClassNameForStatus(order.status)}
                                    >
                                        {(order.status ?? '').toUpperCase()}
                                    </Badge>
                                </div>

                                <div className="mt-4 grid gap-2 text-sm">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-muted-foreground">Tanggal</span>
                                        <span className="font-medium">{fmtDate(order.created_at)}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-muted-foreground">Provider ID</span>
                                        <span className="font-medium">{order.provider_order_id ?? '-'}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-muted-foreground">Total</span>
                                        <span className="font-medium">Rp {formatRupiah(order.total_price)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border p-4">
                                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Detail
                                </div>

                                <div className="mt-4 grid gap-2 text-sm">
                                    <div>
                                        <div className="text-muted-foreground">Layanan</div>
                                        <div className="font-medium">{order.service_name}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Target</div>
                                        <div className="font-medium break-all">{order.target}</div>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-muted-foreground">Qty</span>
                                        <span className="font-medium">{order.quantity}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-muted-foreground">Start count</span>
                                        <span className="font-medium">{order.start_count ?? '-'}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-muted-foreground">Remains</span>
                                        <span className="font-medium">{order.remains ?? '-'}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-muted-foreground">Charge</span>
                                        <span className="font-medium">{order.charge != null ? `Rp ${formatRupiah(order.charge)}` : '-'}</span>
                                    </div>
                                </div>

                                <div className="mt-4 text-xs text-muted-foreground">
                                    Terakhir dicek: {fmtDate(order.last_status_check)} • Percobaan:{' '}
                                    {order.status_check_attempts}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
