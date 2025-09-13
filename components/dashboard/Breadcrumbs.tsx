"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbsProps {
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ className }) => {
  const pathname = usePathname();
  
  // Generate breadcrumb items from pathname
  const generateBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs = [];

    // Add home
    breadcrumbs.push({
      label: 'Home',
      href: '/',
      icon: Home,
      isHome: true
    });

    // Build path progressively
    let currentPath = '';
    
    for (let i = 0; i < segments.length; i++) {
      currentPath += `/${segments[i]}`;
      
      // Skip UUID-like segments (course IDs, etc.)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segments[i]);
      if (isUUID) continue;
      
      // Generate readable labels
      const label = getReadableLabel(segments[i], segments, i);
      
      breadcrumbs.push({
        label,
        href: currentPath,
        isLast: i === segments.length - 1
      });
    }

    return breadcrumbs;
  };

  const getReadableLabel = (segment: string, segments: string[], index: number) => {
    const labelMap: Record<string, string> = {
      'user': 'Estudante',
      'teacher': 'Professor', 
      'admin': 'Administrador',
      'dashboard': 'Dashboard',
      'courses': 'Cursos',
      'billing': 'Pagamentos',
      'profile': 'Perfil',
      'settings': 'Configurações',
      'learn': 'Aprender',
      'laboratory': 'Laboratório',
      'leaderboard': 'Classificações',
      'achievements': 'Conquistas',
      'shop': 'Loja',
      'analytics': 'Analytics',
      'create-course': 'Criar Curso',
      'manage-courses': 'Gerenciar Cursos',
      'lesson-constructor': 'Construtor de Lições',
      'challenge-constructor': 'Construtor de Desafios',
      'chapters': 'Capítulos'
    };

    return labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length <= 2) return null; // Don't show if only home and current page

  return (
    <nav className={cn("flex items-center space-x-2 text-sm mb-6", className)}>
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.href}>
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
          
          {crumb.isLast ? (
            <span className="text-white font-medium flex items-center gap-2">
              {crumb.isHome && crumb.icon && <crumb.icon className="w-4 h-4" />}
              {crumb.label}
            </span>
          ) : (
            <Link 
              href={crumb.href}
              className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 hover:underline"
            >
              {crumb.isHome && crumb.icon && <crumb.icon className="w-4 h-4" />}
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;