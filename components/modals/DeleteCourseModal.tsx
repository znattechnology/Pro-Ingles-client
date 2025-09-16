"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DeleteCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  course: {
    id: string;
    title: string;
    status?: string;
    enrollments?: any[];
  } | null;
  isDeleting: boolean;
}

export const DeleteCourseModal: React.FC<DeleteCourseModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  course,
  isDeleting,
}) => {
  if (!course) return null;

  const studentCount = course.enrollments?.length || 0;
  const isPublished = course.status === 'Published';

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-customgreys-secondarybg border-red-800/30 max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-600/20 rounded-full">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <DialogTitle className="text-xl font-semibold text-white">
              Deletar Curso
            </DialogTitle>
          </div>
          
          <DialogDescription className="text-gray-300 text-left">
            Tem certeza que deseja deletar este curso? Esta ação é irreversível.
          </DialogDescription>
        </DialogHeader>

        {/* Course Info */}
        <div className="bg-customgreys-darkGrey/50 rounded-lg p-4 border border-red-800/20">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-medium text-white line-clamp-2 flex-1">
              {course.title}
            </h3>
            {isPublished && (
              <Badge className="ml-2 bg-green-500/10 text-green-400 border-green-500/20">
                Publicado
              </Badge>
            )}
          </div>
          
          {studentCount > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-orange-400 rounded-full" />
              <span className="text-orange-400 font-medium">
                {studentCount} {studentCount === 1 ? 'aluno inscrito' : 'alunos inscritos'}
              </span>
            </div>
          )}
        </div>

        {/* Warning Messages */}
        <div className="space-y-3">
          {isPublished && (
            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3">
              <div className="flex items-center gap-2 text-yellow-400 text-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium">Curso Publicado</span>
              </div>
              <p className="text-yellow-300/80 text-xs mt-1">
                Este curso está visível publicamente e será removido do sistema.
              </p>
            </div>
          )}

          {studentCount > 0 && (
            <div className="bg-orange-900/20 border border-orange-600/30 rounded-lg p-3">
              <div className="flex items-center gap-2 text-orange-400 text-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium">Alunos Afetados</span>
              </div>
              <p className="text-orange-300/80 text-xs mt-1">
                {studentCount} {studentCount === 1 ? 'aluno perderá' : 'alunos perderão'} acesso a este curso e todo o progresso será perdido.
              </p>
            </div>
          )}

          <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <Trash2 className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">Ação Irreversível</span>
            </div>
            <p className="text-red-300/80 text-xs mt-1">
              Todo o conteúdo, capítulos, recursos e dados do curso serão permanentemente removidos.
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deletando...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Deletar Curso
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteCourseModal;