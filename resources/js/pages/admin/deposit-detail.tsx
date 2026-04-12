import { Form, Head, Link, usePage } from '@inertiajs/react';
import * as React from 'react';

import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { getPaymentMethodLabel } from '@/components/payment-method-badge';
import { useI18n } from '@/i18n/i18n-provider';

type DepositDetail = {
    id: number;
    amount: number;
    final_amount: number;
    status: string;
    payment_method: string;
    tripay_merchant_ref: string | null;
    tripay_reference: string | null;
    tripay_method: string | null;
    tripay_pay_code: string | null;
    tripay_checkout_url: string | null;
    tripay_status: string | null;
    payment_url: string | null;
    payment_channel: string | null;
    provider_reference: string | null;
    provider_transaction_id: string | null;
    provider_status: string | null;
    expired_at_wib: string | null;
    processed_at_wib: string | null;
    created_at_wib: string | null;
    updated_at_wib: string | null;
    user: {
        id: number;
        name: string | null;
        email: string | null;
    };
    provider_payload: unknown;
};

function formatNumber(value: number): string {
    return new Intl.NumberFormat('id-ID').format(value);
}

function depositStatusMeta(status: string, t: (key: string) => string): { label: string; className: string } {
    const key = String(status ?? '').toLowerCase();
    if (key === 'success') return { label: t('Sukses'), className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' };
    if (key === 'pending') return { label: t('Pending'), className: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300' };
    if (key === 'failed') return { label: t('Gagal'), className: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300' };
    if (key === 'expired') return { label: t('Expired'), className: 'border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300' };
    if (key === 'canceled' || key === 'cancelled') return { label: t('Canceled'), className: 'border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300' };
    return { label: status || '-', className: 'border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300' };
}

export default function AdminDepositDetail() {
    const { t } = useI18n();

    const { deposit, known_statuses } = usePage().props as any as {
        deposit: DepositDetail;
        known_statuses: string[];
    };

    const paymentMethod = String(deposit.payment_method ?? '').toLowerCase();
    const isTripay =
        paymentMethod === 'tripay' ||
        Boolean(deposit.tripay_method || deposit.tripay_reference || deposit.tripay_merchant_ref || deposit.tripay_checkout_url);
    const isMidtrans = paymentMethod === 'midtrans';
    const isKonversiSaldo = paymentMethod === 'konversi_saldo';

    const providerPayload = deposit.provider_payload && typeof deposit.provider_payload === 'object' ? (deposit.provider_payload as any) : null;
    const acispayPhone = providerPayload?.acispay_phone ? String(providerPayload.acispay_phone) : '';
    const acispayUsername = providerPayload?.acispay_username ? String(providerPayload.acispay_username) : '';

    const statusOptions = React.useMemo(() => {
        return Array.isArray(known_statuses) ? known_statuses : [];
    }, [known_statuses]);

    const [nextStatus, setNextStatus] = React.useState<string>(String(deposit?.status ?? 'pending'));

    React.useEffect(() => {
        setNextStatus(String(deposit?.status ?? 'pending'));
    }, [deposit?.status]);

    return (
        <>
            <Head title={`${t('Detail Deposit')} #${deposit?.id ?? ''}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading variant="small" title={t('Detail Deposit')} description={`#${deposit?.id ?? '-'}`} />

                <Card>
                    <CardContent className="pt-6">
                        <Form
                            action={`/deposits/${deposit.id}/status`}
                            method="post"
                            className="flex flex-col gap-3 sm:flex-row sm:items-end"
                        >
                            {() => (
                                <>
                                    <div className="w-full sm:max-w-xs">
                                        <Label>{t('Status')}</Label>
                                        <Select value={nextStatus} onValueChange={setNextStatus}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statusOptions.map((st) => (
                                                    <SelectItem key={st} value={st}>
                                                        {st}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <input type="hidden" name="status" value={nextStatus} />
                                    </div>

                                    <Button type="submit">{t('Perbarui Status')}</Button>

                                    <Button asChild variant="outline">
                                        <Link href="/deposits" prefetch>
                                            {t('Kembali')}
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </Form>

                        <div className="mt-4 text-xs text-muted-foreground">
                            {t('Catatan')}: {t('Status sukses hanya bisa diset dari pending, dan tidak bisa diturunkan.')}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="overflow-x-auto rounded-lg border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-muted/20">
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {t('Kolom')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {t('Nilai')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-t">
                                        <td className="px-4 py-3">{t('ID')}</td>
                                        <td className="px-4 py-3">#{deposit.id}</td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="px-4 py-3">{t('Pengguna')}</td>
                                        <td className="px-4 py-3">{deposit.user?.name || deposit.user?.email || '-'}</td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="px-4 py-3">{t('Jumlah')}</td>
                                        <td className="px-4 py-3">Rp {formatNumber(deposit.amount ?? 0)}</td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="px-4 py-3">{t('Final Amount')}</td>
                                        <td className="px-4 py-3">Rp {formatNumber(deposit.final_amount ?? 0)}</td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="px-4 py-3">{t('Status')}</td>
                                        <td className="px-4 py-3">
                                            {(() => {
                                                const meta = depositStatusMeta(deposit.status, t);
                                                return (
                                                    <Badge variant="outline" className={meta.className}>
                                                        {meta.label}
                                                    </Badge>
                                                );
                                            })()}
                                        </td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="px-4 py-3">{t('Metode')}</td>
                                        <td className="px-4 py-3">{t(getPaymentMethodLabel({ payment_method: deposit.payment_method, tripay_method: deposit.tripay_method, payment_channel: deposit.payment_channel }))}</td>
                                    </tr>

                                    {isMidtrans ? (
                                        <>
                                            <tr className="border-t">
                                                <td className="px-4 py-3">{t('Referensi provider')}</td>
                                                <td className="px-4 py-3">{deposit.provider_reference ?? '-'}</td>
                                            </tr>
                                            <tr className="border-t">
                                                <td className="px-4 py-3">{t('Transaction ID')}</td>
                                                <td className="px-4 py-3">{deposit.provider_transaction_id ?? '-'}</td>
                                            </tr>
                                            <tr className="border-t">
                                                <td className="px-4 py-3">{t('Channel')}</td>
                                                <td className="px-4 py-3">{deposit.payment_channel ?? '-'}</td>
                                            </tr>
                                            <tr className="border-t">
                                                <td className="px-4 py-3">{t('Checkout URL')}</td>
                                                <td className="px-4 py-3">
                                                    {deposit.payment_url ? (
                                                        <a
                                                            href={deposit.payment_url}
                                                            className="break-all underline"
                                                            target="_blank"
                                                            rel="noreferrer"
                                                        >
                                                            {deposit.payment_url}
                                                        </a>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </td>
                                            </tr>
                                            <tr className="border-t">
                                                <td className="px-4 py-3">{t('Status pembayaran')}</td>
                                                <td className="px-4 py-3">{deposit.provider_status ?? '-'}</td>
                                            </tr>
                                        </>
                                    ) : null}

                                    {isTripay ? (
                                        <>
                                            <tr className="border-t">
                                                <td className="px-4 py-3">{t('Tripay Merchant Ref')}</td>
                                                <td className="px-4 py-3">{deposit.tripay_merchant_ref ?? '-'}</td>
                                            </tr>
                                            <tr className="border-t">
                                                <td className="px-4 py-3">{t('Tripay Reference')}</td>
                                                <td className="px-4 py-3">{deposit.tripay_reference ?? '-'}</td>
                                            </tr>
                                            <tr className="border-t">
                                                <td className="px-4 py-3">{t('Tripay Pay Code')}</td>
                                                <td className="px-4 py-3">{deposit.tripay_pay_code ?? '-'}</td>
                                            </tr>
                                            <tr className="border-t">
                                                <td className="px-4 py-3">{t('Checkout URL')}</td>
                                                <td className="px-4 py-3">
                                                    {deposit.tripay_checkout_url ? (
                                                        <a
                                                            href={deposit.tripay_checkout_url}
                                                            className="break-all underline"
                                                            target="_blank"
                                                            rel="noreferrer"
                                                        >
                                                            {deposit.tripay_checkout_url}
                                                        </a>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </td>
                                            </tr>
                                            <tr className="border-t">
                                                <td className="px-4 py-3">{t('Expired')}</td>
                                                <td className="px-4 py-3">{deposit.expired_at_wib ?? '-'}</td>
                                            </tr>
                                        </>
                                    ) : null}

                                    {isKonversiSaldo ? (
                                        <>
                                            <tr className="border-t">
                                                <td className="px-4 py-3">{t('Nomor HP Acispay')}</td>
                                                <td className="px-4 py-3">{acispayPhone !== '' ? acispayPhone : '-'}</td>
                                            </tr>
                                            <tr className="border-t">
                                                <td className="px-4 py-3">{t('Username Acispay')}</td>
                                                <td className="px-4 py-3">{acispayUsername !== '' ? acispayUsername : '-'}</td>
                                            </tr>
                                        </>
                                    ) : null}
                                    <tr className="border-t">
                                        <td className="px-4 py-3">{t('Processed')}</td>
                                        <td className="px-4 py-3">{deposit.processed_at_wib ?? '-'}</td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="px-4 py-3">{t('Dibuat')}</td>
                                        <td className="px-4 py-3">{deposit.created_at_wib ?? '-'}</td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="px-4 py-3">{t('Diperbarui')}</td>
                                        <td className="px-4 py-3">{deposit.updated_at_wib ?? '-'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {deposit.provider_payload ? (
                            <div className="mt-4">
                                <div className="text-sm font-semibold">{t('Provider Payload')}</div>
                                <pre className="mt-2 max-h-80 overflow-auto rounded-lg border bg-muted/20 p-3 text-xs">
                                    {JSON.stringify(deposit.provider_payload, null, 2)}
                                </pre>
                            </div>
                        ) : null}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminDepositDetail.layout = {
    breadcrumbs: [
        { title: 'Deposit', href: '/deposits' },
        { title: 'Detail', href: '#' },
    ],
};
