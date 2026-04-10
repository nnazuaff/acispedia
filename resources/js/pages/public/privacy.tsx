import { Head } from '@inertiajs/react';

import Heading from '@/components/heading';
import { Card, CardContent } from '@/components/ui/card';

export default function PublicPrivacy() {
    return (
        <>
            <Head title="Privacy Policy" />

            <div className="space-y-6">
                <Heading title="Privacy Policy" description="Last updated: January 5, 2026" />

                <Card>
                    <CardContent className="space-y-6 pt-6">
                        <p className="text-sm text-muted-foreground">
                            This Privacy Policy explains how AcisPedia - SMM Panel
                            ("we") collects, uses, stores, and protects your
                            information when you use our services.
                        </p>

                        <section className="space-y-3">
                            <h2 className="text-base font-semibold">1. Information We Collect</h2>
                            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                <li>
                                    <span className="font-medium">Account information:</span>{' '}
                                    such as name, email/username, and details you provide during registration.
                                </li>
                                <li>
                                    <span className="font-medium">Transaction information:</span>{' '}
                                    deposit records, order history, and service status.
                                </li>
                                <li>
                                    <span className="font-medium">Technical data:</span>{' '}
                                    IP address, device/browser type, and access logs for security and basic analytics.
                                </li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-base font-semibold">2. How We Use Information</h2>
                            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                <li>To provide and operate the service, including processing orders and transactions.</li>
                                <li>Security: to prevent fraud, abuse, and suspicious activity.</li>
                                <li>Customer support: to respond to questions and requests through available channels.</li>
                                <li>Service improvement: to improve performance, stability, and user experience.</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-base font-semibold">3. Cookies &amp; Local Storage</h2>
                            <p className="text-sm text-muted-foreground">
                                We may use cookies or local storage to maintain login sessions and basic preferences.
                                You can disable cookies via your browser settings, but some features may not work properly.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-base font-semibold">4. Sharing Data with Third Parties</h2>
                            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                <li>We may use third-party providers for payments or technical infrastructure.</li>
                                <li>We do not sell your personal data.</li>
                                <li>Data may be shared if required by law or to protect the rights and security of the service.</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-base font-semibold">5. Data Retention</h2>
                            <p className="text-sm text-muted-foreground">
                                We retain data as long as needed to provide the service, comply with legal obligations,
                                resolve disputes, and enforce the terms.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-base font-semibold">6. Security</h2>
                            <p className="text-sm text-muted-foreground">
                                We implement reasonable security measures to protect data from unauthorized access.
                                However, no system is 100% secure; you are also responsible for keeping your account secure.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-base font-semibold">7. Your Rights</h2>
                            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                <li>You can update your account information through available features.</li>
                                <li>You can request assistance regarding your account data via official support channels.</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-base font-semibold">8. Changes to This Policy</h2>
                            <p className="text-sm text-muted-foreground">
                                We may update this Privacy Policy from time to time. The latest version will be published on this page.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-base font-semibold">9. Contact</h2>
                            <p className="text-sm text-muted-foreground">
                                If you have questions about this Privacy Policy, please contact us via official support channels.
                            </p>
                        </section>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
