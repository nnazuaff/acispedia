import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from "lucide-react"
import * as React from "react"
import {
  DayFlag,
  DayPicker,
  SelectionState,
  UI,
  type ChevronProps,
} from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-2", className)}
      classNames={{
        [UI.Months]: "flex flex-col sm:flex-row gap-3",
        [UI.Month]: "space-y-2",
        [UI.MonthCaption]: "relative flex items-center justify-center px-1 pt-1",
        [UI.CaptionLabel]: "pointer-events-none text-sm font-medium",
        [UI.Nav]: "absolute inset-x-1 top-1 z-10 flex items-center justify-between",
        [UI.PreviousMonthButton]: cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        [UI.NextMonthButton]: cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        [UI.MonthGrid]: "w-full border-collapse space-y-1",
        [UI.Weekdays]: "flex",
        [UI.Weekday]:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.75rem]",
        [UI.Weeks]: "flex flex-col",
        [UI.Week]: "flex w-full mt-1.5",
        [UI.Day]:
          "relative flex h-8 w-8 items-center justify-center p-0 text-center text-sm focus-within:relative focus-within:z-20",
        [UI.DayButton]: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 text-[0.82rem] font-normal"
        ),

        // Flags
        [DayFlag.outside]: "text-muted-foreground opacity-50",
        [DayFlag.disabled]: "text-muted-foreground opacity-50",
        [DayFlag.hidden]: "invisible",
        [DayFlag.today]: "[&>button]:bg-accent [&>button]:text-accent-foreground",

        // Range selection states (apply to Day cell; we style the inner button via selectors)
        [SelectionState.range_start]:
          "rounded-l-md bg-emerald-500/25 [&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground",
        [SelectionState.range_end]:
          "rounded-r-md bg-emerald-500/25 [&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground",
        [SelectionState.range_middle]:
          "bg-emerald-500/25 [&>button]:bg-transparent [&>button]:text-foreground [&>button]:hover:bg-transparent",
        [SelectionState.selected]:
          "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground",

        ...classNames,
      }}
      components={{
        Chevron: ({ className, orientation, disabled, ...props }: ChevronProps) => {
          const Icon =
            orientation === "left"
              ? ChevronLeftIcon
              : orientation === "right"
                ? ChevronRightIcon
                : orientation === "up"
                  ? ChevronUpIcon
                  : ChevronDownIcon

          return <Icon className={cn("size-4", className)} {...props} />
        },
      }}
      {...props}
    />
  )
}

export { Calendar }
