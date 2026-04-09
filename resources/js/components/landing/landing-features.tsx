import { Headphones, LayoutDashboard, ShieldCheck, Zap } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
    {
        title: 'Fast Process',
        description:
            'Pemrosesan cepat dengan sistem otomatis yang stabil dan efisien.',
        icon: Zap,
    },
    {
        title: 'Secure System',
        description:
            'Keamanan data dan privasi jadi prioritas, dengan praktik yang rapi.',
        icon: ShieldCheck,
    },
    {
        title: '24/7 Support',
        description:
            'Tim support siap membantu saat kamu butuh, kapan pun memungkinkan.',
        icon: Headphones,
    },
    {
        title: 'Modern Dashboard',
        description:
            'Dashboard bersih, mudah dipakai, dan nyaman di perangkat mobile.',
        icon: LayoutDashboard,
    },
] as const;

export default function LandingFeatures() {
    return (
        <section className="py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                        Fitur yang kamu butuhkan untuk scale
                    </h2>
                    <p className="mt-3 text-pretty text-muted-foreground">
                        Struktur sederhana, performa terasa, dan siap dipakai untuk
                        workflow harian.
                    </p>
                </div>

                <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {features.map((feature) => {
                        const Icon = feature.icon;

                        return (
                            <Card key={feature.title} className="h-full">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <span className="inline-flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                                            <Icon className="size-5" />
                                        </span>
                                        <CardTitle className="text-base">
                                            {feature.title}
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        {feature.description}
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
