"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  isLoading?: boolean;
  showSizeSelector?: boolean;
  showInfo?: boolean;
  className?: string;
}

const limitOptions = [10, 20, 50, 100];

export function Pagination({
  pagination,
  onPageChange,
  onLimitChange,
  isLoading = false,
  showSizeSelector = true,
  showInfo = true,
  className = ""
}: PaginationProps) {
  const generatePageNumbers = () => {
    const { page, total_pages } = pagination;
    const pages: (number | string)[] = [];
    
    if (total_pages <= 7) {
      // Se temos 7 ou menos páginas, mostra todas
      for (let i = 1; i <= total_pages; i++) {
        pages.push(i);
      }
    } else {
      // Sempre mostra primeira página
      pages.push(1);
      
      if (page > 3) {
        pages.push('...');
      }
      
      // Mostra páginas ao redor da atual
      const start = Math.max(2, page - 1);
      const end = Math.min(total_pages - 1, page + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }
      
      if (page < total_pages - 2) {
        pages.push('...');
      }
      
      // Sempre mostra última página
      if (total_pages > 1) {
        pages.push(total_pages);
      }
    }
    
    return pages;
  };

  const pageNumbers = generatePageNumbers();

  if (pagination.total_pages <= 1) {
    return null;
  }

  return (
    <motion.div 
      className={`flex flex-col lg:flex-row items-center justify-between gap-4 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Informações da paginação */}
      {showInfo && (
        <div className="flex items-center gap-4 text-sm text-white/70">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-violet-400" />
            <span className="font-medium text-white">
              Página {pagination.page} de {pagination.total_pages}
            </span>
          </div>
          <div className="h-4 w-px bg-violet-900/30" />
          <span>
            {pagination.total} itens no total
          </span>
          <div className="h-4 w-px bg-violet-900/30" />
          <span>
            Mostrando {Math.min(pagination.limit, pagination.total - (pagination.page - 1) * pagination.limit)} de {pagination.limit} por página
          </span>
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* Seletor de quantidade por página */}
        {showSizeSelector && onLimitChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/70 whitespace-nowrap">Por página:</span>
            <Select
              value={pagination.limit.toString()}
              onValueChange={(value) => onLimitChange(parseInt(value))}
              disabled={isLoading}
            >
              <SelectTrigger className="w-20 h-8 bg-violet-900/20 border-violet-900/30 text-white hover:border-violet-500 transition-all duration-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black/90 backdrop-blur-sm border-violet-900/30">
                {limitOptions.map((option) => (
                  <SelectItem 
                    key={option} 
                    value={option.toString()} 
                    className="text-white hover:bg-violet-900/20 focus:bg-violet-900/20"
                  >
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Controles de navegação */}
        <div className="flex items-center gap-1">
          {/* Primeira página */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-violet-900/20 disabled:opacity-50"
            disabled={!pagination.has_prev || isLoading}
            onClick={() => onPageChange(1)}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* Página anterior */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-white/70 hover:text-white hover:bg-violet-900/20 disabled:opacity-50"
            disabled={!pagination.has_prev || isLoading}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Anterior</span>
          </Button>

          {/* Números das páginas */}
          <div className="flex items-center gap-1">
            {pageNumbers.map((pageNum, index) => {
              if (pageNum === '...') {
                return (
                  <div key={index} className="flex items-center justify-center h-8 w-8">
                    <MoreHorizontal className="h-4 w-4 text-white/50" />
                  </div>
                );
              }

              const isCurrentPage = pageNum === pagination.page;
              
              return (
                <motion.div key={pageNum}>
                  <Button
                    variant={isCurrentPage ? "default" : "ghost"}
                    size="sm"
                    className={`h-8 w-8 p-0 ${
                      isCurrentPage 
                        ? "bg-violet-600 text-white hover:bg-violet-700 shadow-lg" 
                        : "text-white/70 hover:text-white hover:bg-violet-900/20"
                    } transition-all duration-300`}
                    onClick={() => onPageChange(pageNum as number)}
                    disabled={isLoading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {pageNum}
                  </Button>
                </motion.div>
              );
            })}
          </div>

          {/* Próxima página */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-white/70 hover:text-white hover:bg-violet-900/20 disabled:opacity-50"
            disabled={!pagination.has_next || isLoading}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            <span className="hidden sm:inline">Próxima</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>

          {/* Última página */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-violet-900/20 disabled:opacity-50"
            disabled={!pagination.has_next || isLoading}
            onClick={() => onPageChange(pagination.total_pages)}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// Componente simples para apenas navegação
export function SimplePagination({
  pagination,
  onPageChange,
  isLoading = false,
  className = ""
}: Pick<PaginationProps, 'pagination' | 'onPageChange' | 'isLoading' | 'className'>) {
  return (
    <Pagination
      pagination={pagination}
      onPageChange={onPageChange}
      isLoading={isLoading}
      showSizeSelector={false}
      showInfo={false}
      className={className}
    />
  );
}