import { Head } from '@inertiajs/react';
import * as React from 'react';
import { Button } from '@/components/ui/button';

export default function Verified() {
    React.useEffect(() => {
        const t = window.setTimeout(() => {
            window.location.href = '/dashboard';
        }, 1500);

        return () => window.clearTimeout(t);
    }, []);

    return (
        <>
            <Head title="Konfirmasi berhasil" />

            <div className="space-y-3 text-center">
                <h2 className="text-lg font-semibold">Konfirmasi berhasil</h2>
                <p className="text-sm text-muted-foreground">
                    Email Anda sudah terverifikasi. Anda akan diarahkan ke dashboard.
                </p>
                <Button onClick={() => (window.location.href = '/dashboard')}>
                    Masuk ke dashboard
                </Button>
            </div>
        </>
    );
}

Verified.layout = {
    title: 'Konfirmasi berhasil',
    description: 'Email berhasil diverifikasi.',
};
