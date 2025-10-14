import * as React from "react"
import toast from "react-hot-toast"

export const useToast = () => {
  const toastFunction = React.useCallback(
    ({
      title,
      description,
      variant = "default",
    }: {
      title?: string
      description?: string
      variant?: "default" | "destructive"
    }) => {
      const message = title || description || ""
      
      if (variant === "destructive") {
        toast.error(message, {
          duration: 4000,
          position: "top-right",
        })
      } else {
        toast.success(message, {
          duration: 3000,
          position: "top-right",
        })
      }

      return {
        id: Math.random().toString(36).substr(2, 9),
        dismiss: () => toast.dismiss(),
      }
    },
    []
  )

  return {
    toast: toastFunction,
    dismiss: () => toast.dismiss(),
  }
}