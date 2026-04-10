import { Head, router, usePage } from '@inertiajs/react';
import * as React from 'react';

import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/i18n/i18n-provider';

type Filters = {
    date_from: string;
    date_to: string;
    id?: number | null;
};

type ProviderState = {
    medanpedia: {
        configured: boolean;
        balance: number | null;
    };
};

type RecordRow = {
    id: number;
    report_date: string;
    vendor_medanpedia: number;
    bank_bri: number;
    bank_bni: number;
    bank_bca: number;
    wallet_ovo: number;
    wallet_dana: number;
    wallet_gojek: number;
    wallet_other: number;
    cash_on_hand: number;
    total_receivables: number;
    total_financial: number;
    customer_balance: number;
    difference_amount: number;
    updated_by: string | null;
    created_at_wib: string | null;
};

type EditingRecord = {
    id: number;
    report_date: string;
    vendor_medanpedia: number;
    bank_bri: number;
    bank_bni: number;
    bank_bca: number;
    wallet_ovo: number;
    wallet_dana: number;
    wallet_gojek: number;
    wallet_other: number;
    cash_on_hand: number;
    total_receivables: number;
};

function formatNumber(value: number): string {
    return new Intl.NumberFormat('id-ID').format(value);
}

function sanitizeNonNegativeInt(value: unknown): number {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) return 0;
    return Math.round(n);
}

export default function AdminFinancialReport() {
    const { t } = useI18n();

    const { filters, records, editing, customer_balance, provider } = usePage().props as any as {
        filters: Filters;
        records: RecordRow[];
        editing: EditingRecord | null;
        customer_balance: number;
        provider: { medanpedia: ProviderState['medanpedia'] };
    };

    const [dateFrom, setDateFrom] = React.useState(filters?.date_from ?? '');
    const [dateTo, setDateTo] = React.useState(filters?.date_to ?? '');

    React.useEffect(() => {
        setDateFrom(filters?.date_from ?? '');
        setDateTo(filters?.date_to ?? '');
    }, [filters?.date_from, filters?.date_to]);

    const isEditing = Boolean(editing?.id);

    const [reportDate, setReportDate] = React.useState<string>(editing?.report_date ?? (filters?.date_from ?? ''));
    const [vendorMedanpedia, setVendorMedanpedia] = React.useState<number>(editing?.vendor_medanpedia ?? 0);
    const [bankBri, setBankBri] = React.useState<number>(editing?.bank_bri ?? 0);
    const [bankBni, setBankBni] = React.useState<number>(editing?.bank_bni ?? 0);
    const [bankBca, setBankBca] = React.useState<number>(editing?.bank_bca ?? 0);
    const [walletOvo, setWalletOvo] = React.useState<number>(editing?.wallet_ovo ?? 0);
    const [walletDana, setWalletDana] = React.useState<number>(editing?.wallet_dana ?? 0);
    const [walletGojek, setWalletGojek] = React.useState<number>(editing?.wallet_gojek ?? 0);
    const [walletOther, setWalletOther] = React.useState<number>(editing?.wallet_other ?? 0);
    const [cashOnHand, setCashOnHand] = React.useState<number>(editing?.cash_on_hand ?? 0);
    const [totalReceivables, setTotalReceivables] = React.useState<number>(editing?.total_receivables ?? 0);

    React.useEffect(() => {
        if (editing) {
            setReportDate(editing.report_date ?? (filters?.date_from ?? ''));
            setVendorMedanpedia(editing.vendor_medanpedia ?? 0);
            setBankBri(editing.bank_bri ?? 0);
            setBankBni(editing.bank_bni ?? 0);
            setBankBca(editing.bank_bca ?? 0);
            setWalletOvo(editing.wallet_ovo ?? 0);
            setWalletDana(editing.wallet_dana ?? 0);
            setWalletGojek(editing.wallet_gojek ?? 0);
            setWalletOther(editing.wallet_other ?? 0);
            setCashOnHand(editing.cash_on_hand ?? 0);
            setTotalReceivables(editing.total_receivables ?? 0);
        } else {
            setReportDate(filters?.date_from ?? '');
            setVendorMedanpedia(0);
            setBankBri(0);
            setBankBni(0);
            setBankBca(0);
            setWalletOvo(0);
            setWalletDana(0);
            setWalletGojek(0);
            setWalletOther(0);
            setCashOnHand(0);
            setTotalReceivables(0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editing?.id]);

    const totalFinancial =
        sanitizeNonNegativeInt(vendorMedanpedia) +
        sanitizeNonNegativeInt(bankBri) +
        sanitizeNonNegativeInt(bankBni) +
        sanitizeNonNegativeInt(bankBca) +
        sanitizeNonNegativeInt(walletOvo) +
        sanitizeNonNegativeInt(walletDana) +
        sanitizeNonNegativeInt(walletGojek) +
        sanitizeNonNegativeInt(walletOther) +
        sanitizeNonNegativeInt(cashOnHand) +
        sanitizeNonNegativeInt(totalReceivables);

    const differenceAmount = totalFinancial - sanitizeNonNegativeInt(customer_balance);

    function applyDateFilter() {
        router.get(
            '/financial-report',
            { date_from: dateFrom, date_to: dateTo } as any,
            { preserveScroll: true, preserveState: true, replace: true }
        );
    }

    function startEdit(id: number) {
        router.get(
            '/financial-report',
            { date_from: dateFrom, date_to: dateTo, id } as any,
            { preserveScroll: true, preserveState: true, replace: true }
        );
    }

    function cancelEdit() {
        router.get(
            '/financial-report',
            { date_from: dateFrom, date_to: dateTo } as any,
            { preserveScroll: true, preserveState: true, replace: true }
        );
    }

    function submit() {
        const payload = {
            report_date: reportDate,
            vendor_medanpedia: sanitizeNonNegativeInt(vendorMedanpedia),
            bank_bri: sanitizeNonNegativeInt(bankBri),
            bank_bni: sanitizeNonNegativeInt(bankBni),
            bank_bca: sanitizeNonNegativeInt(bankBca),
            wallet_ovo: sanitizeNonNegativeInt(walletOvo),
            wallet_dana: sanitizeNonNegativeInt(walletDana),
            wallet_gojek: sanitizeNonNegativeInt(walletGojek),
            wallet_other: sanitizeNonNegativeInt(walletOther),
            cash_on_hand: sanitizeNonNegativeInt(cashOnHand),
            total_receivables: sanitizeNonNegativeInt(totalReceivables),
        };

        if (isEditing && editing?.id) {
            router.put(`/financial-report/${editing.id}`, payload as any, {
                preserveScroll: true,
                preserveState: true,
            });
            return;
        }

        router.post('/financial-report', payload as any, {
            preserveScroll: true,
            preserveState: true,
        });
    }

    function destroy(id: number) {
        const ok = window.confirm(t('Hapus data laporan keuangan ini?'));
        if (!ok) return;

        router.delete(`/financial-report/${id}`, {
            preserveScroll: true,
            preserveState: true,
        } as any);
    }

    const rows = Array.isArray(records) ? records : [];

    return (
        <>
            <Head title={t('Laporan Keuangan')} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading variant="small" title={t('Laporan Keuangan')} description={t('Kelola laporan keuangan harian seperti SMM-Panel.')} />

                <div className="grid gap-3 md:grid-cols-3">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Saldo Medanpedia')}</div>
                            <div className="mt-2 text-2xl font-semibold">
                                {provider?.medanpedia?.configured
                                    ? `Rp ${formatNumber(provider?.medanpedia?.balance ?? 0)}`
                                    : t('Belum dikonfigurasi')}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Saldo Customer (Total)')}</div>
                            <div className="mt-2 text-2xl font-semibold">Rp {formatNumber(customer_balance ?? 0)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Dicek Pada')}</div>
                            <div className="mt-2 text-sm font-semibold">{new Date().toLocaleString('id-ID')}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                            <div>
                                <Label htmlFor="date_from">{t('Dari Tanggal')}</Label>
                                <Input id="date_from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                            </div>
                            <div>
                                <Label htmlFor="date_to">{t('Sampai Tanggal')}</Label>
                                <Input id="date_to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                            </div>
                            <div className="flex items-end">
                                <Button onClick={applyDateFilter}>{t('Terapkan')}</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="text-sm font-semibold">
                                {isEditing ? t('Edit Data') : t('Tambah Data')}
                            </div>
                            {isEditing ? (
                                <Button variant="outline" onClick={cancelEdit}>
                                    {t('Batal')}
                                </Button>
                            ) : null}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <Label htmlFor="report_date">{t('Tanggal')}</Label>
                                <Input id="report_date" type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} />
                            </div>

                            <div>
                                <Label htmlFor="vendor_medanpedia">{t('Saldo Medanpedia')}</Label>
                                <Input
                                    id="vendor_medanpedia"
                                    inputMode="numeric"
                                    value={String(vendorMedanpedia)}
                                    onChange={(e) => setVendorMedanpedia(sanitizeNonNegativeInt(e.target.value))}
                                />
                            </div>

                            <div>
                                <Label htmlFor="bank_bri">{t('Bank BRI')}</Label>
                                <Input id="bank_bri" inputMode="numeric" value={String(bankBri)} onChange={(e) => setBankBri(sanitizeNonNegativeInt(e.target.value))} />
                            </div>
                            <div>
                                <Label htmlFor="bank_bni">{t('Bank BNI')}</Label>
                                <Input id="bank_bni" inputMode="numeric" value={String(bankBni)} onChange={(e) => setBankBni(sanitizeNonNegativeInt(e.target.value))} />
                            </div>
                            <div>
                                <Label htmlFor="bank_bca">{t('Bank BCA')}</Label>
                                <Input id="bank_bca" inputMode="numeric" value={String(bankBca)} onChange={(e) => setBankBca(sanitizeNonNegativeInt(e.target.value))} />
                            </div>

                            <div>
                                <Label htmlFor="wallet_ovo">{t('Saldo OVO')}</Label>
                                <Input id="wallet_ovo" inputMode="numeric" value={String(walletOvo)} onChange={(e) => setWalletOvo(sanitizeNonNegativeInt(e.target.value))} />
                            </div>
                            <div>
                                <Label htmlFor="wallet_dana">{t('Saldo DANA')}</Label>
                                <Input id="wallet_dana" inputMode="numeric" value={String(walletDana)} onChange={(e) => setWalletDana(sanitizeNonNegativeInt(e.target.value))} />
                            </div>
                            <div>
                                <Label htmlFor="wallet_gojek">{t('Saldo GOJEK')}</Label>
                                <Input id="wallet_gojek" inputMode="numeric" value={String(walletGojek)} onChange={(e) => setWalletGojek(sanitizeNonNegativeInt(e.target.value))} />
                            </div>
                            <div>
                                <Label htmlFor="wallet_other">{t('Lainnya')}</Label>
                                <Input id="wallet_other" inputMode="numeric" value={String(walletOther)} onChange={(e) => setWalletOther(sanitizeNonNegativeInt(e.target.value))} />
                            </div>

                            <div>
                                <Label htmlFor="cash_on_hand">{t('Uang Cash')}</Label>
                                <Input id="cash_on_hand" inputMode="numeric" value={String(cashOnHand)} onChange={(e) => setCashOnHand(sanitizeNonNegativeInt(e.target.value))} />
                            </div>
                            <div>
                                <Label htmlFor="total_receivables">{t('Total Piutang')}</Label>
                                <Input id="total_receivables" inputMode="numeric" value={String(totalReceivables)} onChange={(e) => setTotalReceivables(sanitizeNonNegativeInt(e.target.value))} />
                            </div>
                        </div>

                        <div className="mt-4 grid gap-3 md:grid-cols-3">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Total Keuangan')}</div>
                                    <div className="mt-2 text-2xl font-semibold">Rp {formatNumber(totalFinancial)}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Saldo Customer')}</div>
                                    <div className="mt-2 text-2xl font-semibold">Rp {formatNumber(customer_balance ?? 0)}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Selisih')}</div>
                                    <div className="mt-2 text-2xl font-semibold">Rp {formatNumber(differenceAmount)}</div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                            <Button onClick={submit}>{isEditing ? t('Simpan') : t('Tambah')}</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="text-sm font-semibold">{t('Riwayat')}</div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto rounded-lg border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-muted/20">
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Tanggal')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Total')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Saldo Customer')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Selisih')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Update Oleh')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Dibuat')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Aksi')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.length === 0 ? (
                                        <tr>
                                            <td className="px-4 py-6 text-center text-muted-foreground" colSpan={7}>
                                                {t('Tidak ada data.')}
                                            </td>
                                        </tr>
                                    ) : (
                                        rows.map((row) => (
                                            <tr key={row.id} className="border-t">
                                                <td className="px-4 py-3 whitespace-nowrap">{row.report_date}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">Rp {formatNumber(row.total_financial ?? 0)}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">Rp {formatNumber(row.customer_balance ?? 0)}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">Rp {formatNumber(row.difference_amount ?? 0)}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{row.updated_by ?? '-'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{row.created_at_wib ?? '-'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant="outline" onClick={() => startEdit(row.id)}>
                                                            {t('Edit')}
                                                        </Button>
                                                        <Button size="sm" variant="destructive" onClick={() => destroy(row.id)}>
                                                            {t('Hapus')}
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminFinancialReport.layout = {
    breadcrumbs: [
        {
            title: 'Laporan Keuangan',
            href: '/financial-report',
        },
    ],
};
