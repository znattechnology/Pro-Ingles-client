"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  X,
  Shield,
  Trash2,
  Power,
  Edit,
  UserX
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'delete' | 'deactivate' | 'activate' | 'role' | 'default';
  isLoading?: boolean;
  userName?: string;
  userRole?: string;
  newRole?: string;
}

const modalVariants = {
  hidden: { 
    opacity: 0,
    scale: 0.8,
    y: 50
  },
  visible: { 
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300
    }
  },
  exit: { 
    opacity: 0,
    scale: 0.8,
    y: 50,
    transition: {
      duration: 0.2
    }
  }
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText = "Cancelar",
  type = 'default',
  isLoading = false,
  userName,
  userRole,
  newRole
}: ConfirmationModalProps) {
  
  const getIcon = () => {
    switch (type) {
      case 'delete':
        return <Trash2 className="h-6 w-6 text-red-400" />;
      case 'deactivate':
        return <UserX className="h-6 w-6 text-orange-400" />;
      case 'activate':
        return <Power className="h-6 w-6 text-green-400" />;
      case 'role':
        return <Shield className="h-6 w-6 text-blue-400" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-yellow-400" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'delete':
        return {
          bg: 'from-red-950/20 to-red-900/10',
          border: 'border-red-900/30',
          button: 'bg-red-600 hover:bg-red-700',
          iconBg: 'bg-red-600/20'
        };
      case 'deactivate':
        return {
          bg: 'from-orange-950/20 to-orange-900/10',
          border: 'border-orange-900/30',
          button: 'bg-orange-600 hover:bg-orange-700',
          iconBg: 'bg-orange-600/20'
        };
      case 'activate':
        return {
          bg: 'from-green-950/20 to-green-900/10',
          border: 'border-green-900/30',
          button: 'bg-green-600 hover:bg-green-700',
          iconBg: 'bg-green-600/20'
        };
      case 'role':
        return {
          bg: 'from-blue-950/20 to-blue-900/10',
          border: 'border-blue-900/30',
          button: 'bg-blue-600 hover:bg-blue-700',
          iconBg: 'bg-blue-600/20'
        };
      default:
        return {
          bg: 'from-violet-950/20 to-purple-900/10',
          border: 'border-violet-900/30',
          button: 'bg-violet-600 hover:bg-violet-700',
          iconBg: 'bg-violet-600/20'
        };
    }
  };

  const colors = getColors();
  const defaultConfirmText = confirmText || (() => {
    switch (type) {
      case 'delete': return 'Eliminar';
      case 'deactivate': return 'Desativar';
      case 'activate': return 'Ativar';
      case 'role': return 'Alterar Role';
      default: return 'Confirmar';
    }
  })();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Card className={`border ${colors.border} bg-gradient-to-br ${colors.bg} backdrop-blur-sm shadow-2xl`}>
                <CardHeader className="relative pb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-white/10"
                    onClick={onClose}
                  >
                    <X className="h-4 w-4 text-white/70" />
                  </Button>
                  
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${colors.iconBg}`}>
                      {getIcon()}
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-white">
                        {title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <p className="text-white/80 leading-relaxed">
                      {description}
                    </p>
                    
                    {userName && (
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/70">Utilizador:</span>
                          <span className="text-white font-medium">{userName}</span>
                        </div>
                        {userRole && (
                          <div className="flex items-center justify-between text-sm mt-1">
                            <span className="text-white/70">Role atual:</span>
                            <span className="text-white font-medium">
                              {userRole === 'student' ? 'Estudante' : 
                               userRole === 'teacher' ? 'Professor' : 
                               userRole === 'admin' ? 'Administrador' : userRole}
                            </span>
                          </div>
                        )}
                        {newRole && (
                          <div className="flex items-center justify-between text-sm mt-1">
                            <span className="text-white/70">Nova role:</span>
                            <span className="text-white font-medium">
                              {newRole === 'student' ? 'Estudante' : 
                               newRole === 'teacher' ? 'Professor' : 
                               newRole === 'admin' ? 'Administrador' : newRole}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1 border-white/20 text-white hover:bg-white/10"
                      onClick={onClose}
                      disabled={isLoading}
                    >
                      {cancelText}
                    </Button>
                    <Button
                      className={`flex-1 ${colors.button} text-white shadow-lg hover:shadow-xl transition-all duration-300`}
                      onClick={onConfirm}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          A processar...
                        </div>
                      ) : (
                        defaultConfirmText
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}