import { Head, usePage } from '@inertiajs/react';
import * as React from 'react';
import { toast } from 'sonner';

import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID').format(value);
}

function getCookie(name: string): string | null {
    const parts = document.cookie.split(';');

    for (const part of parts) {
        const [rawKey, ...rest] = part.trim().split('=');
        if (rawKey === name) {
            return rest.join('=');
        }
    }

    return null;
}

export default function Topup() {
    const { auth, balance: balanceProp } = usePage().props as any;

    const [amount, setAmount] = React.useState<string>('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [balance, setBalance] = React.useState<number>(Number(balanceProp ?? 0));

    React.useEffect(() => {
        setBalance(Number(balanceProp ?? 0));
    }, [balanceProp]);

    React.useEffect(() => {
        const uid = Number(auth?.user?.id);

        if (!Number.isFinite(uid) || uid <= 0) {
            return;
        }

        const echo = (window as any)?.Echo;

        if (!echo) {
            return;
        }

        const channelName = `dashboard.${uid}`;
        const channel = echo.private(channelName);

        channel.listen('.dashboard.stats.updated', (payload: any) => {
            const next = payload?.stats;

            if (!next || typeof next !== 'object') {
                return;
            }

            setBalance(Number(next.balance ?? 0));
        });

        return () => {
            try {
                echo.leave(channelName);
            } catch {
                // ignore
            }
        };
    }, [auth?.user?.id]);

    async function submit() {
        const parsed = Number(amount);

        if (!Number.isFinite(parsed) || parsed <= 0) {
            toast.error('Nominal tidak valid.');
            return;
        }

        setIsSubmitting(true);

        try {
            const xsrf = getCookie('XSRF-TOKEN');

            const res = await fetch('/api/topup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    ...(xsrf ? { 'X-XSRF-TOKEN': xsrf } : {}),
                },
                body: JSON.stringify({ amount: Math.floor(parsed) }),
            });

            const json = await res.json().catch(() => null);

            if (!res.ok || !json?.success) {
                const msg = json?.message || 'Gagal top up saldo.';
                toast.error(msg);
                return;
            }

            toast.success('Saldo berhasil ditambahkan.');
            setAmount('');

            if (json?.balance != null) {
                setBalance(Number(json.balance));
            }
        } catch {
            toast.error('Gagal top up saldo.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <Head title="Top Up Saldo" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card className="py-4">
                    <CardHeader>
                        <Heading
                            title="Top Up Saldo"
                            description="Tambah saldo untuk testing (tanpa payment gateway)."
                        />
                    </CardHeader>

                    <CardContent>
                        <div className="text-sm text-muted-foreground">
                            Saldo saat ini: <span className="font-semibold text-foreground">Rp {formatRupiah(balance)}</span>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="amount">Nominal</Label>
                                <Input
                                    id="amount"
                                    className="mt-1"
                                    inputMode="numeric"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Contoh: 10000"
                                />
                            </div>

                            <div className="flex items-end">
                                <Button type="button" onClick={submit} disabled={isSubmitting}>
                                    {isSubmitting ? 'Memproses...' : 'Tambah Saldo'}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Topup.layout = {
    breadcrumbs: [
        {
            title: 'Top Up Saldo',
            href: '/topup',
        },
    ],
};
