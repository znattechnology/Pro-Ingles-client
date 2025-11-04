"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  AreaChart,
} from 'recharts';

interface ChartData {
  name: string;
  value: number;
}

interface AdminChartCardProps {
  title: string;
  subtitle?: string;
  data: ChartData[];
  icon: LucideIcon;
  iconColor: string;
  chartType: 'line' | 'bar' | 'area';
  chartColor: string;
  bgColor: string;
  borderColor: string;
  formatValue?: (value: number) => string;
  index?: number;
}

export function AdminChartCard({
  title,
  subtitle,
  data,
  icon: Icon,
  iconColor,
  chartType,
  chartColor,
  bgColor,
  borderColor,
  formatValue,
  index = 0,
}: AdminChartCardProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const formattedValue = formatValue ? formatValue(value) : value.toLocaleString('pt-AO');
      
      return (
        <div className="bg-customgreys-darkGrey/95 backdrop-blur-sm border border-violet-900/30 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium">{label}</p>
          <p className={`${chartColor} font-semibold`}>
            {formattedValue}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 5, left: 5, bottom: 5 },
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <XAxis
              dataKey="name"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatValue ? formatValue(value) : value.toLocaleString()}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={chartColor.replace('text-', '#').replace('-400', '')}
              strokeWidth={3}
              dot={{ fill: chartColor.replace('text-', '#').replace('-400', ''), strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, stroke: chartColor.replace('text-', '#').replace('-400', ''), strokeWidth: 2 }}
            />
          </LineChart>
        );
      
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <XAxis
              dataKey="name"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatValue ? formatValue(value) : value.toLocaleString()}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="value"
              fill={`url(#gradient-${index})`}
              radius={[4, 4, 0, 0]}
            />
            <defs>
              <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColor.replace('text-', '#').replace('-400', '')} stopOpacity={0.8} />
                <stop offset="100%" stopColor={chartColor.replace('text-', '#').replace('-400', '')} stopOpacity={0.3} />
              </linearGradient>
            </defs>
          </BarChart>
        );
      
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <XAxis
              dataKey="name"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatValue ? formatValue(value) : value.toLocaleString()}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={chartColor.replace('text-', '#').replace('-400', '')}
              fill={`url(#area-gradient-${index})`}
              strokeWidth={2}
            />
            <defs>
              <linearGradient id={`area-gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColor.replace('text-', '#').replace('-400', '')} stopOpacity={0.4} />
                <stop offset="100%" stopColor={chartColor.replace('text-', '#').replace('-400', '')} stopOpacity={0.1} />
              </linearGradient>
            </defs>
          </AreaChart>
        );
      
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      className="group"
    >
      <Card className={`${bgColor} backdrop-blur-sm ${borderColor} hover:shadow-xl transition-all duration-300 overflow-hidden relative`}>
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className={`absolute top-0 right-0 w-32 h-32 ${iconColor.replace('text-', 'bg-').replace('-400', '-500/5')} rounded-full blur-2xl`} />
        </div>
        
        <CardHeader className="flex flex-row items-center justify-between space-y-0 relative z-10">
          <div>
            <CardTitle className="text-base text-white group-hover:text-gray-100 transition-colors">
              {title}
            </CardTitle>
            {subtitle && (
              <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors mt-1">
                {subtitle}
              </p>
            )}
          </div>
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={`p-2 rounded-lg ${iconColor.replace('text-', 'bg-').replace('-400', '-500/20')}`}
          >
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </motion.div>
        </CardHeader>
        
        <CardContent className="relative z-10">
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 + index * 0.1 }}
            className="text-sm text-gray-400 mt-3 group-hover:text-gray-300 transition-colors"
          >
            {chartType === 'line' && 'Tendência dos últimos 6 meses'}
            {chartType === 'bar' && 'Distribuição mensal'}
            {chartType === 'area' && 'Evolução temporal'}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}