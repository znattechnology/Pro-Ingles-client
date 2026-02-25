'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings } from 'lucide-react';
import type { VapiConfig } from '../../types';
import { CORRECTION_MODES } from '../../constants';

interface ConfigCardProps {
  config: VapiConfig;
  onChange: (config: Partial<VapiConfig>) => void;
}

export function ConfigCard({ config, onChange }: ConfigCardProps) {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Settings className="w-5 h-5" />
          Configuracoes da Sessao
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Duration */}
          <div className="space-y-2">
            <Label className="text-white">
              Duracao maxima: {config.maxDurationMinutes} minutos
            </Label>
            <Slider
              value={[config.maxDurationMinutes]}
              onValueChange={([value]) => onChange({ maxDurationMinutes: value })}
              max={30}
              min={5}
              step={1}
              className="w-full"
            />
          </div>

          {/* Correction Mode */}
          <div className="space-y-2">
            <Label className="text-white">Modo de Correcao</Label>
            <Select
              value={config.correction_mode}
              onValueChange={(value) => onChange({ correction_mode: value as VapiConfig['correction_mode'] })}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {CORRECTION_MODES.map((mode) => (
                  <SelectItem
                    key={mode.id}
                    value={mode.id}
                    className="text-white hover:bg-gray-600"
                  >
                    <div>
                      <div className="font-medium">{mode.name}</div>
                      <div className="text-sm text-gray-400">{mode.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="autoEnd"
            checked={config.autoEndEnabled}
            onChange={(e) => onChange({ autoEndEnabled: e.target.checked })}
            className="w-4 h-4 text-violet-600"
          />
          <Label htmlFor="autoEnd" className="text-white">
            Encerrar automaticamente quando o tempo acabar
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}

export default ConfigCard;
