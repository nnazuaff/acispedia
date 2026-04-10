import * as React from 'react';

export type Locale = 'id' | 'en';

type Dict = Record<string, string>;

type I18nContextValue = {
    locale: Locale;
    setLocale: (next: Locale) => void;
    t: (key: string) => string;
};

const I18nContext = React.createContext<I18nContextValue | null>(null);

const dictionaries: Record<Locale, Dict> = {
    id: {
        'nav.dashboard': 'Dashboard',
        'nav.services': 'Layanan',
        'nav.order': 'Order',
        'nav.home': 'Beranda',
        'nav.about': 'Tentang',
        'nav.contact': 'Kontak',
        'nav.menu': 'Menu',
        'nav.theme': 'Tema',
        'auth.login': 'Login',
        'auth.register': 'Register',
        'auth.getStarted': 'Get Started',
        'lang.indonesian': 'Indonesia',
        'lang.english': 'English',
    },
    en: {
        'nav.dashboard': 'Dashboard',
        'nav.services': 'Services',
        'nav.order': 'Orders',
        'nav.home': 'Home',
        'nav.about': 'About',
        'nav.contact': 'Contact',
        'nav.menu': 'Menu',
        'nav.theme': 'Theme',
        'auth.login': 'Login',
        'auth.register': 'Register',
        'auth.getStarted': 'Get Started',
        'lang.indonesian': 'Indonesian',
        'lang.english': 'English',
    },
};

function readInitialLocale(): Locale {
    try {
        const fromStorage = window.localStorage.getItem('locale');
        if (fromStorage === 'id' || fromStorage === 'en') return fromStorage;
    } catch {
        // ignore
    }

    try {
        const m = document.cookie.match(/(?:^|;\s*)locale=(id|en)(?:;|$)/);
        if (m?.[1] === 'id' || m?.[1] === 'en') return m[1];
    } catch {
        // ignore
    }

    return 'id';
}

function persistLocale(next: Locale) {
    try {
        window.localStorage.setItem('locale', next);
    } catch {
        // ignore
    }

    try {
        document.cookie = `locale=${next}; path=/; max-age=${60 * 60 * 24 * 365}`;
    } catch {
        // ignore
    }

    try {
        document.documentElement.lang = next;
    } catch {
        // ignore
    }
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = React.useState<Locale>(() => {
        if (typeof window === 'undefined') return 'id';
        return readInitialLocale();
    });

    React.useEffect(() => {
        persistLocale(locale);
    }, [locale]);

    const setLocale = React.useCallback((next: Locale) => {
        setLocaleState(next);
    }, []);

    const t = React.useCallback(
        (key: string) => {
            return dictionaries[locale]?.[key] ?? dictionaries.id[key] ?? key;
        },
        [locale],
    );

    const value = React.useMemo<I18nContextValue>(
        () => ({ locale, setLocale, t }),
        [locale, setLocale, t],
    );

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
    const ctx = React.useContext(I18nContext);
    if (!ctx) throw new Error('useI18n must be used within I18nProvider');
    return ctx;
}
