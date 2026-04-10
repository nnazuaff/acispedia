import { Form, Head } from '@inertiajs/react';
import { Mail } from 'lucide-react';
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
    email?: string | null;
};

export default function VerifyEmailGuest({ status, email }: Props) {
    const [value, setValue] = React.useState(email ?? '');

    return (
        <>
            <Head title="Verifikasi Email" />

            {status === 'verification-link-sent' && (
                <div className="rounded-md border bg-muted/20 p-3 text-center text-sm text-muted-foreground">
                    Link verifikasi sudah dikirim. Silakan cek inbox / spam.
                </div>
            )}

            {status === 'email-already-verified' && (
                <div className="rounded-md border bg-muted/20 p-3 text-center text-sm text-muted-foreground">
                    Email sudah terverifikasi. Silakan login.
                </div>
            )}

            {status === 'verify-rate-limited' && (
                <div className="rounded-md border bg-muted/20 p-3 text-center text-sm text-muted-foreground">
                    Terlalu banyak permintaan. Coba lagi beberapa saat.
                </div>
            )}

            <Form action="/verify-email/resend" method="post" className="flex flex-col gap-6">
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                    <Mail className="size-4" />
                                </div>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    className="pl-10"
                                    placeholder="email@example.com"
                                    autoComplete="email"
                                />
                            </div>
                            <InputError message={(errors as any).email} />
                        </div>

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
