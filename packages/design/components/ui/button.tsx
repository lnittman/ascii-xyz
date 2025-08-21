import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium hover-transition disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[2px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/80 hover:scale-[1.02] active:bg-primary/90 active:scale-100",
        accent:
          "bg-accent text-accent-foreground hover:bg-accent/70 hover:scale-[1.02] active:bg-accent/60 active:scale-100",
        destructive:
          "bg-transparent border-2 border-red-500/70 text-red-500/90 relative hover:-translate-y-[1px] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/90 hover:shadow-[0_2px_6px_rgba(239,68,68,0.15)] active:translate-y-[1px] active:bg-red-500/20 active:shadow-none active:border-red-500 focus-visible:ring-red-500/20 dark:bg-transparent dark:border-red-500/60 dark:text-red-500/80 dark:hover:bg-red-500/10 dark:hover:text-red-500 dark:hover:border-red-500/80 dark:hover:shadow-[0_2px_6px_rgba(239,68,68,0.25)] dark:active:bg-red-500/20 dark:active:border-red-500/90",
        outline:
          "border border-input bg-background text-foreground hover:bg-accent/40 hover:text-accent-foreground hover:border-accent/90 hover:scale-[1.02] active:bg-accent/50 active:border-accent active:scale-100 dark:bg-transparent dark:border-input dark:hover:bg-accent/30 dark:hover:border-accent/70 dark:active:bg-accent/40 dark:active:border-accent/90",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-[1.02] active:bg-secondary/90 active:scale-100 dark:hover:bg-secondary/80 dark:active:bg-secondary/90",
        ghost:
          "text-foreground hover:bg-accent/30 hover:text-accent-foreground hover:scale-[1.02] active:bg-accent/40 active:scale-100 dark:hover:bg-accent/30 dark:active:bg-accent/40",
        link: 
          "text-primary underline-offset-4 hover:underline hover:text-primary/80 active:text-primary/70 dark:text-sidebar-primary dark:hover:text-sidebar-primary/80 dark:active:text-sidebar-primary/70",
        subtle: 
          "bg-accent/20 text-accent-foreground hover:bg-accent/40 hover:scale-[1.02] active:bg-accent/50 active:scale-100 dark:bg-accent/10 dark:hover:bg-accent/30 dark:active:bg-accent/40",
        paper: 
          "bg-background text-foreground border hover:bg-card/90 hover:border-accent/50 hover:scale-[1.02] active:bg-card active:border-accent/70 active:scale-100 dark:hover:bg-card/90 dark:hover:border-accent/50 dark:active:bg-card dark:active:border-accent/70",
        fm: 
          "bg-[#ff5a36] text-foreground font-medium border-2 border-transparent relative hover:-translate-y-[2px] hover:bg-[#ff6e4d] hover:border-white/20 hover:shadow-[0_2px_6px_rgba(0,0,0,0.25)] active:translate-y-[1px] active:bg-[#f44125] active:shadow-none active:border-white/30 dark:bg-[#e84d2c] dark:hover:bg-[#ff5a36] dark:active:bg-[#d73b1e] dark:shadow-[0_0_10px_rgba(255,90,54,0.2)]",
        phono: 
          "bg-[#f8d949] text-foreground font-medium border-2 border-black/10 relative hover:-translate-y-[2px] hover:bg-[#ffea6b] hover:border-black/20 hover:shadow-[0_2px_6px_rgba(0,0,0,0.2)] active:translate-y-[1px] active:bg-[#e6c833] active:shadow-none active:border-black/30 dark:bg-[#eac72d] dark:hover:bg-[#f8d949] dark:active:bg-[#d9b71f] dark:shadow-[0_0_10px_rgba(248,217,73,0.25)]",
        power: 
          "bg-[#32c060] text-foreground font-medium border-2 border-transparent relative hover:-translate-y-[2px] hover:scale-[1.02] hover:bg-[#3dd36f] hover:border-white/20 hover:shadow-[0_2px_8px_rgba(0,0,0,0.25)] active:translate-y-[1px] active:scale-100 active:bg-[#28a14f] active:shadow-none active:border-white/30 dark:bg-[#28a14f] dark:hover:bg-[#32c060] dark:active:bg-[#1f8640] dark:shadow-[0_0_10px_rgba(50,192,96,0.2)]",
        mono: 
          "relative bg-[#f2f2f2] border-2 border-[#e0e0e0] text-foreground font-medium after:content-[''] after:absolute after:inset-[1px] after:bg-white/80 after:rounded-[0.25rem] after:z-0 hover:-translate-y-[1px] hover:after:opacity-0 hover:border-[#ccc] hover:bg-white hover:shadow-[0_2px_6px_rgba(0,0,0,0.1)] active:translate-y-[1px] active:border-accent/60 active:shadow-none dark:bg-[#242424] dark:border-[#333] dark:after:bg-white/[0.03] dark:hover:bg-[#2a2a2a] dark:hover:border-[#444] dark:active:bg-[#333] [&>*]:relative [&>*]:z-10",
        control: 
          "relative overflow-hidden border-2 border-[#e0e0e0] text-[#333] font-medium bg-gradient-to-b from-white to-[#f5f5f5] before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/90 before:to-transparent before:opacity-100 hover:-translate-y-[2px] hover:from-white hover:to-[#ececec] hover:border-[#c0c0c0] hover:shadow-[0_3px_8px_rgba(0,0,0,0.15)] active:translate-y-[1px] active:shadow-none active:from-[#f0f0f0] active:to-[#e0e0e0] active:border-[#b0b0b0] active:before:opacity-0 dark:from-[#2a2a2a] dark:to-[#222] dark:border-[#333] dark:text-[#e0e0e0] dark:before:from-white/5 dark:hover:from-[#333] dark:hover:to-[#282828] dark:hover:border-[#444] dark:hover:shadow-[0_3px_8px_rgba(0,0,0,0.3)] dark:active:from-[#282828] dark:active:to-[#333] dark:active:border-[#555]",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 px-6 has-[>svg]:px-4",
        icon: "size-9",
        pill: "h-8 rounded-full px-4 has-[>svg]:px-3",
        square: "aspect-square p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
