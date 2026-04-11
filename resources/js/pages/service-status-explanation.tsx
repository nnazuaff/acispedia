import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/i18n/i18n-provider';

export default function ServiceStatusExplanationPage() {
    const { t } = useI18n();

    return (
        <>
            <Head title={t('Penjelasan Status Layanan')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader>
                        <Heading
                            title={t('Penjelasan Status Layanan')}
                            description={t('Arti status pesanan/deposit & panduan singkat.')}
                        />
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div className="space-y-2">
                            <div className="font-medium">{t('Status')}</div>
                            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                                <li>
                                    <span className="font-medium text-foreground">Pending</span>: {t('Pesanan/deposit sedang dalam antrian di server.')}
                                </li>
                                <li>
                                    <span className="font-medium text-foreground">Processing</span>: {t('Pesanan sedang dalam proses.')}
                                </li>
                                <li>
                                    <span className="font-medium text-foreground">Success</span>: {t('Pesanan telah berhasil.')}
                                </li>
                                <li>
                                    <span className="font-medium text-foreground">Partial</span>: {t('Pesanan sudah terproses tapi tercancel. Anda hanya akan membayar layanan yang masuk saja.')}
                                </li>
                                <li>
                                    <span className="font-medium text-foreground">Error</span>: {t('Pesanan dibatalkan, dan saldo akan otomatis kembali ke akun.')}
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-2">
                            <CardTitle className="text-base">{t('Mengapa bisa Partial?')}</CardTitle>

                            <div className="space-y-3 text-muted-foreground">
                                <div>
                                    <span className="font-medium text-foreground">{t('Limit')}</span>: {t('Contoh jika satu layanan dengan maksimal 1.000 followers, kemudian Anda membeli 1.000 followers 2x di akun yang sama, kemungkinan besar akan terjadi partial. Karena akun (followers) yang ada di server tersebut hanya 1.000 followers. Jadi Anda tidak bisa mengirim 2.000 followers walaupun dengan cara 1.000 2x pemesanan. Jika hal ini terjadi, silakan gunakan server (layanan) lainnya. Hal ini tidak berpengaruh jika berbeda akun.')}
                                </div>

                                <div>
                                    <span className="font-medium text-foreground">{t('Server overload')}</span>: {t('Overload biasanya terjadi di layanan yang murah. Karena murah terlalu banyak pesanan yang masuk sehingga terjadi overload dan partial. Untuk pesanan partial, sisa saldo layanan yang tidak masuk akan otomatis kembali ke akun.')}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <CardTitle className="text-base">{t('Garansi (Refill)')}</CardTitle>
                            <div className="text-muted-foreground">
                                {t('Refill adalah isi ulang. Jika Anda membeli layanan refill dan ternyata dalam beberapa hari followers berkurang, maka jika pesanan Anda drop/turun Anda bisa lapor melalui tiket dengan menyertakan ID order dan request refill. Jika nama layanan auto refill Anda tidak perlu lapor ke admin karena proses refill otomatis, tapi jika dalam 2x24 jam belum refill maka Anda bisa lapor ke admin.')}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ServiceStatusExplanationPage.layout = {
    breadcrumbs: [
        {
            title: 'Penjelasan Status Layanan',
            href: '/penjelasan-status-layanan',
        },
    ],
};
