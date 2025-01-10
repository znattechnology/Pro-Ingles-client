"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertCircle, CheckCircle2, Trash2, TriangleAlertIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const bannerVariants = cva(
  "relative w-full flex items-center justify-between gap-4 rounded-lg px-4 py-3 text-sm transition-all mb-4",
  {
    variants: {
      variant: {
        info: [
          "border border-blue-200",
          "bg-blue-50 dark:bg-blue-950",
          "text-blue-700 dark:text-blue-200",
          "[&>svg]:text-blue-600 dark:[&>svg]:text-blue-200",
        ],
        success: [
          "border border-green-200",
          "bg-green-50 dark:bg-green-950",
          "text-green-700 dark:text-green-200",
          "[&>svg]:text-green-600 dark:[&>svg]:text-green-200",
        ],
        danger: [
          "border border-red-200",
          "bg-red-50 dark:bg-red-950",
          "text-red-700 dark:text-red-200",
          "[&>svg]:text-red-600 dark:[&>svg]:text-red-200",
        ],
        warning: [
          "border border-yellow-200",
          "bg-yellow-50 dark:bg-yellow-950",
          "text-yellow-700 dark:text-yellow-200",
          "[&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-200",
        ],
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
)

export interface BannerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bannerVariants> {
  message: React.ReactNode // Permitir texto ou JSX
  onDismiss?: () => void
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
}

export function Banner({
  className,
  variant,
  message,
  onDismiss,
  icon,
  action,
  ...props
}: BannerProps) {
  const [isVisible, setIsVisible] = React.useState(true)

  if (!isVisible) return null

  const handleDismiss = () => {
    setIsVisible(false)
    if (onDismiss) onDismiss()
  }

  const Icon = React.useMemo(() => {
    if (icon) return icon
    switch (variant) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
      case "danger":
        return <Trash2 className="h-5 w-5 flex-shrink-0" />
      case "warning":
        return <TriangleAlertIcon className="h-5 w-5 flex-shrink-0" />
      case "info":
      default:
        return <AlertCircle className="h-5 w-5 flex-shrink-0" />
    }
  }, [variant, icon])

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn("animate-in fade-in slide-in-from-top-1", className)}
      {...props}
    >
      <div className={cn(bannerVariants({ variant }))}>
        {Icon}
        <div className="flex-1 text-sm">{message}</div>
        {action && (
          <Button
            variant="ghost"
            size="sm"
            onClick={action.onClick}
            className="mx-2 h-8 px-2 font-medium"
          >
            {action.label}
          </Button>
        )}
        <button
          onClick={handleDismiss}
          className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Fechar</span>
        </button>
      </div>
    </div>
  )
}

// Exemplo de uso
function InfoBanner() {
  return (
    <div className="space-y-4">
      <Banner
        variant="info"
        message="Você tem 3 novas notificações pendentes."
        action={{
          label: "Ver todas",
          onClick: () => console.log("Visualizar notificações"),
        }}
      />
      <Banner
        variant="success"
        message="Suas alterações foram salvas com sucesso!"
        onDismiss={() => console.log("Banner fechado")}
      />
      <Banner
        variant="info"
        message="Uma nova atualização está disponível para o sistema."
        action={{
          label: "Atualizar agora",
          onClick: () => console.log("Iniciando atualização"),
        }}
      />
      <Banner
        variant="success"
        message="Parabéns! Seu perfil foi verificado com sucesso."
      />
    </div>
  )
}

export default InfoBanner
