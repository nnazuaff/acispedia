import { Head } from '@inertiajs/react';
import * as React from 'react';
import { ChevronDown, Send } from 'lucide-react';

import Heading from '@/components/heading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useI18n } from '@/i18n/i18n-provider';
import { cn } from '@/lib/utils';

type Faq = {
    question: string;
    answer: string;
};

const faqs: Faq[] = [
    {
        question: 'Berapa lama waktu pemrosesan pesanan?',
        answer:
            'Sebagian besar pesanan diproses dalam 1-30 menit. Waktu pemrosesan dapat bervariasi tergantung pada jenis layanan dan beban server.',
    },
    {
        question: 'Apakah layanan ini aman untuk akun saya?',
        answer:
            'Ya, kami menggunakan metode yang aman dan sesuai dengan ketentuan layanan platform. Namun, kami selalu menyarankan untuk tidak berlebihan dalam penggunaan.',
    },
    {
        question: 'Bagaimana cara melakukan pembayaran?',
        answer:
            'Kami menerima berbagai metode pembayaran termasuk bank transfer, e-wallet, dan QRIS. Deposit otomatis umumnya masuk dalam 1-5 menit.',
    },
    {
        question: 'Apakah ada garansi untuk layanan?',
        answer:
            'Ya, kami memberikan garansi sesuai deskripsi layanan. Jika terjadi drop atau masalah, hubungi support untuk refill atau refund (sesuai kebijakan).',
    },
];

export function ContactContent(
    { headingVariant = 'default' }: { headingVariant?: 'default' | 'small' } = {},
) {
    const { t } = useI18n();

    return (
        <div className="mx-auto w-full max-w-5xl space-y-6">
            <Heading
                variant={headingVariant}
                title={t('Hubungi Kami')}
                description={t(
                    'Tim support kami siap membantu Anda. Jangan ragu untuk menghubungi kami kapan saja.'
                )}
            />

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            {t('Informasi Kontak')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            {t(
                                'Kami selalu siap membantu Anda dengan berbagai pertanyaan seputar layanan SMM Panel. Hubungi kami melalui channel yang tersedia di bawah ini.'
                            )}
                        </p>

                        <div className="grid gap-3">
                            <a
                                href="https://t.me/acispediasupport"
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between rounded-md border bg-background px-4 py-3 text-sm hover:bg-accent"
                            >
                                <div className="flex items-center gap-3">
                                    <Send className="size-4 text-primary" />
                                    <div className="leading-tight">
                                        <div className="font-medium text-foreground">Telegram</div>
                                        <div className="text-muted-foreground">@acispediasupport</div>
                                    </div>
                                </div>
                                <span className="text-muted-foreground">
                                    {t('Layanan Pelanggan')}
                                </span>
                            </a>

                            <a
                                href="https://t.me/acispediasmm"
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between rounded-md border bg-background px-4 py-3 text-sm hover:bg-accent"
                            >
                                <div className="flex items-center gap-3">
                                    <Send className="size-4 text-primary" />
                                    <div className="leading-tight">
                                        <div className="font-medium text-foreground">
                                            {t('Channel Telegram')}
                                        </div>
                                        <div className="text-muted-foreground">@acispediasmm</div>
                                    </div>
                                </div>
                                <span className="text-muted-foreground">
                                    {t('Info & Pembaruan')}
                                </span>
                            </a>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            {t('Jam Operasional')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    {t('Senin - Jumat')}
                                </span>
                                <span className="font-medium">09:00 - 20:00 WIB</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    {t('Sabtu & Minggu')}
                                </span>
                                <span className="font-medium">{t('Libur')}</span>
                            </div>
                            <p className="pt-2 text-xs text-muted-foreground">
                                {t(
                                    'Jika di luar jam operasional, pesan tetap diterima dan akan dibalas saat jam kerja.'
                                )}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">
                        {t('Pertanyaan Sering Diajukan')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {faqs.map((faq) => (
                        <FaqItem key={faq.question} faq={faq} />
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

function FaqItem({ faq }: { faq: Faq }) {
    const { t } = useI18n();
    const [open, setOpen] = React.useState(false);

    return (
        <Collapsible open={open} onOpenChange={setOpen} className="rounded-md border">
            <CollapsibleTrigger asChild>
                <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium hover:bg-accent"
                >
                    <span className="text-foreground">{t(faq.question)}</span>
                    <ChevronDown
                        className={cn(
                            'size-4 shrink-0 text-muted-foreground transition-transform',
                            open && 'rotate-180',
                        )}
                        aria-hidden="true"
                    />
                </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4 text-sm text-muted-foreground">
                {t(faq.answer)}
            </CollapsibleContent>
        </Collapsible>
    );
}

export default function PublicContact() {
    const { t } = useI18n();

    return (
        <>
            <Head title={t('Kontak')} />
            <ContactContent />
        </>
    );
}
