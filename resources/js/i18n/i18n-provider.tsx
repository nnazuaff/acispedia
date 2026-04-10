import * as React from 'react';

export type Locale = 'id' | 'en';

type Dict = Record<string, string>;

type I18nContextValue = {
    locale: Locale;
    setLocale: (next: Locale) => void;
    t: (key: string) => string;
};

const I18nContext = React.createContext<I18nContextValue | null>(null);

const dictionaries: Record<Locale, Dict> = {
    id: {
        'nav.dashboard': 'Dashboard',
        'nav.services': 'Layanan',
        'nav.order': 'Order',
        'nav.home': 'Beranda',
        'nav.about': 'Tentang',
        'nav.contact': 'Kontak',
        'nav.menu': 'Menu',
        'nav.theme': 'Tema',
        'auth.login': 'Login',
        'auth.register': 'Register',
        'auth.getStarted': 'Get Started',
        'lang.indonesian': 'Indonesia',
        'lang.english': 'English',
    },
    en: {
        'nav.dashboard': 'Dashboard',
        'nav.services': 'Services',
        'nav.order': 'Orders',
        'nav.home': 'Home',
        'nav.about': 'About',
        'nav.contact': 'Contact',
        'nav.menu': 'Menu',
        'nav.theme': 'Theme',
        'auth.login': 'Login',
        'auth.register': 'Register',
        'auth.getStarted': 'Get Started',
        'lang.indonesian': 'Indonesian',
        'lang.english': 'English',

        // Common
        'Beranda': 'Home',
        'Layanan': 'Services',
        'Kontak': 'Contact',
        'Tentang': 'About',
        'Dashboard': 'Dashboard',
        'Order': 'Orders',
        'Menu': 'Menu',
        'Tema': 'Theme',
        'Kembali': 'Back',
        'Batal': 'Cancel',
        'Tutup': 'Close',
        'Simpan': 'Save',
        'Reset': 'Reset',
        'Terapkan': 'Apply',
        'Detail': 'Details',
        'Riwayat': 'History',
        'Data': 'Rows',
        'Sebelumnya': 'Previous',
        'Berikutnya': 'Next',
        'Minimal': 'Minimum',
        'Maksimal': 'Maximum',
        'Memproses...': 'Processing...',
        'Lanjutkan': 'Continue',

        // Services
        'Cari dan lihat daftar layanan.': 'Browse and search available services.',
        'Kategori': 'Category',
        'Semua kategori': 'All categories',
        'Urutkan': 'Sort',
        'Default': 'Default',
        'Harga: Termurah': 'Price: Lowest',
        'Harga: Termahal': 'Price: Highest',
        'Nama: A-Z': 'Name: A-Z',
        'Nama: Z-A': 'Name: Z-A',
        'Cari layanan atau kategori...': 'Search services or categories...',
        'Memuat layanan...': 'Loading services...',
        'Harga/K': 'Price/K',
        'Min': 'Min',
        'Maks': 'Max',
        'Waktu': 'Time',
        'Beli': 'Buy',
        'Tidak ada layanan untuk filter saat ini.': 'No services match the current filters.',
        'Detail Layanan': 'Service details',
        'Nama': 'Name',
        'Deskripsi': 'Description',
        'Response tidak valid.': 'Invalid response.',
        'Gagal membuka payload layanan.': 'Failed to decode services payload.',
        'Gagal memuat layanan.': 'Failed to load services.',

        // Deposit
        'Deposit': 'Deposit',
        'Deposit Saldo': 'Top up balance',
        'Riwayat Deposit': 'Deposit History',
        'Detail deposit': 'Deposit detail',
        'Detail Deposit': 'Deposit detail',
        'Isi Saldo': 'Top up',
        'Isi saldo dengan metode pembayaran yang tersedia.': 'Top up your balance using an available payment method.',
        'Batalkan': 'Cancel',
        'Batalkan deposit ini?': 'Cancel this deposit?',
        'Batalkan deposit pending ini?': 'Cancel this pending deposit?',
        'Bayar': 'Pay',
        'Status': 'Status',
        'Tanggal': 'Date',
        'Nominal': 'Amount',
        'Metode': 'Method',
        'Biaya admin': 'Admin fee',
        'Total bayar': 'Total payable',
        'Saldo masuk': 'Balance received',
        'Menunggu': 'Pending',
        'Berhasil': 'Success',
        'Gagal': 'Failed',
        'Kadaluarsa': 'Expired',
        'Dibatalkan': 'Canceled',
        'Daftar deposit saldo Anda.': 'Your balance top up history.',
        'Belum ada deposit.': 'No deposits yet.',
        'Ada deposit pending': 'You have a pending deposit',
        'Saldo saat ini': 'Current balance',
        'Pilih Metode Pembayaran': 'Choose payment method',
        'Pembayaran QRIS otomatis': 'Automatic QRIS payment',
        'Pilih OVO / DANA / ShopeePay': 'Choose OVO / DANA / ShopeePay',
        'Pilih E-Wallet': 'Choose e-wallet',
        'Pilih': 'Select',
        'Pilih Nominal': 'Choose amount',
        'ATAU MASUKKAN NOMINAL MANUAL': 'OR ENTER AMOUNT MANUALLY',
        'ID Deposit': 'Deposit ID',
        'Kadaluarsa pada': 'Expires at',
        'Data tidak ditemukan.': 'Data not found.',
        'Gagal membatalkan deposit.': 'Failed to cancel deposit.',
        'Deposit dibatalkan.': 'Deposit canceled.',
        'Kesalahan tidak diketahui.': 'Unknown error.',
        'Minimal deposit Rp 1.000': 'Minimum deposit is Rp 1,000.',
        'Maksimal deposit Rp 200.000': 'Maximum deposit is Rp 200,000.',
        'Gagal membuat deposit.': 'Failed to create deposit.',
        'Deposit dibuat.': 'Deposit created.',
        'Salin ID': 'Copy ID',
        'Salin tanggal': 'Copy date',
        'Salin total': 'Copy total',
        'Salin kadaluarsa': 'Copy expiry',

        // Dashboard
        'Pengguna': 'User',
        'Selamat Datang': 'Welcome',
        'Kelola pesanan dan pantau aktivitas Anda dari dashboard ini.':
            'Manage orders and monitor your activity from this dashboard.',
        'Saldo Anda': 'Your balance',
        'Saldo tersedia': 'Available balance',
        'Total Pesanan': 'Total orders',
        'Pesanan bulan ini': 'Orders this month',
        'Pesanan Aktif': 'Active orders',
        'Sedang diproses': 'In progress',
        'Pesanan Selesai': 'Completed orders',
        'Berhasil diselesaikan': 'Successfully completed',
        'Total Pengeluaran': 'Total spending',
        'Total yang dibelanjakan': 'Total spent',
        'Aksi Cepat': 'Quick actions',
        'Buat Pesanan': 'Create order',
        'Lihat Layanan': 'View services',

        // Orders / Transactions
        'Riwayat Transaksi': 'Transaction History',
        'Detail Transaksi': 'Transaction details',
        'Riwayat transaksi order Anda.': 'Your order transaction history.',
        'Cari layanan, target, atau provider id...': 'Search service, target, or provider ID...',
        'Target': 'Target',
        'Jumlah': 'Qty',
        'Total': 'Total',
        'Provider ID': 'Provider ID',
        'Aksi': 'Actions',
        'Belum ada transaksi.': 'No transactions yet.',
        'Detail Pesanan': 'Order details',
        'ID Pesanan': 'Order ID',
        'Dibuat': 'Created',
        'Salin target': 'Copy target',
        'Jumlah pesan': 'Quantity',
        'Biaya': 'Cost',
        'Selesai': 'Completed',
        'Diproses': 'Processing',
        'Parsial': 'Partial',
        'Mengirim': 'Submitting',
        'Jumlah awal': 'Start count',
        'Sisa': 'Remains',
        'Charge': 'Charge',

        // Order page
        'Status pesanan diperbarui': 'Order status updated',
        'Layanan berhasil dipilih.': 'Service selected.',
        'Gagal memuat kategori.': 'Failed to load categories.',
        'Pilih layanan, masukkan target, lalu buat pesanan.':
            'Choose a service, enter a target, then place your order.',
        'Form Order': 'Order form',
        'Pilih kategori': 'Choose category',
        'Cari layanan': 'Search services',
        'Ketik nama layanan...': 'Type a service name...',
        'Cari': 'Search',
        'Memuat...': 'Loading...',
        'Pilih layanan': 'Choose service',
        'Jika layanan tidak muncul, gunakan kolom pencarian.':
            'If the service does not appear, use the search field.',
        'Link / Username': 'Link / Username',
        'Bingung pengisian target?': 'Not sure how to fill the target?',
        'klik disini': 'click here',
        'Quantity': 'Quantity',
        'Comments (1 baris = 1 quantity)': 'Comments (1 line = 1 quantity)',
        'Tulis 1 komentar per baris': 'Write 1 comment per line',
        'Baris terisi': 'Lines filled',
        'Harga / 1000': 'Price / 1000',
        'Estimasi': 'Estimated',
        'Informasi': 'Information',
        'Saldo': 'Balance',
        'Pastikan akun tidak private saat order diproses.':
            'Make sure the account is not private while the order is being processed.',
        'Jangan ubah username/tautan selama pesanan berjalan.':
            'Do not change the username/link while the order is running.',
        'Jika order untuk postingan, pastikan post tidak dihapus.':
            'If ordering for a post, make sure the post is not deleted.',
        'Langkah Order': 'Order steps',
        'Pilih kategori dan layanan.': 'Select a category and service.',
        'Masukkan target (link/username).': 'Enter the target (link/username).',
        'Isi quantity sesuai batas min/maks.': 'Enter a quantity within the min/max limits.',
        'Jika layanan butuh comments, isi 1 baris per quantity.':
            'If the service requires comments, enter 1 line per quantity.',
        'Klik “Buat Pesanan”. Status akan update otomatis.':
            'Click “Create order”. Status will update automatically.',
        'Aturan': 'Rules',
        'Pastikan target benar, pesanan tidak bisa dibatalkan setelah diproses.':
            'Make sure the target is correct; orders cannot be canceled after processing starts.',
        'Jangan buat pesanan ganda untuk target yang sama secara bersamaan.':
            'Do not place duplicate orders for the same target at the same time.',
        'Jika ada kendala, cek status beberapa menit kemudian.':
            'If there is an issue, check the status again in a few minutes.',
        'Gunakan layanan dengan bijak. Kesalahan input target/quantity bisa menyebabkan hasil tidak sesuai.':
            'Use services responsibly. Incorrect target/quantity input may cause unexpected results.',
        'Pilih layanan terlebih dahulu.': 'Please choose a service first.',
        'Target wajib diisi.': 'Target is required.',
        'Quantity tidak valid.': 'Invalid quantity.',
        'Jumlah baris komentar harus sama dengan quantity.':
            'The number of comment lines must match the quantity.',
        'Sesi habis. Silakan refresh dan login lagi.':
            'Session expired. Please refresh and log in again.',
        'Saldo tidak cukup.': 'Insufficient balance.',
        'Gagal membuat order.': 'Failed to create order.',
        'Order berhasil dibuat.': 'Order created successfully.',

        // Deposit detail
        'Referensi': 'References',
        'Merchant ref': 'Merchant ref',
        'Reference': 'Reference',
        'Pay code': 'Pay code',
        'Checkout': 'Checkout',
        'Buka': 'Open',
        'Status pembayaran': 'Payment status',

        // Filters
        'Pencarian': 'Search',
        'Cari reference, pay code, atau metode...': 'Search reference, pay code, or method...',
        'Semua': 'All',

        // Auth
        'Register': 'Register',
        'Login': 'Login',
        'Get Started': 'Get Started',

        // Terms
        'Syarat & Ketentuan': 'Terms & Conditions',
        'Terakhir diperbarui: 5 Januari 2026': 'Last updated: January 5, 2026',
        'Dokumen ini mengatur penggunaan layanan AcisPedia - SMM Panel (selanjutnya disebut “Layanan”). Dengan mengakses atau menggunakan Layanan, Anda menyetujui Syarat & Ketentuan ini. Jika Anda tidak setuju, mohon untuk tidak menggunakan Layanan.':
            'This document governs the use of AcisPedia - SMM Panel services (the “Service”). By accessing or using the Service, you agree to these Terms & Conditions. If you do not agree, please do not use the Service.',
        'Umum': 'General',
        'Dengan memesan atau membeli pesanan di AcisPedia, Anda menyetujui semua peraturan yang ada, baik Anda membacanya maupun tidak.':
            'By placing or purchasing an order on AcisPedia, you agree to all applicable rules, whether or not you have read them.',
        'AcisPedia berhak mengubah peraturan yang ada tanpa pemberitahuan sebelumnya. Kami menyarankan Anda untuk membaca ketentuan sebelum memesan/membeli agar selalu mengikuti perubahan terbaru.':
            'AcisPedia reserves the right to change these rules without prior notice. We recommend reviewing the terms before ordering/purchasing to stay up to date with the latest changes.',
        'Disclaimer: AcisPedia tidak bertanggung jawab atas kerusakan pada akun Anda atau bisnis Anda.':
            'Disclaimer: AcisPedia is not responsible for any damage to your account or business.',
        'Liabilities: AcisPedia tidak bertanggung jawab atas suspend akun atau penghapusan konten/foto oleh Instagram/Twitter/platform lain.':
            'Liabilities: AcisPedia is not responsible for account suspensions or content/photo removals by Instagram/Twitter/other platforms.',
        'Liabilities: AcisPedia tidak bertanggung jawab jika Anda memasukkan nomor HP/data yang salah.':
            'Liabilities: AcisPedia is not responsible if you enter an incorrect phone number/data.',
        'Kami tidak menjamin pengikut baru akan berinteraksi dengan Anda. Namun, pada layanan/servers tertentu kami memberikan garansi (sesuai deskripsi layanan) jika jumlah berkurang dalam kurun waktu yang ditentukan.':
            'We do not guarantee that new followers will interact with you. However, for certain services/servers, we provide a guarantee (as described in the service description) if the quantity decreases within the specified period.',
        'Kami tidak dapat membatalkan pesanan yang sudah masuk.': 'We cannot cancel orders that have already been placed.',
        'Hindari pesanan ganda (double). Tunggu pesanan selesai terlebih dahulu sebelum membuat pesanan baru. Kami tidak bertanggung jawab jika aturan ini tidak diikuti.':
            'Avoid duplicate orders. Please wait for your current order to complete before placing a new one. We are not responsible if this rule is not followed.',
        'Pembayaran / Kebijakan Pengembalian': 'Payments / Refund Policy',
        'Saldo/deposit yang sudah berhasil masuk tidak dapat diuangkan kembali (non-refundable). Saldo hanya dapat digunakan untuk membeli layanan yang tersedia di AcisPedia.':
            'Balance/deposits that have been successfully credited are non-refundable. Balance can only be used to purchase services available on AcisPedia.',
        'Anda setuju bahwa setelah menyelesaikan pembayaran, Anda tidak akan mengajukan sengketa atau tagihan balik (chargeback) terhadap kami untuk alasan apa pun.':
            'You agree that after completing payment, you will not file disputes or chargebacks against us for any reason.',
        'Jika Anda mengajukan sengketa/tagihan terhadap kami setelah deposit, kami berhak mengakhiri pesanan Anda yang akan datang, memblokir akun Anda dari situs kami, serta mengambil kembali layanan yang telah dikirim ke akun Anda atau klien Anda.':
            'If you file a dispute/chargeback after a deposit, we reserve the right to terminate your future orders, block your account from our site, and revoke services delivered to your account or your client’s account.',
        '1. Kelayakan & Akun': '1. Eligibility & Account',
        'Anda bertanggung jawab menjaga kerahasiaan kredensial akun dan seluruh aktivitas yang terjadi pada akun Anda.':
            'You are responsible for maintaining the confidentiality of your account credentials and all activities that occur under your account.',
        'Anda wajib memberikan informasi yang akurat dan terbaru saat registrasi maupun saat menggunakan Layanan.':
            'You must provide accurate and up-to-date information during registration and while using the Service.',
        'Kami dapat menangguhkan atau menghentikan akun yang diduga melanggar ketentuan atau menimbulkan risiko keamanan.':
            'We may suspend or terminate accounts suspected of violating these terms or posing security risks.',
        '2. Layanan, Pesanan, dan Ketersediaan': '2. Services, Orders, and Availability',
        'Layanan yang tersedia dapat berubah sewaktu-waktu (harga, deskripsi, minimal/maksimal, estimasi waktu).':
            'Available services may change at any time (pricing, descriptions, minimum/maximum, estimated time).',
        'Kami berupaya memberikan hasil sesuai deskripsi, namun hasil dapat dipengaruhi kebijakan/platform pihak ketiga (mis. Instagram, TikTok, YouTube).':
            'We strive to deliver results as described, but outcomes may be affected by third-party platform policies (e.g., Instagram, TikTok, YouTube).',
        'Anda wajib memasukkan link/username/ID yang valid. Kesalahan input dapat menyebabkan pesanan gagal atau tidak dapat diproses.':
            'You must enter a valid link/username/ID. Incorrect input may cause the order to fail or be unprocessable.',
        '3. Pembayaran, Saldo, dan Transaksi': '3. Payments, Balance, and Transactions',
        'Pemakaian layanan dibayar dengan pemotongan saldo sesuai harga yang tampil saat pesanan dibuat.':
            'Service usage is paid by deducting balance according to the price shown when the order is placed.',
        'Saldo yang sudah dikreditkan umumnya tidak dapat ditarik tunai/diuangkan kembali, kecuali dinyatakan lain oleh kebijakan khusus.':
            'Credited balance generally cannot be withdrawn in cash, unless stated otherwise by a special policy.',
        'Kami dapat melakukan verifikasi transaksi untuk mencegah penipuan atau penyalahgunaan.':
            'We may verify transactions to prevent fraud or misuse.',
        '4. Kebijakan Pengembalian (Refund)': '4. Refund Policy',
        'Apabila terdapat pengembalian karena pesanan gagal/parsial atau sesuai ketentuan layanan tertentu, pengembalian dilakukan dalam bentuk saldo akun (bukan uang tunai).':
            'If a refund is issued due to failed/partial orders or according to specific service terms, refunds are issued as account balance (not cash).',
        'Permintaan pengembalian harus disertai bukti yang memadai dan diajukan dalam waktu yang wajar setelah masalah terjadi.':
            'Refund requests must include sufficient evidence and be submitted within a reasonable time after the issue occurs.',
        '5. Penggunaan yang Dilarang': '5. Prohibited Use',
        'Dilarang menggunakan Layanan untuk aktivitas ilegal, penipuan, phishing, atau pelanggaran hak pihak ketiga.':
            'You may not use the Service for illegal activities, fraud, phishing, or infringement of third-party rights.',
        'Dilarang mencoba akses tanpa izin, mengganggu operasional, atau mengeksploitasi celah keamanan.':
            'You may not attempt unauthorized access, disrupt operations, or exploit security vulnerabilities.',
        'Dilarang melakukan chargeback/pembayaran tidak sah atau manipulasi transaksi.':
            'You may not perform chargebacks/unauthorized payments or manipulate transactions.',
        '6. Platform Pihak Ketiga': '6. Third-Party Platforms',
        'Layanan dapat bergantung pada atau terhubung dengan platform pihak ketiga. Kami tidak bertanggung jawab atas kebijakan atau perubahan sistem pada platform pihak ketiga tersebut.':
            'The Service may depend on or connect to third-party platforms. We are not responsible for the policies or system changes of those third parties.',
        '7. Batasan Tanggung Jawab': '7. Limitation of Liability',
        'Kami tidak menjamin hasil spesifik (misalnya peningkatan penjualan/engagement) karena ada faktor di luar kendali kami.':
            'We do not guarantee specific outcomes (such as increased sales/engagement) because there are factors beyond our control.',
        'Sejauh diizinkan oleh hukum, tanggung jawab kami dibatasi sebesar nilai saldo/pesanan terkait yang dipersengketakan.':
            'To the extent permitted by law, our liability is limited to the value of the disputed related balance/order.',
        '8. Perubahan Ketentuan': '8. Changes to Terms',
        'Kami dapat memperbarui Syarat & Ketentuan ini dari waktu ke waktu. Versi terbaru akan dipublikasikan di halaman ini.':
            'We may update these Terms & Conditions from time to time. The latest version will be published on this page.',
        '9. Kontak': '9. Contact',
        'Jika Anda memiliki pertanyaan tentang Syarat & Ketentuan ini, silakan hubungi kami melalui channel support resmi yang tersedia.':
            'If you have questions about these Terms & Conditions, please contact us through the available official support channels.',
    },
};

function readInitialLocale(): Locale {
    try {
        const fromStorage = window.localStorage.getItem('locale');
        if (fromStorage === 'id' || fromStorage === 'en') return fromStorage;
    } catch {
        // ignore
    }

    try {
        const m = document.cookie.match(/(?:^|;\s*)locale=(id|en)(?:;|$)/);
        if (m?.[1] === 'id' || m?.[1] === 'en') return m[1];
    } catch {
        // ignore
    }

    return 'id';
}

function persistLocale(next: Locale) {
    try {
        window.localStorage.setItem('locale', next);
    } catch {
        // ignore
    }

    try {
        document.cookie = `locale=${next}; path=/; max-age=${60 * 60 * 24 * 365}`;
    } catch {
        // ignore
    }

    try {
        document.documentElement.lang = next;
    } catch {
        // ignore
    }
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = React.useState<Locale>(() => {
        if (typeof window === 'undefined') return 'id';
        return readInitialLocale();
    });

    React.useEffect(() => {
        persistLocale(locale);
    }, [locale]);

    const setLocale = React.useCallback((next: Locale) => {
        setLocaleState(next);
    }, []);

    const t = React.useCallback(
        (key: string) => {
            return dictionaries[locale]?.[key] ?? dictionaries.id[key] ?? key;
        },
        [locale],
    );

    const value = React.useMemo<I18nContextValue>(
        () => ({ locale, setLocale, t }),
        [locale, setLocale, t],
    );

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
    const ctx = React.useContext(I18nContext);
    if (!ctx) throw new Error('useI18n must be used within I18nProvider');
    return ctx;
}
