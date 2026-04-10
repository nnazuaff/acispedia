import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { login, register } from '@/routes';

export default function LandingHero({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const primaryCtaHref = canRegister ? register() : login();
    const primaryCtaLabel = canRegister ? 'Get Started' : 'Login';

    return (
        <section id="home" className="relative overflow-hidden">
            <div className="absolute inset-0 -z-10 bg-linear-to-b from-primary/15 via-background to-background" />
            <div className="absolute inset-x-0 top-0 -z-10 h-40 bg-[radial-gradient(60%_60%_at_50%_0%,color-mix(in_oklab,var(--color-primary)_25%,transparent)_0%,transparent_60%)]" />

            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                <div className="max-w-2xl">
                    <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                        <span className="text-primary">SMM Panel</span> modern untuk
                        pertumbuhan sosial media
                    </h1>
                    <p className="mt-4 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
                        Kelola pertumbuhan media sosial Anda dengan cepat, otomatis,
                        dan terukur. Harga terjangkau, kualitas terjaga, dukungan
                        siap 24/7.
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Button asChild size="lg" className="gap-2">
                            <Link href={primaryCtaHref}>
                                {primaryCtaLabel}
                                <ArrowRight className="size-4" />
                            </Link>
                        </Button>
                    </div>

                    <p className="mt-4 text-sm text-muted-foreground">
                        Cocok untuk agensi, pebisnis, maupun kreator.
                    </p>
                </div>
            </div>
        </section>
    );
}
