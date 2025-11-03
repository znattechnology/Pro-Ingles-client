"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface AdminStatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
  borderColor: string;
  index?: number;
}

export function AdminStatsCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor,
  bgColor,
  borderColor,
  index = 0,
}: AdminStatsCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-emerald-400';
      case 'negative':
        return 'text-red-400';
      default:
        return 'text-blue-400';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive':
        return '+';
      case 'negative':
        return '';
      default:
        return '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <Card className={`${bgColor} backdrop-blur-sm ${borderColor} hover:shadow-xl transition-all duration-300 overflow-hidden relative`}>
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className={`absolute top-0 right-0 w-24 h-24 ${iconColor.replace('text-', 'bg-').replace('-400', '-500/10')} rounded-full blur-xl`} />
        </div>
        
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
            {title}
          </CardTitle>
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={`p-2 rounded-lg ${iconColor.replace('text-', 'bg-').replace('-400', '-500/20')}`}
          >
            <Icon className={`h-4 w-4 ${iconColor} group-hover:scale-110 transition-transform`} />
          </motion.div>
        </CardHeader>
        
        <CardContent className="relative z-10">
          <div className="text-2xl font-bold text-white mb-1 group-hover:scale-105 transition-transform origin-left">
            {value}
          </div>
          
          {change && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Badge 
                className={`${getChangeColor()} bg-transparent text-xs font-medium px-0 hover:bg-transparent`}
                variant="secondary"
              >
                {getChangeIcon()}{change}
              </Badge>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}