import { Link, router } from '@inertiajs/react';
import { LogOut, Settings } from 'lucide-react';
import * as React from 'react';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import type { User } from '@/types';

type Props = {
    user: User;
};

function formatRupiah(value: unknown): string {
    const num = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;

    if (!Number.isFinite(num)) {
        return '—';
    }

    return `Rp ${new Intl.NumberFormat('id-ID', {
        maximumFractionDigits: 0,
    }).format(num)}`;
}

export function UserMenuContent({ user }: Props) {
    const cleanup = useMobileNavigation();
    const [balance, setBalance] = React.useState<number>(Number(user.balance ?? 0));

    React.useEffect(() => {
        setBalance(Number(user.balance ?? 0));
    }, [user.balance]);

    React.useEffect(() => {
        const uid = Number(user.id ?? 0);
        if (!Number.isFinite(uid) || uid <= 0) {
            return;
        }

        const echo = (window as any)?.Echo;
        if (!echo) {
            return;
        }

        const channelName = `dashboard.${uid}`;
        const channel = echo.private(channelName);

        channel.listen('.dashboard.stats.updated', (payload: any) => {
            const stats = payload?.stats;
            if (stats && typeof stats === 'object' && Number.isFinite(Number(stats.balance))) {
                setBalance(Number(stats.balance));
            }
        });

        return () => {
            try {
                echo.leave(channelName);
            } catch {
                // ignore
            }
        };
    }, [user.id]);

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                Saldo: <span className="text-foreground">{formatRupiah(balance)}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href={edit()}
                        prefetch
                        onClick={cleanup}
                    >
                        <Settings className="mr-2" />
                        Settings
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" asChild>
                <Link
                    className="block w-full cursor-pointer"
                    href={logout()}
                    as="button"
                    onClick={handleLogout}
                    data-test="logout-button"
                >
                    <LogOut className="mr-2" />
                    Log out
                </Link>
            </DropdownMenuItem>
        </>
    );
}
