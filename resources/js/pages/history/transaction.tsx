import { Head, router, usePage } from '@inertiajs/react';
import * as React from 'react';
import { Copy, MoreHorizontal } from 'lucide-react';

import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type OrderRow = {
    id: number;
    service_name: string;
    target: string;
    quantity: number;
    total_price: number;
    status: string;
    provider_order_id: string | null;
    created_at: string | null;
    created_at_wib: string | null;
};

type OrderDetail = {
    id: number;
    service_name: string;
    target: string;
    quantity: number;
    total_price: number;
    status: string;
    created_at_wib: string | null;
};

type OrdersPaginator = {
    data: OrderRow[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Filters = {
    q: string;
    status: string;
    per_page: number;
};

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID').format(value);
}

function statusLabel(status: string): string {
    const s = (status ?? '').toLowerCase();
    if (s === 'success') return 'Selesai';
    if (s === 'pending') return 'Pending';
    if (s === 'processing' || s === 'in progress') return 'Proses';
    if (s === 'partial') return 'Partial';
    if (s === 'canceled' || s === 'cancelled') return 'Batal';
    if (s === 'error' || s === 'failed') return 'Gagal';
    if (s === 'submitting') return 'Submitting';
    return status;
}

function badgeVariantForStatus(
    status: string
): React.ComponentProps<typeof Badge>['variant'] {
    const normalized = (status ?? '').toLowerCase();

    if (normalized === 'success') {
        return 'secondary';
    }

    if (normalized === 'canceled' || normalized === 'cancelled') {
        return 'destructive';
    }

    if (normalized === 'error') {
        return 'destructive';
    }

    if (normalized === 'partial') {
        return 'outline';
    }

    return 'default';
}

function badgeClassNameForStatus(status: string): string {
    const s = (status ?? '').toLowerCase();

    if (s === 'submitting') {
        return 'border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300';
    }

    if (s === 'pending') {
        return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300';
    }

    if (s === 'processing' || s === 'in progress') {
        return 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300';
    }

    if (s === 'success') {
        return 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300';
    }

    if (s === 'partial') {
        return 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300';
    }

    if (s === 'canceled' || s === 'cancelled') {
        return 'border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300';
    }

    if (s === 'error') {
        return 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300';
    }

    return '';
}

export default function HistoryTransactionPage() {
    const { auth, orders: ordersProp, filters: filtersProp } = usePage().props as any as {
        auth: { user?: { id?: number } };
        orders: OrdersPaginator;
        filters: Filters;
    };

    const [openDetail, setOpenDetail] = React.useState<boolean>(false);
    const [selectedOrder, setSelectedOrder] = React.useState<OrderDetail | null>(null);

    const [q, setQ] = React.useState<string>(filtersProp?.q ?? '');
    const [status, setStatus] = React.useState<string>(filtersProp?.status ?? 'all');
    const [perPage, setPerPage] = React.useState<number>(Number(filtersProp?.per_page ?? 25));

    React.useEffect(() => {
        setQ(filtersProp?.q ?? '');
        setStatus(filtersProp?.status ?? 'all');
        setPerPage(Number(filtersProp?.per_page ?? 25));
    }, [filtersProp?.q, filtersProp?.status, filtersProp?.per_page]);

    React.useEffect(() => {
        if (typeof window === 'undefined') return;
        if (window.location.search) {
            try {
                window.history.replaceState({}, '', '/history/transaction');
            } catch {
                // ignore
            }
        }
    }, []);

    const rowsFromServer = Array.isArray(ordersProp?.data) ? ordersProp.data : [];
    const [rows, setRows] = React.useState<OrderRow[]>(rowsFromServer);

    React.useEffect(() => {
        setRows(rowsFromServer);
    }, [ordersProp?.current_page, ordersProp?.total]);

    React.useEffect(() => {
        const uid = Number(auth?.user?.id);

        if (!Number.isFinite(uid) || uid <= 0) {
            return;
        }

        const echo = (window as any)?.Echo;

        if (!echo) {
            return;
        }

        const channelName = `orders.${uid}`;
        const channel = echo.private(channelName);

        channel.listen('.order.status.updated', (payload: any) => {
            const order = payload?.order;

            if (!order || typeof order !== 'object') {
                return;
            }

            const orderId = Number(order.id);
            if (!Number.isFinite(orderId)) {
                return;
            }

            setSelectedOrder((prev) =>
                prev && Number(prev.id) === orderId
                    ? {
                          ...prev,
                          status: String(order.status ?? prev.status),
                      }
                    : prev
            );

            setRows((prev) =>
                prev.map((row) =>
                    row.id === orderId
                        ? {
                              ...row,
                              status: String(order.status ?? row.status),
                              provider_order_id:
                                  order.provider_order_id != null
                                      ? String(order.provider_order_id)
                                      : row.provider_order_id,
                          }
                        : row
                )
            );

            router.reload({
                only: ['orders'],
                preserveScroll: true,
                preserveState: true,
            } as any);
        });

        return () => {
            try {
                echo.leave(channelName);
            } catch {
                // ignore
            }
        };
    }, [auth?.user?.id]);

    const from = ordersProp?.from ?? (rows.length > 0 ? 1 : 0);
    const to = ordersProp?.to ?? rows.length;
    const total = ordersProp?.total ?? rows.length;

    const defaultPerPage = 25;

    function applyFilters(next?: Partial<Filters> & { page?: number }) {
        const merged: Partial<Filters> = {
            q,
            status,
            per_page: perPage,
            ...next,
        };

        const params: Record<string, any> = {};

        const nextQ = String(merged.q ?? '').trim();
        if (nextQ !== '') params.q = nextQ;

        const nextStatus = String(merged.status ?? 'all');
        if (nextStatus !== 'all') params.status = nextStatus;

        const nextPerPage = Number(merged.per_page ?? defaultPerPage);
        if (Number.isFinite(nextPerPage) && nextPerPage !== defaultPerPage) params.per_page = nextPerPage;

        const nextPage = Number((merged as any).page ?? 1);
        if (Number.isFinite(nextPage) && nextPage > 1) params.page = nextPage;

        router.get(
            '/history/transaction',
            params,
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
                onSuccess: () => {
                    try {
                        window.history.replaceState({}, '', '/history/transaction');
                    } catch {
                        // ignore
                    }
                },
            }
        );
    }

    function openDetailById(id: number) {
        const row = rows.find((item) => Number(item.id) === Number(id)) ?? null;
        setSelectedOrder(row);
        setOpenDetail(Boolean(row));
    }

    function closeDetail() {
        setOpenDetail(false);
        setSelectedOrder(null);
    }

    return (
        <>
            <Head title="Riwayat transaksi" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="space-y-1">
                    <Heading variant="small" title="Riwayat transaksi" description="Riwayat transaksi order Anda." />
                </div>

                <Card className="py-4">
                    <CardHeader>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <div className="sm:col-span-2">
                                <Label htmlFor="q">Pencarian</Label>
                                <Input
                                    id="q"
                                    className="mt-1"
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder="Cari layanan, target, atau provider id..."
                                />
                            </div>

                            <div>
                                <Label>Status</Label>
                                <Select value={status} onValueChange={(v) => setStatus(v)}>
                                    <SelectTrigger className="mt-1 h-9 w-full">
                                        <SelectValue placeholder="Semua" />
                                    </SelectTrigger>
                                    <SelectContent align="end">
                                        <SelectItem value="all">Semua</SelectItem>
                                        <SelectItem value="Submitting">Submitting</SelectItem>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="Processing">Processing</SelectItem>
                                        <SelectItem value="In progress">In progress</SelectItem>
                                        <SelectItem value="Success">Success</SelectItem>
                                        <SelectItem value="Partial">Partial</SelectItem>
                                        <SelectItem value="Canceled">Canceled</SelectItem>
                                        <SelectItem value="Error">Error</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <Button type="button" onClick={() => applyFilters({})}>
                                    Terapkan
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setQ('');
                                        setStatus('all');
                                        setPerPage(25);
                                        applyFilters({ q: '', status: 'all', per_page: 25 });
                                    }}
                                >
                                    Reset
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 text-sm text-muted-foreground">
                            <div>
                                Menampilkan {from}-{to} dari {total}
                                {ordersProp?.last_page
                                    ? ` (Halaman ${ordersProp.current_page} / ${ordersProp.last_page})`
                                    : ''}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="overflow-hidden rounded-lg border">
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-muted/30">
                                        <tr className="text-left">
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                Tanggal
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                Layanan
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                Target
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                Qty
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                Total
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                Provider ID
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.length === 0 ? (
                                            <tr>
                                                <td className="px-4 py-6 text-center text-muted-foreground" colSpan={8}>
                                                    Belum ada transaksi.
                                                </td>
                                            </tr>
                                        ) : (
                                            rows.map((row) => (
                                                <tr key={row.id} className="border-t">
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        {row.created_at_wib ?? '-'}
                                                    </td>
                                                    <td className="px-4 py-3">{row.service_name}</td>
                                                    <td className="px-4 py-3">{row.target}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap">{row.quantity}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        Rp {formatRupiah(row.total_price)}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <Badge
                                                            variant={badgeVariantForStatus(row.status)}
                                                            className={badgeClassNameForStatus(row.status)}
                                                        >
                                                            {statusLabel(row.status).toUpperCase()}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        {row.provider_order_id ?? '-'}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button size="icon" variant="outline">
                                                                    <MoreHorizontal className="size-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => openDetailById(row.id)}>
                                                                    Detail
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                            <div className="text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <span>Data</span>
                                    <Select
                                        value={String(perPage)}
                                        onValueChange={(v) => {
                                            const next = Number(v);
                                            setPerPage(next);
                                            applyFilters({ per_page: next });
                                        }}
                                    >
                                        <SelectTrigger className="h-9 w-27.5">
                                            <SelectValue placeholder="25" />
                                        </SelectTrigger>
                                        <SelectContent align="end">
                                            <SelectItem value="5">5</SelectItem>
                                            <SelectItem value="10">10</SelectItem>
                                            <SelectItem value="25">25</SelectItem>
                                            <SelectItem value="50">50</SelectItem>
                                            <SelectItem value="100">100</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {Number(ordersProp?.current_page ?? 1) > 1 ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => applyFilters({ page: Number(ordersProp?.current_page ?? 1) - 1 })}
                                    >
                                        Prev
                                    </Button>
                                ) : (
                                    <Button variant="outline" disabled>
                                        Prev
                                    </Button>
                                )}

                                {Number(ordersProp?.current_page ?? 1) < Number(ordersProp?.last_page ?? 1) ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => applyFilters({ page: Number(ordersProp?.current_page ?? 1) + 1 })}
                                    >
                                        Next
                                    </Button>
                                ) : (
                                    <Button variant="outline" disabled>
                                        Next
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Dialog
                    open={openDetail}
                    onOpenChange={(next) => {
                        setOpenDetail(next);
                        if (!next) closeDetail();
                    }}
                >
                    <DialogContent className="max-h-[calc(100vh-2rem)] overflow-auto sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Detail Pesanan</DialogTitle>
                        </DialogHeader>

                        {selectedOrder ? (
                            <div className="grid gap-4">
                                <div className="grid gap-3">
                                    <div className="grid gap-1">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            ID Pesanan
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-sm font-semibold">#{selectedOrder.id}</div>
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="outline"
                                                onClick={async () => {
                                                    try {
                                                        await navigator.clipboard.writeText(String(selectedOrder.id));
                                                    } catch {
                                                        // ignore
                                                    }
                                                }}
                                                aria-label="Copy ID"
                                            >
                                                <Copy className="size-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid gap-1">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            Dibuat
                                        </div>
                                        <div className="text-sm font-medium">{selectedOrder.created_at_wib ?? '-'}</div>
                                    </div>

                                    <div className="grid gap-1">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            Layanan
                                        </div>
                                        <div className="text-sm font-medium">{selectedOrder.service_name}</div>
                                    </div>

                                    <div className="grid gap-1">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            Target
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-sm font-medium break-all">{selectedOrder.target}</div>
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="outline"
                                                onClick={async () => {
                                                    try {
                                                        await navigator.clipboard.writeText(String(selectedOrder.target));
                                                    } catch {
                                                        // ignore
                                                    }
                                                }}
                                                aria-label="Copy target"
                                            >
                                                <Copy className="size-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid gap-1">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            Jumlah pesan
                                        </div>
                                        <div className="text-sm font-medium">{selectedOrder.quantity}</div>
                                    </div>

                                    <div className="grid gap-1">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            Biaya
                                        </div>
                                        <div className="text-sm font-semibold">Rp {formatRupiah(selectedOrder.total_price)}</div>
                                    </div>

                                    <div className="grid gap-1">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            Status
                                        </div>
                                        <div>
                                            <Badge
                                                variant={badgeVariantForStatus(selectedOrder.status)}
                                                className={badgeClassNameForStatus(selectedOrder.status)}
                                            >
                                                {statusLabel(selectedOrder.status).toUpperCase()}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground">Data tidak ditemukan.</div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

HistoryTransactionPage.layout = {
    breadcrumbs: [
        {
            title: 'Riwayat Transaksi',
            href: '/history/transaction',
        },
    ],
};
