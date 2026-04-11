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
        'auth.login': 'Masuk',
        'auth.register': 'Daftar',
        'auth.getStarted': 'Mulai',
        'lang.indonesian': 'Indonesia',
        'lang.english': 'Inggris',
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
        'Terang': 'Light',
        'Gelap': 'Dark',
        'Sistem': 'System',
        'Dashboard Admin': 'Admin Dashboard',
        'Ringkasan aktivitas hari ini': "Today's activity summary",
        'Pengguna Baru Hari Ini': 'New users today',
        'Pesanan Hari Ini': "Today's orders",
        'Deposit Berhasil Hari Ini': 'Successful deposits today',
        'ID': 'ID',
        'Belum ada data.': 'No data yet.',
        'Laporan Keuangan': 'Financial report',
        'Koneksi': 'Connections',
        'Log Aktivitas': 'Activity logs',

        // Landing
        'modern untuk pertumbuhan sosial media': 'modern for social media growth',
        'Kelola pertumbuhan media sosial Anda dengan cepat, otomatis, dan terukur. Harga terjangkau, kualitas terjaga, dukungan siap 24/7.':
            'Manage your social media growth quickly, automatically, and measurably. Affordable pricing, reliable quality, and support ready 24/7.',
        'Cocok untuk agensi, pebisnis, maupun kreator.':
            'Great for agencies, businesses, and creators.',
        'Fitur yang kamu butuhkan untuk scale': 'Features you need to scale',
        'Struktur sederhana, performa terasa, dan siap dipakai untuk workflow harian.':
            'Simple structure, solid performance, and ready for daily workflows.',
        'Proses Cepat': 'Fast processing',
        'Pemrosesan cepat dengan sistem otomatis yang stabil dan efisien.':
            'Fast processing with a stable and efficient automated system.',
        'Sistem Aman': 'Secure system',
        'Keamanan data dan privasi jadi prioritas, dengan praktik yang rapi.':
            'Data security and privacy are a priority, with solid practices.',
        'Dukungan 24/7': '24/7 support',
        'Tim support siap membantu saat kamu butuh, kapan pun memungkinkan.':
            'Our support team is ready to help when you need it, whenever possible.',
        'Dashboard Modern': 'Modern dashboard',
        'Dashboard bersih, mudah dipakai, dan nyaman di perangkat mobile.':
            'A clean dashboard that is easy to use and comfortable on mobile devices.',
        'Preview layanan populer': 'Popular services preview',
        'Pilih layanan yang sesuai kebutuhan promosi kamu. Daftar lengkap tersedia di halaman layanan setelah login.':
            'Choose services that fit your promotion needs. The full list is available on the services page after login.',
        'Lihat layanan': 'View services',
        'Follower Instagram': 'Instagram followers',
        'Bangun social proof dan tingkatkan kredibilitas profil.':
            'Build social proof and increase profile credibility.',
        'Views TikTok': 'TikTok views',
        'Dorong reach video dengan proses cepat dan terukur.':
            'Boost video reach with fast, measurable processing.',
        'Subscriber YouTube': 'YouTube subscribers',
        'Tumbuhkan channel dengan paket yang fleksibel.':
            'Grow your channel with flexible packages.',
        'Kenapa pilih AcisPedia?': 'Why choose AcisPedia?',
        'AcisPedia adalah platform SMM (Social Media Marketing) yang membantu Anda meningkatkan jangkauan dan kredibilitas akun secara mudah. Dengan sistem otomatis, pesanan diproses cepat, aman, dan transparan.':
            'AcisPedia is an SMM (Social Media Marketing) platform that helps you increase reach and credibility easily. With an automated system, orders are processed fast, securely, and transparently.',
        'Proses otomatis 24/7 untuk pesanan yang konsisten':
            '24/7 automated processing for consistent orders',
        'Harga kompetitif untuk berbagai kebutuhan promosi':
            'Competitive pricing for various promotion needs',
        'Dashboard modern & mobile-friendly untuk monitoring':
            'Modern, mobile-friendly dashboard for monitoring',
        'Riwayat pesanan transparan dan mudah dilacak':
            'Transparent order history and easy tracking',
        'Keunggulan yang terasa': 'Benefits you can feel',
        'Struktur layanan jelas': 'Clear service structure',
        'Pilih kategori, tentukan target, dan pantau status dalam satu alur.':
            'Choose a category, set a target, and track status in one flow.',
        'Monitoring yang rapi': 'Neat monitoring',
        'Update status dan riwayat pesanan mudah dicari kapan saja.':
            'Status updates and order history are easy to find anytime.',
        'Dokumen': 'Documents',
        'Platform SMM untuk membantu promosi media sosial Anda secara mudah: cepat, otomatis, dan transparan.':
            'An SMM platform to help promote your social media easily: fast, automated, and transparent.',
        'Kebijakan Privasi': 'Privacy Policy',

        // Public - Privacy
        'Kebijakan Privasi ini menjelaskan bagaimana AcisPedia - SMM Panel ("kami") mengumpulkan, menggunakan, menyimpan, dan melindungi informasi Anda saat Anda menggunakan layanan kami.':
            'This Privacy Policy explains how AcisPedia - SMM Panel ("we") collects, uses, stores, and protects your information when you use our services.',
        '1. Informasi yang Kami Kumpulkan': '1. Information We Collect',
        'Informasi akun:': 'Account information:',
        'seperti nama, email/username, dan detail yang Anda berikan saat registrasi.':
            'such as name, email/username, and details you provide during registration.',
        'Informasi transaksi:': 'Transaction information:',
        'catatan deposit, riwayat pesanan, dan status layanan.':
            'deposit records, order history, and service status.',
        'Data teknis:': 'Technical data:',
        'alamat IP, jenis perangkat/browser, dan log akses untuk keamanan serta analitik dasar.':
            'IP address, device/browser type, and access logs for security and basic analytics.',
        '2. Cara Kami Menggunakan Informasi': '2. How We Use Information',
        'Untuk menyediakan dan menjalankan layanan, termasuk memproses pesanan dan transaksi.':
            'To provide and operate the service, including processing orders and transactions.',
        'Keamanan: untuk mencegah penipuan, penyalahgunaan, dan aktivitas mencurigakan.':
            'Security: to prevent fraud, abuse, and suspicious activity.',
        'Dukungan pelanggan: untuk merespons pertanyaan dan permintaan melalui channel yang tersedia.':
            'Customer support: to respond to questions and requests through available channels.',
        'Peningkatan layanan: untuk meningkatkan performa, stabilitas, dan pengalaman pengguna.':
            'Service improvement: to improve performance, stability, and user experience.',
        '3. Cookie & Local Storage': '3. Cookies & Local Storage',
        'Kami dapat menggunakan cookie atau local storage untuk menjaga sesi login dan preferensi dasar.':
            'We may use cookies or local storage to maintain login sessions and basic preferences.',
        'Anda dapat menonaktifkan cookie melalui pengaturan browser, namun beberapa fitur mungkin tidak berfungsi dengan baik.':
            'You can disable cookies via your browser settings, but some features may not work properly.',
        '4. Berbagi Data dengan Pihak Ketiga': '4. Sharing Data with Third Parties',
        'Kami dapat menggunakan penyedia pihak ketiga untuk pembayaran atau infrastruktur teknis.':
            'We may use third-party providers for payments or technical infrastructure.',
        'Kami tidak menjual data pribadi Anda.': 'We do not sell your personal data.',
        'Data dapat dibagikan jika diwajibkan oleh hukum atau untuk melindungi hak dan keamanan layanan.':
            'Data may be shared if required by law or to protect the rights and security of the service.',
        '5. Retensi Data': '5. Data Retention',
        'Kami menyimpan data selama diperlukan untuk menyediakan layanan, memenuhi kewajiban hukum, menyelesaikan sengketa, dan menegakkan ketentuan.':
            'We retain data as long as needed to provide the service, comply with legal obligations, resolve disputes, and enforce the terms.',
        'Keamanan': 'Security',
        'Kami menerapkan langkah keamanan yang wajar untuk melindungi data dari akses tidak sah.':
            'We implement reasonable security measures to protect data from unauthorized access.',
        'Namun, tidak ada sistem yang 100% aman; Anda juga bertanggung jawab untuk menjaga keamanan akun Anda.':
            'However, no system is 100% secure; you are also responsible for keeping your account secure.',
        '7. Hak Anda': '7. Your Rights',
        'Anda dapat memperbarui informasi akun Anda melalui fitur yang tersedia.':
            'You can update your account information through available features.',
        'Anda dapat meminta bantuan terkait data akun Anda melalui channel dukungan resmi.':
            'You can request assistance regarding your account data via official support channels.',
        '8. Perubahan Kebijakan Ini': '8. Changes to This Policy',
        'Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Versi terbaru akan dipublikasikan di halaman ini.':
            'We may update this Privacy Policy from time to time. The latest version will be published on this page.',
        'Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami melalui channel dukungan resmi.':
            'If you have questions about this Privacy Policy, please contact us via official support channels.',

        // Public - Contact
        'Hubungi Kami': 'Contact Us',
        'Tim support kami siap membantu Anda. Jangan ragu untuk menghubungi kami kapan saja.':
            'Our support team is ready to help you. Feel free to reach out anytime.',
        'Informasi Kontak': 'Contact Information',
        'Kami selalu siap membantu Anda dengan berbagai pertanyaan seputar layanan SMM Panel. Hubungi kami melalui channel yang tersedia di bawah ini.':
            'We are ready to help with any questions about our SMM Panel services. Contact us through the channels below.',
        'Layanan Pelanggan': 'Customer Service',
        'Channel Telegram': 'Telegram Channel',
        'Info & Pembaruan': 'Info & Updates',
        'Jam Operasional': 'Operating Hours',
        'Senin - Jumat': 'Monday - Friday',
        'Sabtu & Minggu': 'Saturday & Sunday',
        'Libur': 'Closed',
        'Jika di luar jam operasional, pesan tetap diterima dan akan dibalas saat jam kerja.':
            'Outside operating hours, messages are still received and will be replied to during working hours.',
        'Pertanyaan Sering Diajukan': 'Frequently Asked Questions',
        'Berapa lama waktu pemrosesan pesanan?': 'How long does order processing take?',
        'Sebagian besar pesanan diproses dalam 1-30 menit. Waktu pemrosesan dapat bervariasi tergantung pada jenis layanan dan beban server.':
            'Most orders are processed within 1-30 minutes. Processing time may vary depending on the service type and server load.',
        'Apakah layanan ini aman untuk akun saya?': 'Is this service safe for my account?',
        'Ya, kami menggunakan metode yang aman dan sesuai dengan ketentuan layanan platform. Namun, kami selalu menyarankan untuk tidak berlebihan dalam penggunaan.':
            'Yes, we use safe methods that follow the platform’s terms. However, we always recommend not overusing the services.',
        'Bagaimana cara melakukan pembayaran?': 'How do I make a payment?',
        'Kami menerima berbagai metode pembayaran termasuk bank transfer, e-wallet, dan QRIS. Deposit otomatis umumnya masuk dalam 1-5 menit.':
            'We accept various payment methods including bank transfers, e-wallets, and QRIS. Automatic deposits usually arrive within 1-5 minutes.',
        'Apakah ada garansi untuk layanan?': 'Is there a guarantee for the service?',
        'Ya, kami memberikan garansi sesuai deskripsi layanan. Jika terjadi drop atau masalah, hubungi support untuk refill atau refund (sesuai kebijakan).':
            'Yes, we provide a guarantee according to the service description. If there is a drop or an issue, contact support for a refill or refund (per policy).',

        // Public - Target Guide
        'Panduan Target/Link': 'Target/Link Guide',
        'Panduan Pengisian Target/Link': 'Target/Link Input Guide',
        'Contoh format target/link untuk membuat pesanan. Pastikan target valid agar pesanan bisa diproses.':
            'Examples of target/link formats for placing an order. Make sure the target is valid so the order can be processed.',
        'Target:': 'Target:',
        'Contoh:': 'Example:',
        'Username akun Instagram tanpa tanda @': 'Instagram account username without the @ symbol',
        'Link postingan akun Instagram': 'Instagram post link',
        'Link postingan Instagram TV': 'Instagram TV post link',
        'Link postingan Instagram Reels': 'Instagram Reels post link',
        'Link video YouTube': 'YouTube video link',
        'Link video live YouTube': 'YouTube live video link',
        'Link channel YouTube': 'YouTube channel link',
        'Link halaman/fanspage Facebook': 'Facebook page/fanpage link',
        'Link postingan Facebook': 'Facebook post link',
        'Link profil Facebook': 'Facebook profile link',
        'Link grup Facebook': 'Facebook group link',
        'Username akun Twitter tanpa tanda @': 'Twitter account username without the @ symbol',
        'Link tweet/postingan Twitter': 'Twitter tweet/post link',
        'Link profil TikTok atau username tanpa tanda @':
            'TikTok profile link or username without the @ symbol',
        'Link video TikTok': 'TikTok video link',
        'Username akun Shopee': 'Shopee account username',
        'Link produk Shopee': 'Shopee product link',
        'Username akun Tokopedia atau link profil': 'Tokopedia username or profile link',
        'Link produk Tokopedia': 'Tokopedia product link',
        'Link website': 'Website link',
        'Link channel/grup': 'Channel/group link',
        'Link channel': 'Channel link',
        'Link post': 'Post link',
        'Link story': 'Story link',

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
        'Top Up Saldo': 'Top up balance',
        'Tambah saldo untuk testing (tanpa payment gateway).':
            'Add balance for testing (without a payment gateway).',
        'Contoh: 10000': 'Example: 10000',
        'Tambah Saldo': 'Add balance',
        'Nominal tidak valid.': 'Invalid amount.',
        'Gagal top up saldo.': 'Failed to top up balance.',
        'Saldo berhasil ditambahkan.': 'Balance added successfully.',
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

        // Sidebar
        'Transaksi': 'Transactions',
        'Lainnya': 'Others',
        'Bantuan': 'Help',
        'Contoh Pengisian Target': 'Target filling example',
        'Ketentuan Layanan': 'Terms of Service',
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

        // Auth pages
        'Masuk': 'Log in',
        'Daftar': 'Sign up',
        'Email': 'Email',
        'Kata sandi': 'Password',
        'Lupa kata sandi?': 'Forgot password?',
        'Ingat saya': 'Remember me',
        'Belum punya akun?': "Don't have an account?",
        'Sudah punya akun?': 'Already have an account?',
        'Nama lengkap': 'Full name',
        'Nomor HP / WhatsApp': 'Phone / WhatsApp number',
        'Buat akun': 'Create account',
        'Minimal 8 karakter (angka & simbol)':
            'Minimum 8 characters (numbers & symbols)',
        'Konfirmasi kata sandi': 'Confirm password',
        'Ulangi kata sandi': 'Repeat password',
        'Cek Keamanan': 'Security Check',
        'Muat ulang cek keamanan': 'Refresh security check',
        'Masukkan kode di atas': 'Enter the code above',
        'Lupa kata sandi': 'Forgot password',
        'Masukkan email untuk menerima link reset kata sandi':
            'Enter your email to receive a password reset link',
        'Kirim link reset kata sandi': 'Email password reset link',
        'Atau, kembali ke': 'Or, return to',
        'Reset kata sandi': 'Reset password',
        'Silakan masukkan kata sandi baru Anda di bawah ini':
            'Please enter your new password below',
        'Link reset kata sandi tidak valid atau sudah kedaluwarsa. Silakan minta link baru.':
            'The password reset link is invalid or has expired. Please request a new link.',
        'Minta link reset kata sandi': 'Request a new reset link',
        'Ini adalah area aman aplikasi. Silakan konfirmasi kata sandi Anda sebelum melanjutkan.':
            'This is a secure area of the application. Please confirm your password before continuing.',
        'Autentikasi dua faktor': 'Two-factor authentication',
        'Kode autentikasi': 'Authentication code',
        'Masukkan kode autentikasi yang disediakan oleh aplikasi authenticator Anda.':
            'Enter the authentication code provided by your authenticator application.',
        'masuk menggunakan kode pemulihan': 'log in using a recovery code',
        'Kode pemulihan': 'Recovery code',
        'Masukkan kode pemulihan': 'Enter recovery code',
        'Silakan konfirmasi akses ke akun Anda dengan memasukkan salah satu kode pemulihan darurat Anda.':
            'Please confirm access to your account by entering one of your emergency recovery codes.',
        'masuk menggunakan kode autentikasi':
            'log in using an authentication code',
        'atau Anda bisa': 'or you can',
        'Verifikasi email': 'Verify email',
        'Verifikasi Email': 'Verify email',
        'Silakan verifikasi alamat email Anda dengan mengklik link yang baru saja kami kirimkan.':
            'Please verify your email address by clicking on the link we just emailed to you.',
        'Link verifikasi baru telah dikirim ke alamat email yang Anda berikan saat registrasi.':
            'A new verification link has been sent to the email address you provided during registration.',
        'Kirim ulang email verifikasi': 'Resend verification email',
        'Keluar': 'Log out',
        'Klik link verifikasi yang dikirim ke email untuk mengaktifkan akun.':
            'Click the verification link sent to your email to activate your account.',
        'Email sudah terverifikasi. Silakan login.':
            'Email is already verified. Please log in.',
        'Terlalu banyak permintaan. Coba lagi beberapa saat.':
            'Too many requests. Please try again in a moment.',
        'Link verifikasi sudah dikirim. Silakan cek inbox / spam.':
            'The verification link has been sent. Please check your inbox/spam.',
        'Kirim ulang link verifikasi': 'Resend verification link',
        'Kembali ke login': 'Back to login',
        'Konfirmasi berhasil': 'Verification successful',
        'Email berhasil diverifikasi.': 'Email verified successfully.',
        'Email Anda sudah terverifikasi. Anda akan diarahkan ke dashboard.':
            'Your email has been verified. You will be redirected to the dashboard.',
        'Masuk ke dashboard': 'Go to dashboard',
        'Solusi Terpadu Untuk SMM Panel': 'An all-in-one SMM Panel solution',
        'Kelola layanan, deposit, dan order dalam satu dashboard.':
            'Manage services, deposits, and orders in one dashboard.',
        'Daftar Akun': 'Create an account',
        'Registrasi cepat menggunakan email & WhatsApp aktif.':
            'Quick registration using an active email & WhatsApp number.',
        'Isi saldo dan mulai transaksi kapan saja.':
            'Top up your balance and start transacting anytime.',
        'Akun Lebih Aman': 'More secure account',
        'Gunakan kata sandi kuat untuk melindungi akun.':
            'Use a strong password to protect your account.',

        // Settings
        'Pengaturan Profil': 'Profile settings',
        'Informasi Profil': 'Profile information',
        'Perbarui nama, alamat email, dan nomor HP/WhatsApp Anda':
            'Update your name, email address, and phone/WhatsApp number',
        'Alamat email': 'Email address',
        'Hubungi CS untuk ubah email.': 'Contact customer service to change your email.',
        'Email Anda belum terverifikasi.': 'Your email address is not verified.',
        'Klik di sini untuk kirim ulang link verifikasi.':
            'Click here to resend the verification link.',
        'Link verifikasi baru sudah dikirim ke email Anda.':
            'A new verification link has been sent to your email address.',
        'Pengaturan Keamanan': 'Security settings',
        'Masukkan password saat ini dan password baru Anda.':
            'Enter your current password and your new password.',
        'Password saat ini': 'Current password',
        'Password baru': 'New password',
        'Konfirmasi password baru': 'Confirm new password',
        'Simpan password': 'Save password',
        'Kelola pengaturan autentikasi dua faktor Anda':
            'Manage your two-factor authentication settings',
        'Anda akan diminta memasukkan PIN aman saat login, yang bisa Anda ambil dari aplikasi authenticator yang mendukung TOTP di ponsel Anda.':
            'You will be prompted for a secure PIN during login, which you can retrieve from a TOTP-supported authenticator app on your phone.',
        'Nonaktifkan 2FA': 'Disable 2FA',
        'Saat Anda mengaktifkan autentikasi dua faktor, Anda akan diminta memasukkan PIN aman saat login. PIN ini dapat diambil dari aplikasi authenticator yang mendukung TOTP di ponsel Anda.':
            'When you enable two-factor authentication, you will be prompted for a secure PIN during login. This PIN can be retrieved from a TOTP-supported authenticator app on your phone.',
        'Lanjutkan pengaturan': 'Continue setup',
        'Aktifkan 2FA': 'Enable 2FA',
        'Perangkat': 'Devices',
        'Logout': 'Log out',
        'Logout perangkat lain': 'Log out other devices',
        'Logout dari semua perangkat lain?': 'Log out from all other devices?',
        'Logout perangkat': 'Log out device',
        'Logout perangkat ini?': 'Log out this device?',
        'Perangkat yang sedang login ke akun Anda':
            'Devices currently signed in to your account',
        'Logout semua perangkat lain': 'Log out all other devices',
        'Sesi Login': 'Login sessions',
        'Tidak ada sesi.': 'No sessions.',
        'Perangkat ini': 'This device',
        'Perangkat lain': 'Other device',
        'Terakhir aktif:': 'Last active:',

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
