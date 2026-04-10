import { Head } from '@inertiajs/react';

import Heading from '@/components/heading';
import { Card, CardContent } from '@/components/ui/card';

export default function PublicTerms() {
    return (
        <>
            <Head title="Syarat & Ketentuan" />

            <div className="space-y-6">
                <Heading
                    title="Syarat & Ketentuan"
                    description="Terakhir diperbarui: 5 Januari 2026"
                />

                <Card>
                    <CardContent className="space-y-6 pt-6">
                        <p className="text-sm text-muted-foreground">
                            Dokumen ini mengatur penggunaan layanan AcisPedia - SMM
                            Panel (selanjutnya disebut “Layanan”). Dengan mengakses
                            atau menggunakan Layanan, Anda menyetujui Syarat &amp;
                            Ketentuan ini. Jika Anda tidak setuju, mohon untuk tidak
                            menggunakan Layanan.
                        </p>

                        <section className="space-y-3">
                            <h2 className="text-base font-semibold">Umum</h2>
                            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                <li>
                                    Dengan memesan atau membeli pesanan di AcisPedia,
                                    Anda menyetujui semua peraturan yang ada, baik
                                    Anda membacanya maupun tidak.
                                </li>
                                <li>
                                    AcisPedia berhak mengubah peraturan yang ada
                                    tanpa pemberitahuan sebelumnya. Kami menyarankan
                                    Anda untuk membaca ketentuan sebelum
                                    memesan/membeli agar selalu mengikuti perubahan
                                    terbaru.
                                </li>
                                <li>
                                    Disclaimer: AcisPedia tidak bertanggung jawab
                                    atas kerusakan pada akun Anda atau bisnis Anda.
                                </li>
                                <li>
                                    Liabilities: AcisPedia tidak bertanggung jawab
                                    atas suspend akun atau penghapusan konten/foto
                                    oleh Instagram/Twitter/platform lain.
                                </li>
                                <li>
                                    Liabilities: AcisPedia tidak bertanggung jawab
                                    jika Anda memasukkan nomor HP/data yang salah.
                                </li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-base font-semibold">Layanan</h2>
                            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                <li>
                                    Kami tidak menjamin pengikut baru akan
                                    berinteraksi dengan Anda. Namun, pada
                                    layanan/servers tertentu kami memberikan garansi
                                    (sesuai deskripsi layanan) jika jumlah berkurang
                                    dalam kurun waktu yang ditentukan.
                                </li>
                                <li>Kami tidak dapat membatalkan pesanan yang sudah masuk.</li>
                                <li>
                                    Hindari pesanan ganda (double). Tunggu pesanan
                                    selesai terlebih dahulu sebelum membuat pesanan
                                    baru. Kami tidak bertanggung jawab jika aturan
                                    ini tidak diikuti.
                                </li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-base font-semibold">
                                Pembayaran / Kebijakan Pengembalian
                            </h2>
                            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                <li>
                                    Saldo/deposit yang sudah berhasil masuk tidak
                                    dapat diuangkan kembali (non-refundable). Saldo
                                    hanya dapat digunakan untuk membeli layanan yang
                                    tersedia di AcisPedia.
                                </li>
                                <li>
                                    Anda setuju bahwa setelah menyelesaikan
                                    pembayaran, Anda tidak akan mengajukan sengketa
                                    atau tagihan balik (chargeback) terhadap kami
                                    untuk alasan apa pun.
                                </li>
                                <li>
                                    Jika Anda mengajukan sengketa/tagihan terhadap
                                    kami setelah deposit, kami berhak mengakhiri
                                    pesanan Anda yang akan datang, memblokir akun
                                    Anda dari situs kami, serta mengambil kembali
                                    layanan yang telah dikirim ke akun Anda atau
                                    klien Anda.
                                </li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-base font-semibold">1. Kelayakan &amp; Akun</h2>
                            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                <li>
                                    Anda bertanggung jawab menjaga kerahasiaan
                                    kredensial akun dan seluruh aktivitas yang terjadi
                                    pada akun Anda.
                                </li>
                                <li>
                                    Anda wajib memberikan informasi yang akurat dan
                                    terbaru saat registrasi maupun saat menggunakan
                                    Layanan.
                                </li>
                                <li>
                                    Kami dapat menangguhkan atau menghentikan akun
                                    yang diduga melanggar ketentuan atau menimbulkan
                                    risiko keamanan.
                                </li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-base font-semibold">
                                2. Layanan, Pesanan, dan Ketersediaan
                            </h2>
                            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                <li>
                                    Layanan yang tersedia dapat berubah sewaktu-waktu
                                    (harga, deskripsi, minimal/maksimal, estimasi
                                    waktu).
                                </li>
                                <li>
                                    Kami berupaya memberikan hasil sesuai deskripsi,
                                    namun hasil dapat dipengaruhi kebijakan/platform
                                    pihak ketiga (mis. Instagram, TikTok, YouTube).
                                </li>
                                <li>
                                    Anda wajib memasukkan link/username/ID yang valid.
                                    Kesalahan input dapat menyebabkan pesanan gagal
                                    atau tidak dapat diproses.
                                </li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-base font-semibold">
                                3. Pembayaran, Saldo, dan Transaksi
                            </h2>
                            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                <li>
                                    Pemakaian layanan dibayar dengan pemotongan saldo
                                    sesuai harga yang tampil saat pesanan dibuat.
                                </li>
                                <li>
                                    Saldo yang sudah dikreditkan umumnya tidak dapat
                                    ditarik tunai/diuangkan kembali, kecuali
                                    dinyatakan lain oleh kebijakan khusus.
                                </li>
                                <li>
                                    Kami dapat melakukan verifikasi transaksi untuk
                                    mencegah penipuan atau penyalahgunaan.
                                </li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-base font-semibold">
                                4. Kebijakan Pengembalian (Refund)
                            </h2>
                            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                <li>
                                    Apabila terdapat pengembalian karena pesanan
                                    gagal/parsial atau sesuai ketentuan layanan
                                    tertentu, pengembalian dilakukan dalam bentuk
                                    saldo akun (bukan uang tunai).
                                </li>
                                <li>
                                    Permintaan pengembalian harus disertai bukti yang
                                    memadai dan diajukan dalam waktu yang wajar
                                    setelah masalah terjadi.
                                </li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-base font-semibold">5. Penggunaan yang Dilarang</h2>
                            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                <li>
                                    Dilarang menggunakan Layanan untuk aktivitas
                                    ilegal, penipuan, phishing, atau pelanggaran hak
                                    pihak ketiga.
                                </li>
                                <li>
                                    Dilarang mencoba akses tanpa izin, mengganggu
                                    operasional, atau mengeksploitasi celah keamanan.
                                </li>
                                <li>
                                    Dilarang melakukan chargeback/pembayaran tidak sah
                                    atau manipulasi transaksi.
                                </li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-base font-semibold">6. Platform Pihak Ketiga</h2>
                            <p className="text-sm text-muted-foreground">
                                Layanan dapat bergantung pada atau terhubung dengan
                                platform pihak ketiga. Kami tidak bertanggung jawab
                                atas kebijakan atau perubahan sistem pada platform
                                pihak ketiga tersebut.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-base font-semibold">7. Batasan Tanggung Jawab</h2>
                            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                <li>
                                    Kami tidak menjamin hasil spesifik (misalnya
                                    peningkatan penjualan/engagement) karena ada
                                    faktor di luar kendali kami.
                                </li>
                                <li>
                                    Sejauh diizinkan oleh hukum, tanggung jawab kami
                                    dibatasi sebesar nilai saldo/pesanan terkait yang
                                    dipersengketakan.
                                </li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-base font-semibold">8. Perubahan Ketentuan</h2>
                            <p className="text-sm text-muted-foreground">
                                Kami dapat memperbarui Syarat &amp; Ketentuan ini dari
                                waktu ke waktu. Versi terbaru akan dipublikasikan di
                                halaman ini.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-base font-semibold">9. Kontak</h2>
                            <p className="text-sm text-muted-foreground">
                                Jika Anda memiliki pertanyaan tentang Syarat &amp;
                                Ketentuan ini, silakan hubungi kami melalui channel
                                support resmi yang tersedia.
                            </p>
                        </section>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
