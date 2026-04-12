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
      className={cn("p-3", className)}
      classNames={{
        [UI.Months]: "flex flex-col sm:flex-row gap-4",
        [UI.Month]: "space-y-4",
        [UI.MonthCaption]: "flex justify-center pt-1 relative items-center",
        [UI.CaptionLabel]: "text-sm font-medium",
        [UI.Nav]: "flex items-center gap-1",
        [UI.PreviousMonthButton]: cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "absolute left-1 size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        [UI.NextMonthButton]: cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "absolute right-1 size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        [UI.MonthGrid]: "w-full border-collapse space-y-1",
        [UI.Weekdays]: "flex",
        [UI.Weekday]:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        [UI.Weeks]: "flex flex-col",
        [UI.Week]: "flex w-full mt-2",
        [UI.Day]:
          "relative flex h-9 w-9 items-center justify-center p-0 text-center text-sm focus-within:relative focus-within:z-20",
        [UI.DayButton]: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal"
        ),

        // Flags
        [DayFlag.outside]: "text-muted-foreground opacity-50",
        [DayFlag.disabled]: "text-muted-foreground opacity-50",
        [DayFlag.hidden]: "invisible",
        [DayFlag.today]: "[&>button]:bg-accent [&>button]:text-accent-foreground",

        // Range selection states (apply to Day cell; we style the inner button via selectors)
        [SelectionState.range_start]:
          "rounded-l-md bg-accent [&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground",
        [SelectionState.range_end]:
          "rounded-r-md bg-accent [&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground",
        [SelectionState.range_middle]:
          "bg-accent [&>button]:bg-transparent [&>button]:text-accent-foreground [&>button]:hover:bg-transparent",
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
