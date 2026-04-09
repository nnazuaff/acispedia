import { Link } from '@inertiajs/react';
import { ArrowRight, Instagram, PlayCircle, Youtube } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { services as servicesRoute } from '@/routes';
import type { RouteDefinition } from '@/wayfinder';

const servicePreviews = [
    {
        title: 'Instagram Followers',
        description: 'Bangun social proof dan tingkatkan kredibilitas profil.',
        icon: Instagram,
    },
    {
        title: 'TikTok Views',
        description: 'Dorong reach video dengan proses cepat dan terukur.',
        icon: PlayCircle,
    },
    {
        title: 'YouTube Subscribers',
        description: 'Tumbuhkan channel dengan paket yang fleksibel.',
        icon: Youtube,
    },
] as const;

export default function LandingServicesPreview() {
    const servicesLink = servicesRoute() as unknown as string | RouteDefinition<any>;
    const servicesHref = typeof servicesLink === 'string' ? servicesLink : servicesLink.url;

    return (
        <section id="services" className="border-t bg-muted/20 py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                    <div className="max-w-2xl">
                        <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                            Preview layanan populer
                        </h2>
                        <p className="mt-3 text-pretty text-muted-foreground">
                            Pilih layanan yang sesuai kebutuhan promosi kamu. Daftar
                            lengkap tersedia di halaman layanan setelah login.
                        </p>
                    </div>

                    <Button asChild variant="outline" className="sm:self-end">
                        <Link href={servicesHref} className="gap-2">
                            Lihat layanan
                            <ArrowRight className="size-4" />
                        </Link>
                    </Button>
                </div>

                <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {servicePreviews.map((service) => {
                        const Icon = service.icon;

                        return (
                            <Card key={service.title} className="h-full">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <span className="inline-flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                                            <Icon className="size-5" />
                                        </span>
                                        <CardTitle className="text-base">
                                            {service.title}
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        {service.description}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
