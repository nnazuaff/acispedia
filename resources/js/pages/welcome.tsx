import { Head, usePage } from '@inertiajs/react';

import { useI18n } from '@/i18n/i18n-provider';

import LandingFeatures from '@/components/landing/landing-features';
import LandingFooter from '@/components/landing/landing-footer';
import LandingHero from '@/components/landing/landing-hero';
import LandingNavbar from '@/components/landing/landing-navbar';
import LandingServicesPreview from '@/components/landing/landing-services-preview';
import LandingWhyChooseUs from '@/components/landing/landing-why-choose-us';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { t } = useI18n();
    const page = usePage();
    const authUser = (page.props as any)?.auth?.user;

    return (
        <>
            <Head title={t('Beranda')} />
            <div className="min-h-screen bg-background text-foreground">
                <LandingNavbar authUser={authUser} canRegister={canRegister} />

                <main>
                    <LandingHero canRegister={canRegister} />
                    <LandingFeatures />
                    <LandingServicesPreview />
                    <LandingWhyChooseUs />
                </main>

                <LandingFooter />
            </div>
        </>
    );
}
