import { Head } from '@inertiajs/react';

import Heading from '@/components/heading';
import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '@/i18n/i18n-provider';

export default function PublicPrivacy() {
    const { t } = useI18n();

    return (
        <>
            <Head title={t('Kebijakan Privasi')} />

            <div className="space-y-6">
                <Heading
                    title={t('Kebijakan Privasi')}
                    description={t('Terakhir diperbarui: 5 Januari 2026')}
                />

                <Card>
                    <CardContent className="space-y-6 pt-6">
                        <p className="text-sm text-muted-foreground">
                            {t(
                                'Kebijakan Privasi ini menjelaskan bagaimana AcisPedia - SMM Panel ("kami") mengumpulkan, menggunakan, menyimpan, dan melindungi informasi Anda saat Anda menggunakan layanan kami.'
                            )}
                        </p>

                        <section className="space-y-3">
                            <h2 className="text-base font-semibold">
                                {t('1. Informasi yang Kami Kumpulkan')}
                            </h2>
                            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                <li>
                                    <span className="font-medium">
                                        {t('Informasi akun:')}
                                    </span>{' '}
                                    {t(
                                        'seperti nama, email/username, dan detail yang Anda berikan saat registrasi.'
                                    )}
                                </li>
                                <li>
                                    <span className="font-medium">
                                        {t('Informasi transaksi:')}
                                    </span>{' '}
                                    {t(
                                        'catatan deposit, riwayat pesanan, dan status layanan.'
                                    )}
                                </li>
                                <li>
                                    <span className="font-medium">
                                        {t('Data teknis:')}
                                    </span>{' '}
                                    {t(
                                        'alamat IP, jenis perangkat/browser, dan log akses untuk keamanan serta analitik dasar.'
                                    )}
                                </li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-base font-semibold">
                                {t('2. Cara Kami Menggunakan Informasi')}
                            </h2>
                            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                <li>
                                    {t(
                                        'Untuk menyediakan dan menjalankan layanan, termasuk memproses pesanan dan transaksi.'
                                    )}
                                </li>
                                <li>
                                    {t(
                                        'Keamanan: untuk mencegah penipuan, penyalahgunaan, dan aktivitas mencurigakan.'
                                    )}
                                </li>
                                <li>
                                    {t(
                                        'Dukungan pelanggan: untuk merespons pertanyaan dan permintaan melalui channel yang tersedia.'
                                    )}
                                </li>
                                <li>
                                    {t(
                                        'Peningkatan layanan: untuk meningkatkan performa, stabilitas, dan pengalaman pengguna.'
                                    )}
                                </li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-base font-semibold">
                                {t('3. Cookie & Local Storage')}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {t(
                                    'Kami dapat menggunakan cookie atau local storage untuk menjaga sesi login dan preferensi dasar.'
                                )}{' '}
                                {t(
                                    'Anda dapat menonaktifkan cookie melalui pengaturan browser, namun beberapa fitur mungkin tidak berfungsi dengan baik.'
                                )}
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-base font-semibold">
                                {t('4. Berbagi Data dengan Pihak Ketiga')}
                            </h2>
                            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                <li>
                                    {t(
                                        'Kami dapat menggunakan penyedia pihak ketiga untuk pembayaran atau infrastruktur teknis.'
                                    )}
                                </li>
                                <li>{t('Kami tidak menjual data pribadi Anda.')}</li>
                                <li>
                                    {t(
                                        'Data dapat dibagikan jika diwajibkan oleh hukum atau untuk melindungi hak dan keamanan layanan.'
                                    )}
                                </li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-base font-semibold">
                                {t('5. Retensi Data')}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {t(
                                    'Kami menyimpan data selama diperlukan untuk menyediakan layanan, memenuhi kewajiban hukum, menyelesaikan sengketa, dan menegakkan ketentuan.'
                                )}
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-base font-semibold">
                                {t('6. Keamanan')}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {t(
                                    'Kami menerapkan langkah keamanan yang wajar untuk melindungi data dari akses tidak sah.'
                                )}{' '}
                                {t(
                                    'Namun, tidak ada sistem yang 100% aman; Anda juga bertanggung jawab untuk menjaga keamanan akun Anda.'
                                )}
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-base font-semibold">
                                {t('7. Hak Anda')}
                            </h2>
                            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                <li>
                                    {t(
                                        'Anda dapat memperbarui informasi akun Anda melalui fitur yang tersedia.'
                                    )}
                                </li>
                                <li>
                                    {t(
                                        'Anda dapat meminta bantuan terkait data akun Anda melalui channel dukungan resmi.'
                                    )}
                                </li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-base font-semibold">
                                {t('8. Perubahan Kebijakan Ini')}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {t(
                                    'Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Versi terbaru akan dipublikasikan di halaman ini.'
                                )}
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-base font-semibold">
                                {t('9. Kontak')}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {t(
                                    'Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami melalui channel dukungan resmi.'
                                )}
                            </p>
                        </section>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
