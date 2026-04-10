import { Form, Head } from '@inertiajs/react';
import { RefreshCcw, ShieldCheck } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

type Props = {
    status?: string;
};

export default function LoginOtp({ status }: Props) {
    return (
        <>
            <Head title="Verifikasi OTP" />

            <div className="flex flex-col gap-6">
                <div className="rounded-md border bg-muted/20 p-3 text-sm text-muted-foreground">
                    Kami sudah mengirim OTP ke email Anda. Masukkan kode OTP untuk melanjutkan login.
                </div>

                <Form action="/otp/login" method="post" className="flex flex-col gap-4">
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="otp_code">Kode OTP</Label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                        <ShieldCheck className="size-4" />
                                    </div>
                                    <Input
                                        id="otp_code"
                                        name="otp_code"
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        placeholder="6 digit"
                                        className="pl-10"
                                        required
                                        autoFocus
                                    />
                                </div>
                                <InputError message={(errors as any).otp_code} />
                            </div>

                            <Button type="submit" className="w-full" disabled={processing}>
                                {processing && <Spinner />}
                                Verifikasi & Masuk
                            </Button>
                        </>
                    )}
                </Form>

                <Form action="/otp/login/resend" method="post">
                    {({ processing: resending }) => (
                        <Button
                            type="submit"
                            variant="outline"
                            className="w-full"
                            disabled={resending}
                        >
                            <RefreshCcw className="mr-2 size-4" />
                            Kirim ulang OTP
                        </Button>
                    )}
                </Form>

                {status && (
                    <div className="text-center text-sm font-medium text-green-600">
                        {status}
                    </div>
                )}
            </div>
        </>
    );
}

LoginOtp.layout = {
    title: 'Verifikasi OTP',
    description: 'Masukkan OTP yang dikirim ke email untuk menyelesaikan login.',
};
