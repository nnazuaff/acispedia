import { cn } from '@/lib/utils';

export function BrandLogoMark({
    className,
    alt = 'AcisPedia',
}: {
    className?: string;
    alt?: string;
}) {
    return (
        <img
            src="/favicon.png"
            alt={alt}
            className={cn('size-9 rounded-md', className)}
            loading="lazy"
            decoding="async"
        />
    );
}

export function BrandLogo({
    className,
    markClassName,
    showTagline = true,
}: {
    className?: string;
    markClassName?: string;
    showTagline?: boolean;
}) {
    return (
        <div className={cn('flex items-center gap-2', className)}>
            <BrandLogoMark className={markClassName} />
            <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold">AcisPedia</span>
                {showTagline && (
                    <span className="text-xs text-muted-foreground">
                        SMM Panel
                    </span>
                )}
            </div>
        </div>
    );
}
