
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbsProps {
  className?: string;
}

interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  isHome?: boolean;
  isLast?: boolean;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ className }) => {
  const pathname = usePathname();
  
  // Generate breadcrumb items from pathname
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

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
      const label = getReadableLabel(segments[i], segments);
      
      // Fix href for role-based navigation
      let href = currentPath;
      if (segments[i] === 'user' && i === 0) {
        href = '/user/dashboard';
      } else if (segments[i] === 'teacher' && i === 0) {
        href = '/teacher/dashboard';
      } else if (segments[i] === 'admin' && i === 0) {
        href = '/admin/dashboard';
      }
      
      breadcrumbs.push({
        label,
        href,
        isLast: i === segments.length - 1
      });
    }

    return breadcrumbs;
  };

  const getReadableLabel = (segment: string, segments: string[]) => {
    const labelMap: Record<string, string> = {
      // Role-based navigation
      'user': 'Estudante',
      'teacher': 'Professor', 
      'admin': 'Administrador',
      
      // Main sections
      'dashboard': 'Dashboard',
      'courses': 'Meus Cursos',
      'billing': 'Pagamentos',
      'profile': 'Perfil',
      'settings': 'Configurações',
      
      // Learning paths
      'learn': 'Practice Lab',
      'laboratory': 'Laboratório',
      'leaderboard': 'Classificações',
      'achievements': 'Conquistas',
      'shop': 'Loja',
      'analytics': 'Analytics',
      
      // Course management
      'create-course': 'Criar Curso',
      'manage-courses': 'Gerenciar Cursos',
      'lesson-constructor': 'Construtor de Lições',
      'challenge-constructor': 'Construtor de Desafios',
      'chapters': 'Capítulos',
      'explore': 'Explorar Cursos',
      
      // Special handling for nested paths
      'cms': 'CMS',
      'users': 'Usuários'
    };

    // Handle specific context-dependent translations
    if (segment === 'courses') {
      // If we're in explore, show different label
      if (segments.includes('explore')) {
        return 'Cursos';
      }
      // If we're in teacher section, show different label  
      if (segments.includes('teacher')) {
        return 'Meus Cursos';
      }
      return 'Meus Cursos';
    }

    return labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length <= 1) return null; // Only hide if just home

  return (
    <nav className={cn("flex items-center space-x-2 text-sm mb-6 bg-customgreys-primarybg/30 backdrop-blur-sm rounded-lg px-4 py-2 border border-violet-900/20", className)}>
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={`${crumb.href}-${index}`}>
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-violet-400/60" />
          )}
          
          {crumb.isLast ? (
            <span className="text-white font-medium flex items-center gap-2 px-2 py-1 rounded-md bg-violet-600/20">
              {crumb.isHome && crumb.icon && <crumb.icon className="w-4 h-4" />}
              {crumb.label}
            </span>
          ) : (
            <Link 
              href={crumb.href}
              className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2 px-2 py-1 rounded-md hover:bg-violet-600/10"
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