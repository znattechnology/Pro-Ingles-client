/**
 * Enhanced Toast Functions
 * 
 * Wrapper around Sonner with consistent styling and better UX
 */

import { toast } from "sonner";
import { CheckCircle, XCircle, AlertTriangle, Info, Loader2 } from "lucide-react";

// Types for enhanced toasts
interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Enhanced toast functions with consistent styling
export const enhancedToast = {
  success: (message: string, options: ToastOptions = {}) => {
    return toast.success(message, {
      description: options.description,
      duration: options.duration || 4000,
      icon: <CheckCircle className="w-4 h-4" />,
      action: options.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
      style: {
        background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%)",
        border: "1px solid rgba(34, 197, 94, 0.3)",
        color: "rgb(34, 197, 94)",
      },
    });
  },

  error: (message: string, options: ToastOptions = {}) => {
    return toast.error(message, {
      description: options.description,
      duration: options.duration || 6000,
      icon: <XCircle className="w-4 h-4" />,
      action: options.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
      style: {
        background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)",
        border: "1px solid rgba(239, 68, 68, 0.3)",
        color: "rgb(239, 68, 68)",
      },
    });
  },

  warning: (message: string, options: ToastOptions = {}) => {
    return toast.warning(message, {
      description: options.description,
      duration: options.duration || 5000,
      icon: <AlertTriangle className="w-4 h-4" />,
      action: options.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
      style: {
        background: "linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)",
        border: "1px solid rgba(245, 158, 11, 0.3)",
        color: "rgb(245, 158, 11)",
      },
    });
  },

  info: (message: string, options: ToastOptions = {}) => {
    return toast.info(message, {
      description: options.description,
      duration: options.duration || 4000,
      icon: <Info className="w-4 h-4" />,
      action: options.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
      style: {
        background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)",
        border: "1px solid rgba(59, 130, 246, 0.3)",
        color: "rgb(59, 130, 246)",
      },
    });
  },

  loading: (message: string, options: Omit<ToastOptions, 'duration'> = {}) => {
    return toast.loading(message, {
      description: options.description,
      icon: <Loader2 className="w-4 h-4 animate-spin" />,
      style: {
        background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)",
        border: "1px solid rgba(139, 92, 246, 0.3)",
        color: "rgb(139, 92, 246)",
      },
    });
  },

  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(promise, {
      loading,
      success,
      error,
      style: {
        background: "rgb(30, 30, 35)",
        border: "1px solid rgb(45, 45, 55)",
        color: "white",
      },
    });
  },
};

// Course-specific toast helpers
export const courseToasts = {
  created: (courseName: string) => {
    return enhancedToast.success(`Curso criado com sucesso!`, {
      description: `"${courseName}" foi adicionado à sua lista de cursos.`,
      action: {
        label: "Ver cursos",
        onClick: () => window.location.href = "/teacher/laboratory/manage-courses"
      }
    });
  },

  updated: (courseName: string) => {
    return enhancedToast.success(`Curso atualizado!`, {
      description: `"${courseName}" foi salvo com sucesso.`,
    });
  },

  deleted: (courseName: string) => {
    return enhancedToast.success(`Curso excluído!`, {
      description: `"${courseName}" foi removido permanentemente.`,
    });
  },

  published: (courseName: string) => {
    return enhancedToast.success(`Curso publicado!`, {
      description: `"${courseName}" agora está disponível para estudantes.`,
    });
  },

  unpublished: (courseName: string) => {
    return enhancedToast.warning(`Curso despublicado`, {
      description: `"${courseName}" não está mais visível para estudantes.`,
    });
  },

  error: (action: string, error: string) => {
    return enhancedToast.error(`Erro ao ${action}`, {
      description: error,
      action: {
        label: "Tentar novamente",
        onClick: () => window.location.reload()
      }
    });
  },
};