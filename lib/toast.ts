/**
 * Sistema de Toast Notifications - Centralizado
 * 
 * Fornece notificações consistentes em toda a aplicação
 * usando react-hot-toast com estilos customizados.
 */

import toast, { ToastOptions } from 'react-hot-toast';

// =============================================
// TOAST CONFIGURATIONS
// =============================================

const defaultToastOptions: ToastOptions = {
  duration: 4000,
  position: 'top-right',
  style: {
    background: '#1f2937', // customgreys-secondarybg
    color: '#ffffff',
    border: '1px solid #374151', // customgreys-darkerGrey
    borderRadius: '12px',
    padding: '16px',
    fontSize: '14px',
    fontWeight: '500',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    backdropFilter: 'blur(8px)',
  },
};

const successToastOptions: ToastOptions = {
  ...defaultToastOptions,
  icon: '✅',
  style: {
    ...defaultToastOptions.style,
    border: '1px solid #10b981', // green-500
    background: 'linear-gradient(135deg, #064e3b 0%, #1f2937 100%)', // green-900 to gray-800
  },
};

const errorToastOptions: ToastOptions = {
  ...defaultToastOptions,
  icon: '❌',
  duration: 6000, // Errors stay longer
  style: {
    ...defaultToastOptions.style,
    border: '1px solid #ef4444', // red-500
    background: 'linear-gradient(135deg, #7f1d1d 0%, #1f2937 100%)', // red-900 to gray-800
  },
};

const warningToastOptions: ToastOptions = {
  ...defaultToastOptions,
  icon: '⚠️',
  style: {
    ...defaultToastOptions.style,
    border: '1px solid #f59e0b', // amber-500
    background: 'linear-gradient(135deg, #78350f 0%, #1f2937 100%)', // amber-900 to gray-800
  },
};

const infoToastOptions: ToastOptions = {
  ...defaultToastOptions,
  icon: 'ℹ️',
  style: {
    ...defaultToastOptions.style,
    border: '1px solid #3b82f6', // blue-500
    background: 'linear-gradient(135deg, #1e3a8a 0%, #1f2937 100%)', // blue-900 to gray-800
  },
};

const loadingToastOptions: ToastOptions = {
  ...defaultToastOptions,
  icon: '⏳',
  duration: Infinity, // Loading toasts don't auto-dismiss
  style: {
    ...defaultToastOptions.style,
    border: '1px solid #8b5cf6', // violet-500
    background: 'linear-gradient(135deg, #5b21b6 0%, #1f2937 100%)', // violet-900 to gray-800
  },
};

// =============================================
// TOAST NOTIFICATION FUNCTIONS
// =============================================

export const notifications = {
  /**
   * Show success notification
   */
  success: (message: string, options?: Partial<ToastOptions>) => {
    return toast.success(message, {
      ...successToastOptions,
      ...options,
    });
  },

  /**
   * Show error notification
   */
  error: (message: string, options?: Partial<ToastOptions>) => {
    return toast.error(message, {
      ...errorToastOptions,
      ...options,
    });
  },

  /**
   * Show warning notification
   */
  warning: (message: string, options?: Partial<ToastOptions>) => {
    return toast(message, {
      ...warningToastOptions,
      ...options,
    });
  },

  /**
   * Show info notification
   */
  info: (message: string, options?: Partial<ToastOptions>) => {
    return toast(message, {
      ...infoToastOptions,
      ...options,
    });
  },

  /**
   * Show loading notification
   */
  loading: (message: string, options?: Partial<ToastOptions>) => {
    return toast.loading(message, {
      ...loadingToastOptions,
      ...options,
    });
  },

  /**
   * Dismiss a specific toast
   */
  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },

  /**
   * Dismiss all toasts
   */
  dismissAll: () => {
    toast.dismiss();
  },

  /**
   * Promise-based notifications for async operations
   */
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: Partial<ToastOptions>
  ) => {
    return toast.promise(
      promise,
      messages,
      {
        loading: { ...loadingToastOptions, ...options },
        success: { ...successToastOptions, ...options },
        error: { ...errorToastOptions, ...options },
      }
    );
  },
};

// =============================================
// LABORATORY SPECIFIC NOTIFICATIONS
// =============================================

export const laboratoryNotifications = {
  // Course notifications
  courseCreated: (courseName: string) =>
    notifications.success(`Curso "${courseName}" criado com sucesso! 🎉`),
  
  courseUpdated: (courseName: string) =>
    notifications.success(`Curso "${courseName}" atualizado com sucesso! ✏️`),
  
  courseDeleted: (courseName: string) =>
    notifications.success(`Curso "${courseName}" removido com sucesso! 🗑️`),
  
  coursePublished: (courseName: string) =>
    notifications.success(`Curso "${courseName}" publicado com sucesso! 📢`),
  
  courseUnpublished: (courseName: string) =>
    notifications.success(`Curso "${courseName}" despublicado com sucesso! 📝`),

  // Unit notifications
  unitCreated: (unitName: string) =>
    notifications.success(`Unidade "${unitName}" criada com sucesso! 📚`),
  
  unitUpdated: (unitName: string) =>
    notifications.success(`Unidade "${unitName}" atualizada com sucesso! ✏️`),
  
  unitDeleted: (unitName: string) =>
    notifications.success(`Unidade "${unitName}" removida com sucesso! 🗑️`),

  // Lesson notifications
  lessonCreated: (lessonName: string) =>
    notifications.success(`Lição "${lessonName}" criada com sucesso! 📖`),
  
  lessonUpdated: (lessonName: string) =>
    notifications.success(`Lição "${lessonName}" atualizada com sucesso! ✏️`),
  
  lessonDeleted: (lessonName: string) =>
    notifications.success(`Lição "${lessonName}" removida com sucesso! 🗑️`),

  // Challenge notifications
  challengeCreated: (challengeType?: string) => {
    const typeEmojis: Record<string, string> = {
      'multiple-choice': '⚪',
      'fill-blank': '📝',
      'translation': '🌐',
      'listening': '🔊',
      'speaking': '🎤',
      'match-pairs': '🔗',
      'sentence-order': '📐',
      'true-false': '✅'
    };
    const emoji = challengeType ? typeEmojis[challengeType] || '🎯' : '🎯';
    const typeLabel = challengeType ? ` (${challengeType})` : '';
    return notifications.success(`Exercício${typeLabel} criado com sucesso! ${emoji}`);
  },
  
  challengeUpdated: (challengeType?: string) => {
    const emoji = challengeType ? '✏️' : '✏️';
    const typeLabel = challengeType ? ` (${challengeType})` : '';
    return notifications.success(`Exercício${typeLabel} atualizado com sucesso! ${emoji}`);
  },
  
  challengeDeleted: (challengeType?: string) => {
    const emoji = challengeType ? '🗑️' : '🗑️';
    const typeLabel = challengeType ? ` (${challengeType})` : '';
    return notifications.success(`Exercício${typeLabel} removido com sucesso! ${emoji}`);
  },

  // Challenge validation notifications
  challengeValidationError: (message: string) =>
    notifications.warning(`Validação do exercício: ${message}`),
    
  challengeTypeChanged: (fromType: string, toType: string) =>
    notifications.info(`Tipo de exercício alterado de ${fromType} para ${toType} 🔄`),

  // Challenge step notifications
  challengeStepCompleted: (step: string) =>
    notifications.success(`Etapa "${step}" concluída! ➡️`),

  // Error notifications
  creationError: (item: string, error?: string) =>
    notifications.error(`Erro ao criar ${item}. ${error ? `Detalhes: ${error}` : 'Tente novamente.'}`),
  
  updateError: (item: string, error?: string) =>
    notifications.error(`Erro ao atualizar ${item}. ${error ? `Detalhes: ${error}` : 'Tente novamente.'}`),
  
  deleteError: (item: string, error?: string) =>
    notifications.error(`Erro ao remover ${item}. ${error ? `Detalhes: ${error}` : 'Tente novamente.'}`),

  // Validation errors
  validationError: (message: string) =>
    notifications.warning(`Validação: ${message}`),

  // Generic success/error for async operations
  asyncOperation: <T>(
    promise: Promise<T>,
    operation: string,
    itemName?: string
  ) => {
    const baseMessage = itemName ? `${operation} "${itemName}"` : operation;
    
    return notifications.promise(
      promise,
      {
        loading: `${baseMessage}...`,
        success: `${baseMessage} realizado com sucesso! ✅`,
        error: (error: any) => {
          const errorMessage = error?.message || error?.toString() || 'Erro desconhecido';
          return `Erro ao ${operation.toLowerCase()}. ${errorMessage}`;
        },
      }
    );
  },
};

// Export default for convenience
export default notifications;