import { CheckCircle2, Sparkles } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/i18n/i18n-provider';

const points = [
    'Proses otomatis 24/7 untuk pesanan yang konsisten',
    'Harga kompetitif untuk berbagai kebutuhan promosi',
    'Dashboard modern & mobile-friendly untuk monitoring',
    'Riwayat pesanan transparan dan mudah dilacak',
] as const;

export default function LandingWhyChooseUs() {
    const { t } = useI18n();
    return (
        <section id="about" className="py-16 sm:py-20">
            <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8">
                <div>
                    <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                        {t('Kenapa pilih AcisPedia?')}
                    </h2>
                    <p className="mt-3 text-pretty text-muted-foreground">
                        {t(
                            'AcisPedia adalah platform SMM (Social Media Marketing) yang membantu Anda meningkatkan jangkauan dan kredibilitas akun secara mudah. Dengan sistem otomatis, pesanan diproses cepat, aman, dan transparan.'
                        )}
                    </p>

                    <div className="mt-6 grid gap-3">
                        {points.map((point) => (
                            <div key={point} className="flex gap-3">
                                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                                <p className="text-sm text-muted-foreground">
                                    {t(point)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:justify-self-end">
                    <Card className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent" />
                        <CardHeader className="relative">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                                    <Sparkles className="size-5" />
                                </span>
                                <CardTitle className="text-base">
                                    {t('Keunggulan yang terasa')}
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="grid gap-4">
                                <div className="rounded-lg border bg-card p-4">
                                    <div className="text-sm font-medium">
                                        {t('Struktur layanan jelas')}
                                    </div>
                                    <div className="mt-1 text-sm text-muted-foreground">
                                        {t(
                                            'Pilih kategori, tentukan target, dan pantau status dalam satu alur.'
                                        )}
                                    </div>
                                </div>
                                <div className="rounded-lg border bg-card p-4">
                                    <div className="text-sm font-medium">
                                        {t('Monitoring yang rapi')}
                                    </div>
                                    <div className="mt-1 text-sm text-muted-foreground">
                                        {t(
                                            'Update status dan riwayat pesanan mudah dicari kapan saja.'
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}
