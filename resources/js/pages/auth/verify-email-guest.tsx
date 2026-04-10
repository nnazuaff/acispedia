import { Form, Head } from '@inertiajs/react';
import * as React from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import TextLink from '@/components/text-link';
import { login } from '@/routes';

type Props = {
    status?: string;
    hasEmail?: boolean;
};

export default function VerifyEmailGuest({ status, hasEmail = false }: Props) {
    const [value, setValue] = React.useState('');

    return (
        <>
            <Head title="Verifikasi Email" />

            {status === 'email-already-verified' ? (
                <div className="rounded-md border bg-muted/20 p-3 text-center text-sm text-muted-foreground">
                    Email sudah terverifikasi. Silakan login.
                </div>
            ) : status === 'verify-rate-limited' ? (
                <div className="rounded-md border bg-muted/20 p-3 text-center text-sm text-muted-foreground">
                    Terlalu banyak permintaan. Coba lagi beberapa saat.
                </div>
            ) : (
                <div className="rounded-md border bg-muted/20 p-3 text-center text-sm text-muted-foreground">
                    Link verifikasi sudah dikirim. Silakan cek inbox / spam.
                </div>
            )}

            <Form
                action="/verify-email/resend"
                method="post"
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        {!hasEmail && (
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    placeholder="email@example.com"
                                    autoComplete="email"
                                />
                                <InputError message={(errors as any).email} />
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={processing}>
                            {processing && <Spinner />}
                            Kirim ulang link verifikasi
                        </Button>

                        <div className="text-center text-sm text-muted-foreground">
                            <TextLink href={login()}>Kembali ke login</TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

VerifyEmailGuest.layout = {
    title: 'Verifikasi Email',
    description: 'Klik link verifikasi yang dikirim ke email untuk mengaktifkan akun.',
};
