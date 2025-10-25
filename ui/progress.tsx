"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  colorScheme?: "default" | "blue" | "green" | "orange" | "purple" | "rose" | "indigo" | "teal"
}

const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, ProgressProps>(
  ({ className, value, colorScheme = "default", ...props }, ref) => {
    const getColorScheme = (scheme: string) => {
      switch (scheme) {
        case "blue":
          return "bg-blue-500"
        case "green":
          return "bg-green-500"
        case "orange":
          return "bg-orange-500"
        case "purple":
          return "bg-purple-500"
        case "rose":
          return "bg-rose-500"
        case "indigo":
          return "bg-indigo-500"
        case "teal":
          return "bg-teal-500"
        default:
          return "progress-colorful"
      }
    }

    return (
      <ProgressPrimitive.Root
        ref={ref}
        className={cn("relative h-2 w-full overflow-hidden rounded-full bg-secondary", className)}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn("h-full w-full flex-1 transition-all", getColorScheme(colorScheme))}
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </ProgressPrimitive.Root>
    )
  },
)
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
