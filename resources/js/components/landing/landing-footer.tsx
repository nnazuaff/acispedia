import { Send } from 'lucide-react';

import { BrandLogoMark } from '@/components/brand-logo';

const menuLinks = [
    { label: 'Beranda', href: '#home' },
    { label: 'Layanan', href: '#services' },
    { label: 'Tentang', href: '#about' },
    { label: 'Kontak', href: '#contact' },
] as const;

const legalLinks = [
    { label: 'Syarat & Ketentuan', href: '/terms' },
    { label: 'Panduan Target/Link', href: '/panduan-target' },
    { label: 'Privacy Policy', href: '/privacy' },
] as const;

export default function LandingFooter() {
    return (
        <footer id="contact" className="border-t bg-muted/20">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-2">
                            <BrandLogoMark className="size-9" />
                            <div className="leading-tight">
                                <div className="text-sm font-semibold">
                                    AcisPedia
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    SMM Panel
                                </div>
                            </div>
                        </div>

                        <p className="mt-4 max-w-md text-sm text-muted-foreground">
                            Platform SMM untuk membantu promosi media sosial Anda
                            secara mudah: cepat, otomatis, dan transparan.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold">Menu</h3>
                        <ul className="mt-3 grid gap-2">
                            {menuLinks.map((item) => (
                                <li key={item.href}>
                                    <a
                                        href={item.href}
                                        className="text-sm text-muted-foreground hover:text-foreground"
                                    >
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>

                        <h3 className="mt-6 text-sm font-semibold">Dokumen</h3>
                        <ul className="mt-3 grid gap-2">
                            {legalLinks.map((item) => (
                                <li key={item.href}>
                                    <a
                                        href={item.href}
                                        className="text-sm text-muted-foreground hover:text-foreground"
                                    >
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold">Kontak</h3>
                        <div className="mt-3 grid gap-3">
                            <a
                                href="https://t.me/acispediasupport"
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                            >
                                <Send className="size-4 text-primary" />
                                <span>@acispediasupport</span>
                            </a>
                            <a
                                href="https://t.me/acispediasmm"
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                            >
                                <Send className="size-4 text-primary" />
                                <span>@acispediasmm</span>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex flex-col gap-2 border-t pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        © {new Date().getFullYear()} AcisPedia. All rights
                        reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
