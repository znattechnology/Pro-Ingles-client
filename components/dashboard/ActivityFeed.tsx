"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Users, 
  BookOpen, 
  TrendingUp, 
  Calendar,
  Clock
} from 'lucide-react';

interface ActivityFeedProps {
  stats: {
    totalStudents: number;
    activeStudents: number;
    recentActivity: number;
    totalCourses: number;
    publishedCourses: number;
    avgCompletionRate: number;
  };
}

export function ActivityFeed({ stats }: ActivityFeedProps) {
  const activities = React.useMemo(() => {
    const items = [];
    
    // Generate activity items based on stats
    if (stats.recentActivity > 0) {
      items.push({
        type: 'course_update',
        icon: BookOpen,
        title: 'Cursos Atualizados',
        description: `${stats.recentActivity} curso(s) foram atualizados recentemente`,
        time: 'Últimos 30 dias',
        color: 'text-blue-400'
      });
    }
    
    if (stats.activeStudents > 0) {
      items.push({
        type: 'student_activity',
        icon: Users,
        title: 'Estudantes Ativos',
        description: `${stats.activeStudents} estudantes estão atualmente ativos`,
        time: 'Agora',
        color: 'text-green-400'
      });
    }
    
    if (stats.avgCompletionRate > 0) {
      items.push({
        type: 'completion',
        icon: TrendingUp,
        title: 'Taxa de Conclusão',
        description: `${stats.avgCompletionRate.toFixed(1)}% de taxa média de conclusão`,
        time: 'Este mês',
        color: 'text-purple-400'
      });
    }
    
    if (stats.publishedCourses > 0) {
      items.push({
        type: 'published',
        icon: BookOpen,
        title: 'Cursos Publicados',
        description: `${stats.publishedCourses} curso(s) estão publicados e disponíveis`,
        time: 'Total',
        color: 'text-violet-400'
      });
    }
    
    return items;
  }, [stats]);

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'course_update':
        return { label: 'Novo', color: 'bg-blue-600/20 text-blue-400' };
      case 'student_activity':
        return { label: 'Ativo', color: 'bg-green-600/20 text-green-400' };
      case 'completion':
        return { label: 'Sucesso', color: 'bg-purple-600/20 text-purple-400' };
      case 'published':
        return { label: 'Público', color: 'bg-violet-600/20 text-violet-400' };
      default:
        return { label: 'Info', color: 'bg-gray-600/20 text-gray-400' };
    }
  };

  return (
    <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          <Activity className="w-5 h-5" />
          Atividade Recente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity, index) => {
            const badge = getActivityBadge(activity.type);
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-customgreys-darkGrey/20 hover:bg-customgreys-darkGrey/40 transition-all group"
              >
                <div className="p-2 rounded-lg bg-customgreys-darkGrey/50">
                  <activity.icon className={`w-4 h-4 ${activity.color}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-white text-sm">{activity.title}</h4>
                    <Badge className={badge.color}>
                      {badge.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{activity.description}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {activity.time}
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-sm">Nenhuma atividade recente</p>
            <p className="text-gray-500 text-xs mt-1">
              Comece criando ou atualizando um curso
            </p>
          </div>
        )}
        
        {/* Quick Stats Summary */}
        <div className="pt-4 border-t border-gray-600/30">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalStudents}</p>
              <p className="text-xs text-gray-400">Total Estudantes</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.publishedCourses}</p>
              <p className="text-xs text-gray-400">Cursos Publicados</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}