import * as React from 'react';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useI18n, type Locale } from '@/i18n/i18n-provider';

function Flag({ locale }: { locale: Locale }) {
    const src = locale === 'id' ? '/flags/id.svg' : '/flags/en.svg';
    const alt = locale === 'id' ? 'Indonesia' : 'English';

    return (
        <img
            src={src}
            alt={alt}
            className="h-4 w-6 rounded-sm border border-border object-cover"
            loading="lazy"
        />
    );
}

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
    const { locale, setLocale, t } = useI18n();

    const items: Array<{ locale: Locale; label: string }> = [
        { locale: 'id', label: t('lang.indonesian') },
        { locale: 'en', label: t('lang.english') },
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    className={compact ? 'h-9 gap-2 px-2' : 'h-9 gap-2'}
                    aria-label="Language"
                >
                    <Flag locale={locale} />
                    {!compact ? (
                        <span className="text-sm font-medium">
                            {locale.toUpperCase()}
                        </span>
                    ) : null}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-44">
                {items.map((item) => (
                    <DropdownMenuItem
                        key={item.locale}
                        onClick={() => setLocale(item.locale)}
                        className="flex items-center gap-2"
                    >
                        <Flag locale={item.locale} />
                        <span className="flex-1">{item.label}</span>
                        {locale === item.locale ? (
                            <span className="text-xs text-muted-foreground">
                                {item.locale.toUpperCase()}
                            </span>
                        ) : null}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
