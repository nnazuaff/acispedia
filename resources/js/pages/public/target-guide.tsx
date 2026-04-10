import { Head } from '@inertiajs/react';

import Heading from '@/components/heading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Item = {
    title: string;
    target: string;
    example: string;
};

type Section = {
    name: string;
    items: Item[];
};

const sections: Section[] = [
    {
        name: 'Instagram',
        items: [
            {
                title: 'Instagram Followers, Story, Live Video, Profile Visits',
                target: 'Username akun Instagram tanpa tanda @',
                example: 'ciscis',
            },
            {
                title: 'Instagram Likes, Views, Comments, Impressions, Saves',
                target: 'Link postingan akun Instagram',
                example: 'https://www.instagram.com/p/BxilTdssedewBn_p/',
            },
            {
                title: 'Instagram TV',
                target: 'Link postingan Instagram TV',
                example: 'https://www.instagram.com/tv/CUOfgerkDLoBsqP/',
            },
            {
                title: 'Instagram Reels',
                target: 'Link postingan Instagram Reels',
                example: 'https://www.instagram.com/reel/CUrqMtmfdfdloDI/',
            },
        ],
    },
    {
        name: 'YouTube',
        items: [
            {
                title: 'YouTube Likes, Views, Shares, Komentar',
                target: 'Link video YouTube',
                example: 'https://www.youtube.com/watch?v=NdgFndfdnFQqII',
            },
            {
                title: 'YouTube Live Stream',
                target: 'Link video live YouTube',
                example: 'https://www.youtube.com/watch?v=0AFdfdM8thZU_g',
            },
            {
                title: 'YouTube Subscribers',
                target: 'Link channel YouTube',
                example:
                    'https://www.youtube.com/channel/UCjPr9Tbddfdf2zs9TCEDn-eALw',
            },
        ],
    },
    {
        name: 'Facebook',
        items: [
            {
                title: 'Facebook Page Likes, Page Followers',
                target: 'Link halaman/fanspage Facebook',
                example: 'https://www.facebook.com/telkomsel/',
            },
            {
                title: 'Facebook Post Likes, Post Video',
                target: 'Link postingan Facebook',
                example:
                    'https://www.facebook.com/admintakin/posts/2161457404010124',
            },
            {
                title: 'Facebook Followers, Friends',
                target: 'Link profil Facebook',
                example: 'https://www.facebook.com/admintakin',
            },
            {
                title: 'Facebook Group Members',
                target: 'Link grup Facebook',
                example: 'https://www.facebook.com/groups/1675298779413438239/',
            },
        ],
    },
    {
        name: 'Twitter',
        items: [
            {
                title: 'Twitter Followers',
                target: 'Username akun Twitter tanpa tanda @',
                example: 'TelkomCare',
            },
            {
                title: 'Twitter Retweet, Favorite',
                target: 'Link tweet/postingan Twitter',
                example:
                    'https://twitter.com/TelkomCare/status/1238691324498513920',
            },
        ],
    },
    {
        name: 'TikTok',
        items: [
            {
                title: 'TikTok Followers',
                target: 'Link profil TikTok atau username tanpa tanda @',
                example: 'https://tiktok.com/@username/ (atau: username)',
            },
            {
                title: 'TikTok Likes / Views',
                target: 'Link video TikTok',
                example: 'https://vt.tiktok.com/xxxxx/',
            },
        ],
    },
    {
        name: 'Shopee',
        items: [
            {
                title: 'Shopee Followers',
                target: 'Username akun Shopee',
                example: 'ciscis001',
            },
            {
                title: 'Shopee Product Likes',
                target: 'Link produk Shopee',
                example:
                    'https://shopee.co.id/Stiker-Keyboard-Arab-Stiker-Keyboard-Arabic-i.8232793.668063715',
            },
        ],
    },
    {
        name: 'Tokopedia',
        items: [
            {
                title: 'Tokopedia Followers',
                target: 'Username akun Tokopedia atau link profil',
                example: 'https://www.tokopedia.com/cleanandcleanshop',
            },
            {
                title: 'Tokopedia Wishlist / Favorite',
                target: 'Link produk Tokopedia',
                example:
                    'https://www.tokopedia.com/dbeofficial/dbe-dj80-foldable-dj-headphone-with-detachable-microphone-hitam',
            },
        ],
    },
    {
        name: 'Website Traffic',
        items: [
            {
                title: 'Website Traffic',
                target: 'Link website',
                example: 'https://acispedia.example',
            },
        ],
    },
    {
        name: 'Telegram',
        items: [
            {
                title: 'Telegram Channel Members / Group',
                target: 'Link channel/grup',
                example: 'https://t.me/acispediaSMM',
            },
            {
                title: 'Telegram Post Last Views',
                target: 'Link channel',
                example: 'https://t.me/acispediaSMM',
            },
            {
                title: 'Telegram Post Views',
                target: 'Link post',
                example: 'https://t.me/acispediaSMM/1195',
            },
            {
                title: 'Telegram Reactions',
                target: 'Link post',
                example: 'https://t.me/acispediaSMM/1195',
            },
            {
                title: 'Telegram Story',
                target: 'Link story',
                example: 'https://t.me/acispediaSMM/s/2',
            },
        ],
    },
    {
        name: 'WhatsApp',
        items: [
            {
                title: 'WhatsApp Channel Members / Group',
                target: 'Link channel/grup',
                example: 'https://whatsapp.com/channel/XXXXXXXXXXXXXXXXX',
            },
        ],
    },
];

export default function PublicTargetGuide() {
    return (
        <>
            <Head title="Panduan Pengisian Target/Link" />

            <div className="space-y-6">
                <Heading
                    title="Panduan Pengisian Target/Link"
                    description="Contoh format target/link untuk membuat pesanan. Pastikan target valid agar pesanan bisa diproses."
                />

                <div className="grid gap-4">
                    {sections.map((section) => (
                        <Card key={section.name}>
                            <CardHeader>
                                <CardTitle className="text-base">{section.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {section.items.map((item) => (
                                    <div key={item.title} className="space-y-1">
                                        <div className="text-sm font-medium text-foreground">
                                            {item.title}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            <span className="font-medium">Target:</span> {item.target}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            <span className="font-medium">Contoh:</span>{' '}
                                            <span className="break-all">{item.example}</span>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    );
}
