function normalizeIdPhoneToLocalZero(input: string): string {
    const raw = String(input ?? '').trim();
    if (raw === '') return '';

    const digits = raw.replace(/\D+/g, '');
    if (digits === '') return '';

    if (digits.startsWith('62')) {
        const rest = digits.slice(2).replace(/^0+/, '');
        return `0${rest}`;
    }

    return digits;
}
import { Head, Link, router, usePage } from '@inertiajs/react';
import * as React from 'react';
import { toast } from 'sonner';
import { ArrowRight, QrCode, Wallet } from 'lucide-react';

import { useConfirm } from '@/components/confirm-dialog-provider';
import { useI18n } from '@/i18n/i18n-provider';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID').format(value);
}

function fmtWib(iso: string | null): string {
    if (!iso) return '-';
    try {
        const dtf = new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'Asia/Jakarta',
        });

        return `${dtf.format(new Date(iso))} WIB`;
    } catch {
        return iso;
    }
}

function getCookie(name: string): string | null {
    const parts = document.cookie.split(';');
    for (const part of parts) {
        const [rawKey, ...rest] = part.trim().split('=');
        if (rawKey === name) {
            return rest.join('=') || '';
        }
    }
    return null;
}

function getXsrfToken(): string | null {
    const token = getCookie('XSRF-TOKEN');
    return token ? decodeURIComponent(token) : null;
}

export default function DepositPage() {
    const { t, locale } = useI18n();
    const confirm = useConfirm();
    const { auth, balance, tripay_enabled: tripayEnabled, active_pending: activePendingProp } = usePage().props as any as {
        auth: { user?: { id?: number; phone?: string | null } };
        balance: number;
        tripay_enabled: boolean;
        active_pending: {
            id: number;
            status: string;
            tripay_checkout_url: string | null;
            created_at: string | null;
            expired_at: string | null;
        } | null;
    };

    const quickAmounts = React.useMemo(() => [1000, 5000, 10000, 20000, 50000, 100000, 200000], []);
    const [amount, setAmount] = React.useState<number>(0);
    const [methodCategory, setMethodCategory] = React.useState<'qris' | 'ewallet' | 'konversi_saldo'>(tripayEnabled ? 'qris' : 'konversi_saldo');
    const [ewalletCode, setEwalletCode] = React.useState<'OVO' | 'DANA' | 'SHOPEEPAY'>('OVO');
    const [acispayPhone, setAcispayPhone] = React.useState<string>('');
    const [acispayUsername, setAcispayUsername] = React.useState<string>('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [balanceState, setBalanceState] = React.useState<number>(Number(balance ?? 0));
    const [activePending, setActivePending] = React.useState<typeof activePendingProp>(activePendingProp);

    const method = methodCategory === 'qris' ? 'QRIS2' : ewalletCode;

    React.useEffect(() => {
        setBalanceState(Number(balance ?? 0));
    }, [balance]);

    React.useEffect(() => {
        setActivePending(activePendingProp);
    }, [activePendingProp]);

    React.useEffect(() => {
        if (!tripayEnabled && methodCategory !== 'konversi_saldo') {
            setMethodCategory('konversi_saldo');
        }
    }, [tripayEnabled, methodCategory]);

    React.useEffect(() => {
        const uid = Number(auth?.user?.id);
        if (!Number.isFinite(uid) || uid <= 0) {
            return;
        }

        const echo = (window as any)?.Echo;
        if (!echo) {
            return;
        }

        const dashboardChannelName = `dashboard.${uid}`;
        const depositsChannelName = `deposits.${uid}`;

        const dashboardChannel = echo.private(dashboardChannelName);
        const depositsChannel = echo.private(depositsChannelName);

        dashboardChannel.listen('.dashboard.stats.updated', (payload: any) => {
            const stats = payload?.stats;
            if (stats && typeof stats === 'object' && Number.isFinite(Number(stats.balance))) {
                setBalanceState(Number(stats.balance));
            }
        });

        depositsChannel.listen('.deposit.status.updated', (payload: any) => {
            const deposit = payload?.deposit;
            if (!deposit || typeof deposit !== 'object') {
                return;
            }

            const nextStatus = String(deposit.status ?? '').toLowerCase();
            if (nextStatus === 'pending') {
                setActivePending({
                    id: Number(deposit.id),
                    status: String(deposit.status ?? 'pending'),
                    tripay_checkout_url: deposit.tripay_checkout_url ? String(deposit.tripay_checkout_url) : null,
                    created_at: deposit.created_at ? String(deposit.created_at) : null,
                    expired_at: deposit.expired_at ? String(deposit.expired_at) : null,
                });
                return;
            }

            setActivePending((prev) => {
                if (!prev) {
                    return null;
                }

                return Number(prev.id) === Number(deposit.id) ? null : prev;
            });
        });

        return () => {
            try {
                echo.leave(dashboardChannelName);
                echo.leave(depositsChannelName);
            } catch {
                // ignore
            }
        };
    }, [auth?.user?.id]);

    async function cancelActivePending() {
        if (!activePending?.id) return;

        const ok = await confirm({
            title: t('Batalkan deposit pending ini?'),
            confirmText: t('Batalkan'),
            cancelText: t('Kembali'),
            variant: 'destructive',
        });
        if (!ok) return;

        try {
            const xsrf = getXsrfToken();

            const res = await fetch(`/api/deposits/${activePending.id}/cancel`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    ...(xsrf ? { 'X-XSRF-TOKEN': xsrf } : {}),
                },
                credentials: 'same-origin',
            });

            const json = (await res.json()) as any;
            if (!res.ok || !json?.success) {
                toast.error(json?.message ?? t('Gagal membatalkan deposit.'));
                return;
            }

            toast.success(json?.message ?? t('Deposit dibatalkan.'));
            router.reload({ preserveScroll: true } as any);
        } catch (e) {
            const msg = e instanceof Error ? e.message : t('Kesalahan tidak diketahui.');
            toast.error(msg);
        }
    }

    async function createDeposit() {
        if (isSubmitting) return;

        if (activePending?.id) {
            toast.error(t('Masih ada deposit pending. Selesaikan atau batalkan deposit sebelumnya.'));
            return;
        }

        const amt = Number(amount);
        if (!Number.isFinite(amt) || amt < 1000) {
            toast.error(t('Minimal deposit Rp 1.000'));
            return;
        }

        if (amt > 200000) {
            toast.error(t('Maksimal deposit Rp 200.000'));
            return;
        }

        if (methodCategory === 'konversi_saldo') {
            const phone = normalizeIdPhoneToLocalZero(acispayPhone);
            const username = acispayUsername.trim();

            if (!phone) {
                toast.error(t('Nomor HP Acispay wajib diisi'));
                return;
            }

            if (phone.length < 10) {
                toast.error(t('Nomor HP Acispay minimal 10 digit'));
                return;
            }

            if (!username) {
                toast.error(t('Username Acispay wajib diisi'));
                return;
            }

            setIsSubmitting(true);

            try {
                const xsrf = getXsrfToken();

                const res = await fetch('/api/deposits/konversi-saldo', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        ...(xsrf ? { 'X-XSRF-TOKEN': xsrf } : {}),
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify({
                        amount: amt,
                        acispay_phone: phone,
                        acispay_username: username,
                    }),
                });

                const json = (await res.json()) as any;
                if (!res.ok || !json?.success) {
                    toast.error(json?.message ?? t('Gagal membuat deposit.'));
                    return;
                }

                toast.success(json?.message ?? t('Deposit dibuat.'));

                router.get(
                    '/history/deposit',
                    {
                        page: 1,
                        per_page: 25,
                    },
                    {
                        preserveState: false,
                        preserveScroll: false,
                        replace: true,
                    }
                );
                return;
            } catch (e) {
                const msg = e instanceof Error ? e.message : t('Kesalahan tidak diketahui.');
                toast.error(msg);
            } finally {
                setIsSubmitting(false);
            }

            return;
        }

        setIsSubmitting(true);

        try {
            const xsrf = getXsrfToken();
            const phone = typeof auth?.user?.phone === 'string' ? auth.user.phone : null;

            const res = await fetch('/api/deposits/tripay', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    ...(xsrf ? { 'X-XSRF-TOKEN': xsrf } : {}),
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    amount: amt,
                    method,
                    ...(phone ? { customer_phone: phone } : {}),
                }),
            });

            const json = (await res.json()) as any;

            if (!res.ok || !json?.success) {
                toast.error(json?.message ?? t('Gagal membuat deposit.'));
                return;
            }

            toast.success(json?.message ?? t('Deposit dibuat.'));

            const url = String(json?.checkout_url ?? '');
            if (url) {
                window.open(url, '_blank', 'noopener,noreferrer');
            }

            router.get(
                '/history/deposit',
                {
                    page: 1,
                    per_page: 25,
                },
                {
                    preserveState: false,
                    preserveScroll: false,
                    replace: true,
                }
            );
            return;
        } catch (e) {
            const msg = e instanceof Error ? e.message : t('Kesalahan tidak diketahui.');
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <Head title={t('Deposit Saldo')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="space-y-1">
                    <Heading
                        variant="small"
                        title={t('Deposit Saldo')}
                        description={t('Isi saldo dengan metode pembayaran yang tersedia.')}
                    />
                </div>

                <Card className="py-4">
                    <CardHeader>
                        {activePending ? (
                            <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm">
                                <div className="font-semibold">{t('Ada deposit pending')}</div>
                                <div className="mt-1 text-muted-foreground">
                                    {locale === 'en'
                                        ? `Deposit #${activePending.id}${activePending.expired_at ? ` • Expires: ${fmtWib(activePending.expired_at)}` : ''}`
                                        : `Deposit #${activePending.id}${activePending.expired_at ? ` • Kadaluarsa: ${fmtWib(activePending.expired_at)}` : ''}`}
                                </div>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    {activePending.tripay_checkout_url ? (
                                        <Button asChild size="sm" variant="outline">
                                            <a href={activePending.tripay_checkout_url} target="_blank" rel="noopener noreferrer">
                                                {t('Bayar')}
                                            </a>
                                        </Button>
                                    ) : null}

                                    <Button size="sm" variant="destructive" type="button" onClick={cancelActivePending}>
                                        {t('Batalkan')}
                                    </Button>
                                </div>
                            </div>
                        ) : null}

                        <div className={`${activePending ? 'mt-1' : ''} text-sm text-muted-foreground`}>
                            {t('Saldo saat ini')}: <span className="font-medium">Rp {formatRupiah(balanceState)}</span>
                        </div>

                        {!tripayEnabled ? (
                            <div className="mt-4 rounded-lg border border-sky-500/30 bg-sky-500/10 p-4 text-sm text-sky-900 dark:text-sky-100">
                                <div className="font-semibold">{t('Tripay dinonaktifkan sementara')}</div>
                                <div className="mt-1 text-muted-foreground">
                                    {t('Metode QRIS dan E-Wallet dari Tripay untuk sementara tidak tersedia saat proses migrasi ke Midtrans.')}
                                </div>
                            </div>
                        ) : null}

                        <div className="mt-4 grid gap-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-semibold">{t('Pilih Metode Pembayaran')}</div>

                                <div className="space-y-3">
                                    {tripayEnabled ? (
                                        <button
                                            type="button"
                                            className={
                                                'flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors ' +
                                                (methodCategory === 'qris'
                                                    ? 'border-teal-500/60 bg-teal-500/10'
                                                    : 'border-border/60 bg-muted/10 hover:bg-muted/20')
                                            }
                                            onClick={() => setMethodCategory('qris')}
                                        >
                                            <span
                                                className={
                                                    'flex h-10 w-10 items-center justify-center rounded-lg ' +
                                                    (methodCategory === 'qris' ? 'bg-teal-500 text-white' : 'bg-muted text-foreground')
                                                }
                                            >
                                                <QrCode className="size-5" />
                                            </span>
                                            <div className="flex-1">
                                                <div className="text-sm font-semibold">QRIS</div>
                                                <div className="text-xs text-muted-foreground">{t('Pembayaran QRIS otomatis')}</div>
                                            </div>
                                            <span
                                                className={
                                                    'h-5 w-5 rounded-full border-2 ' +
                                                    (methodCategory === 'qris' ? 'border-teal-500' : 'border-muted-foreground/40')
                                                }
                                            >
                                                <span
                                                    className={
                                                        'block h-full w-full scale-50 rounded-full ' +
                                                        (methodCategory === 'qris' ? 'bg-teal-500' : 'bg-transparent')
                                                    }
                                                />
                                            </span>
                                        </button>
                                    ) : null}

                                    <button
                                        type="button"
                                        className={
                                            'flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors ' +
                                            (methodCategory === 'konversi_saldo'
                                                ? 'border-teal-500/60 bg-teal-500/10'
                                                : 'border-border/60 bg-muted/10 hover:bg-muted/20')
                                        }
                                        onClick={() => setMethodCategory('konversi_saldo')}
                                    >
                                        <span
                                            className={
                                                'flex h-10 w-10 items-center justify-center rounded-lg ' +
                                                (methodCategory === 'konversi_saldo'
                                                    ? 'bg-teal-500 text-white'
                                                    : 'bg-muted text-foreground')
                                            }
                                        >
                                            <Wallet className="size-5" />
                                        </span>
                                        <div className="flex-1">
                                            <div className="text-sm font-semibold">{t('Konversi Saldo')}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {t('Pindahkan saldo dari Acispay (butuh konfirmasi admin)')}
                                            </div>
                                        </div>
                                        <span
                                            className={
                                                'h-5 w-5 rounded-full border-2 ' +
                                                (methodCategory === 'konversi_saldo'
                                                    ? 'border-teal-500'
                                                    : 'border-muted-foreground/40')
                                            }
                                        >
                                            <span
                                                className={
                                                    'block h-full w-full scale-50 rounded-full ' +
                                                    (methodCategory === 'konversi_saldo'
                                                        ? 'bg-teal-500'
                                                        : 'bg-transparent')
                                                }
                                            />
                                        </span>
                                    </button>

                                    {tripayEnabled ? (
                                        <button
                                            type="button"
                                            className={
                                                'flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors ' +
                                                (methodCategory === 'ewallet'
                                                    ? 'border-teal-500/60 bg-teal-500/10'
                                                    : 'border-border/60 bg-muted/10 hover:bg-muted/20')
                                            }
                                            onClick={() => setMethodCategory('ewallet')}
                                        >
                                            <span
                                                className={
                                                    'flex h-10 w-10 items-center justify-center rounded-lg ' +
                                                    (methodCategory === 'ewallet' ? 'bg-teal-500 text-white' : 'bg-muted text-foreground')
                                                }
                                            >
                                                <Wallet className="size-5" />
                                            </span>
                                            <div className="flex-1">
                                                <div className="text-sm font-semibold">E-Wallet</div>
                                                <div className="text-xs text-muted-foreground">{t('Pilih OVO / DANA / ShopeePay')}</div>
                                            </div>
                                            <span
                                                className={
                                                    'h-5 w-5 rounded-full border-2 ' +
                                                    (methodCategory === 'ewallet' ? 'border-teal-500' : 'border-muted-foreground/40')
                                                }
                                            >
                                                <span
                                                    className={
                                                        'block h-full w-full scale-50 rounded-full ' +
                                                        (methodCategory === 'ewallet' ? 'bg-teal-500' : 'bg-transparent')
                                                    }
                                                />
                                            </span>
                                        </button>
                                    ) : null}

                                    {tripayEnabled && methodCategory === 'ewallet' ? (
                                        <div className="rounded-xl border border-border/60 bg-muted/10 p-4">
                                            <Label className="text-sm font-semibold">{t('Pilih E-Wallet')}</Label>
                                            <Select
                                                value={ewalletCode}
                                                onValueChange={(v) => setEwalletCode(v as any)}
                                            >
                                                <SelectTrigger className="mt-2 h-10">
                                                    <SelectValue placeholder={t('Pilih')} />
                                                </SelectTrigger>
                                                <SelectContent align="end">
                                                    <SelectItem value="OVO">OVO</SelectItem>
                                                    <SelectItem value="DANA">DANA</SelectItem>
                                                    <SelectItem value="SHOPEEPAY">ShopeePay</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    ) : null}

                                    {methodCategory === 'konversi_saldo' && Number(amount) > 0 ? (
                                        <div className="rounded-xl border border-border/60 bg-muted/10 p-4">
                                            <div className="text-sm font-semibold">{t('Data Acispay')}</div>
                                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                                <div>
                                                    <Label htmlFor="acispay_phone">{t('Nomor HP Acispay')}</Label>
                                                    <Input
                                                        id="acispay_phone"
                                                        className="mt-1"
                                                        type="tel"
                                                        inputMode="numeric"
                                                        pattern="[0-9]*"
                                                        autoComplete="tel"
                                                        minLength={10}
                                                        maxLength={16}
                                                        value={acispayPhone}
                                                        onChange={(e) => {
                                                            const next = normalizeIdPhoneToLocalZero(e.target.value);
                                                            setAcispayPhone(next);
                                                        }}
                                                        placeholder="08xxxxxxxxxx"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="acispay_username">{t('Username Acispay')}</Label>
                                                    <Input
                                                        id="acispay_username"
                                                        className="mt-1"
                                                        value={acispayUsername}
                                                        onChange={(e) => setAcispayUsername(e.target.value)}
                                                        placeholder="username"
                                                    />
                                                </div>
                                            </div>
                                            <div className="mt-2 text-xs text-muted-foreground">
                                                {t('Pastikan saldo Acispay mencukupi sesuai nominal yang dimasukkan.')}
                                            </div>
                                        </div>
                                    ) : null}

                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="text-sm font-semibold">{t('Pilih Nominal')}</div>

                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                    {quickAmounts.map((v) => {
                                        const active = Number(amount) === v;
                                        return (
                                            <button
                                                key={v}
                                                type="button"
                                                className={
                                                    'h-10 rounded-lg border px-3 text-sm font-medium transition-colors ' +
                                                    (active
                                                        ? 'border-teal-500/60 bg-teal-500/10 text-foreground dark:text-teal-200'
                                                        : 'border-border/60 bg-muted/10 text-foreground hover:bg-muted/20')
                                                }
                                                onClick={() => setAmount(v)}
                                            >
                                                Rp {formatRupiah(v)}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                                    <span className="inline-flex h-5 items-center rounded-md bg-muted px-1.5 text-[10px] text-foreground">
                                        RP
                                    </span>
                                    <span>{t('ATAU MASUKKAN NOMINAL MANUAL')}</span>
                                </div>

                                <div>
                                    <Label htmlFor="amount">{t('Nominal')}</Label>
                                    <Input
                                        id="amount"
                                        className="mt-1"
                                        type="number"
                                        inputMode="numeric"
                                        min={1000}
                                        max={200000}
                                        value={String(amount)}
                                        onChange={(e) => setAmount(Number(e.target.value))}
                                        placeholder={t('0')}
                                    />
                                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                                        <span>{t('Minimal')}: Rp 1.000</span>
                                        <span>{t('Maksimal')}: Rp 200.000</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                            <Button asChild variant="outline">
                                <Link href="/history/deposit" prefetch>
                                    {t('Riwayat')}
                                </Link>
                            </Button>

                            <Button type="button" onClick={createDeposit} disabled={isSubmitting || !!activePending}>
                                <ArrowRight className="mr-2 h-4 w-4" />
                                {isSubmitting ? t('Memproses...') : t('Lanjutkan')}
                            </Button>
                        </div>
                    </CardHeader>
                </Card>
            </div>
        </>
    );
}

DepositPage.layout = {
    breadcrumbs: [
        {
            title: 'Deposit Saldo',
            href: '/deposit',
        },
    ],
};
