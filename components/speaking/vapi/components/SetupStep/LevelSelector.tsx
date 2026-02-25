'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';
import type { VapiConfig, LevelOption } from '../../types';
import { LEVELS } from '../../constants';

interface LevelSelectorProps {
  level: VapiConfig['level'];
  onChange: (level: VapiConfig['level']) => void;
}

export function LevelSelector({ level, onChange }: LevelSelectorProps) {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Target className="w-5 h-5" />
          Nivel de Ingles
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {LEVELS.map((levelOption: LevelOption) => (
            <div
              key={levelOption.id}
              className={`p-4 rounded-lg cursor-pointer border-2 transition-all ${
                level === levelOption.id
                  ? 'border-violet-500 bg-violet-900/30'
                  : 'border-gray-600 bg-gray-700 hover:border-gray-500'
              }`}
              onClick={() => onChange(levelOption.id as VapiConfig['level'])}
            >
              <div className={`w-4 h-4 rounded-full ${levelOption.color} mb-2`}></div>
              <h3 className="font-semibold text-white">{levelOption.name}</h3>
              <p className="text-sm text-gray-300 mt-1">{levelOption.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default LevelSelector;
