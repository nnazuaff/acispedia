import * as React from 'react';
import type { DateRange } from 'react-day-picker';
import { CalendarIcon } from 'lucide-react';

import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type AdminDateRangePickerProps = {
    id?: string;
    valueFrom: string;
    valueTo: string;
    onChange: (next: { from: string; to: string }) => void;
    placeholder?: string;
    className?: string;
    numberOfMonths?: number;
};

function parseYmdToLocalDate(value: string): Date | undefined {
    const raw = String(value ?? '').trim();
    if (raw === '') return undefined;

    const parts = raw.split('-');
    if (parts.length !== 3) return undefined;

    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return undefined;
    if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31) return undefined;

    return new Date(year, month - 1, day);
}

function formatLocalDateToYmd(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function getTodayLocalDate(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export default function AdminDateRangePicker({
    id,
    valueFrom,
    valueTo,
    onChange,
    placeholder = 'Pilih tanggal',
    className,
    numberOfMonths = 2,
}: AdminDateRangePickerProps) {
    const [open, setOpen] = React.useState(false);
    const [isSelectingEnd, setIsSelectingEnd] = React.useState(false);
    const [displayMonth, setDisplayMonth] = React.useState<Date>(() => parseYmdToLocalDate(valueFrom) ?? parseYmdToLocalDate(valueTo) ?? getTodayLocalDate());

    const selectedRange = React.useMemo<DateRange>(() => {
        const from = parseYmdToLocalDate(valueFrom);
        const to = parseYmdToLocalDate(valueTo);

        if (!from && !to) {
            const today = getTodayLocalDate();
            return { from: today, to: today };
        }

        return {
            from: from ?? to,
            to: to ?? from,
        };
    }, [valueFrom, valueTo]);

    return (
        <Popover
            open={open}
            onOpenChange={(nextOpen) => {
                setOpen(nextOpen);

                if (nextOpen) {
                    setIsSelectingEnd(false);
                    setDisplayMonth(parseYmdToLocalDate(valueFrom) ?? parseYmdToLocalDate(valueTo) ?? getTodayLocalDate());
                }
            }}
        >
            <PopoverTrigger asChild>
                <button
                    id={id}
                    type="button"
                    className={cn(
                        'border-input placeholder:text-muted-foreground flex h-9 w-full items-center justify-between rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm',
                        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                        !valueFrom && !valueTo ? 'text-muted-foreground' : '',
                        className
                    )}
                >
                    <span className="truncate">
                        {valueFrom || valueTo ? (valueFrom && valueTo ? `${valueFrom} ~ ${valueTo}` : valueFrom || valueTo) : placeholder}
                    </span>
                    <CalendarIcon className="ml-2 size-4 shrink-0 text-muted-foreground" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="range"
                    numberOfMonths={numberOfMonths}
                    month={displayMonth}
                    onMonthChange={setDisplayMonth}
                    selected={selectedRange}
                    onDayClick={(day) => {
                        const clicked = new Date(day.getFullYear(), day.getMonth(), day.getDate());

                        if (!isSelectingEnd) {
                            onChange({ from: formatLocalDateToYmd(clicked), to: '' });
                            setIsSelectingEnd(true);
                            return;
                        }

                        const currentStart = parseYmdToLocalDate(valueFrom) ?? clicked;
                        const from = clicked < currentStart ? clicked : currentStart;
                        const to = clicked < currentStart ? currentStart : clicked;

                        onChange({ from: formatLocalDateToYmd(from), to: formatLocalDateToYmd(to) });
                        setIsSelectingEnd(false);
                        setOpen(false);
                    }}
                />
            </PopoverContent>
        </Popover>
    );
}