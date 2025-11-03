"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

interface PerformanceChartProps {
  data: {
    monthlyGrowth: number;
    engagementRate: number;
    studentRetention: number;
    contentQuality: number;
  };
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  const metrics = [
    {
      label: 'Crescimento',
      value: data.monthlyGrowth,
      color: 'bg-green-500',
      icon: data.monthlyGrowth >= 0 ? TrendingUp : TrendingDown,
      colorClass: data.monthlyGrowth >= 0 ? 'text-green-400' : 'text-red-400',
      suffix: '%'
    },
    {
      label: 'Engajamento',
      value: data.engagementRate,
      color: 'bg-blue-500',
      icon: BarChart3,
      colorClass: 'text-blue-400',
      suffix: '%'
    },
    {
      label: 'Retenção',
      value: data.studentRetention,
      color: 'bg-purple-500',
      icon: BarChart3,
      colorClass: 'text-purple-400',
      suffix: '%'
    },
    {
      label: 'Qualidade',
      value: data.contentQuality,
      color: 'bg-yellow-500',
      icon: BarChart3,
      colorClass: 'text-yellow-400',
      suffix: '%'
    },
  ];

  const getPerformanceLevel = (value: number, metric: string) => {
    if (metric === 'Crescimento') {
      if (value >= 10) return { label: 'Excelente', color: 'bg-green-600/20 text-green-400' };
      if (value >= 0) return { label: 'Bom', color: 'bg-blue-600/20 text-blue-400' };
      return { label: 'Atenção', color: 'bg-red-600/20 text-red-400' };
    }
    
    if (value >= 80) return { label: 'Excelente', color: 'bg-green-600/20 text-green-400' };
    if (value >= 60) return { label: 'Bom', color: 'bg-blue-600/20 text-blue-400' };
    if (value >= 40) return { label: 'Regular', color: 'bg-yellow-600/20 text-yellow-400' };
    return { label: 'Melhorar', color: 'bg-red-600/20 text-red-400' };
  };

  return (
    <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          <BarChart3 className="w-5 h-5" />
          Performance Geral
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map((metric, index) => {
          const performance = getPerformanceLevel(metric.value, metric.label);
          const percentage = metric.label === 'Crescimento' 
            ? Math.min(100, Math.max(0, metric.value + 50)) // Convert growth to 0-100 scale
            : Math.min(100, Math.max(0, metric.value));

          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <metric.icon className={`w-4 h-4 ${metric.colorClass}`} />
                  <span className="text-sm text-gray-300">{metric.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">
                    {metric.value.toFixed(1)}{metric.suffix}
                  </span>
                  <Badge className={performance.color}>
                    {performance.label}
                  </Badge>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-700/50 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                  className={`h-2 rounded-full ${metric.color} opacity-70`}
                />
              </div>
            </motion.div>
          );
        })}
        
        {/* Overall Score */}
        <div className="pt-4 border-t border-gray-600/30">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Score Geral</span>
            <span className="text-xl font-bold text-white">
              {((data.engagementRate + data.studentRetention + data.contentQuality) / 3).toFixed(0)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}