import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

            <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-12 lg:px-8">
                <div>
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

                <div className="lg:justify-self-end">
                    <Card className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent" />
                        <CardHeader className="relative">
                            <CardTitle className="text-base">
                                Dashboard yang rapi & cepat
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative space-y-4">
                            <div className="grid gap-2">
                                <div className="h-3 w-2/3 rounded bg-muted" />
                                <div className="h-3 w-5/6 rounded bg-muted" />
                                <div className="h-3 w-1/2 rounded bg-muted" />
                            </div>
                            <div className="rounded-lg border bg-card p-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Progress pesanan
                                    </span>
                                    <span className="font-medium text-foreground">
                                        72%
                                    </span>
                                </div>
                                <div className="mt-3 h-2 w-full rounded-full bg-muted">
                                    <div className="h-2 w-[72%] rounded-full bg-primary" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="rounded-lg border bg-card p-3">
                                    <div className="text-xs text-muted-foreground">
                                        Otomatis
                                    </div>
                                    <div className="mt-1 text-sm font-semibold">
                                        24/7
                                    </div>
                                </div>
                                <div className="rounded-lg border bg-card p-3">
                                    <div className="text-xs text-muted-foreground">
                                        Sistem
                                    </div>
                                    <div className="mt-1 text-sm font-semibold">
                                        Aman
                                    </div>
                                </div>
                                <div className="rounded-lg border bg-card p-3">
                                    <div className="text-xs text-muted-foreground">
                                        Support
                                    </div>
                                    <div className="mt-1 text-sm font-semibold">
                                        24/7
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}
