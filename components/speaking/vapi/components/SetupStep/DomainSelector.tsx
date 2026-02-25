'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase } from 'lucide-react';
import type { VapiConfig, DomainOption } from '../../types';
import { DOMAINS } from '../../constants';

interface DomainSelectorProps {
  domain: VapiConfig['domain'];
  objective: string;
  onDomainChange: (domain: VapiConfig['domain']) => void;
  onObjectiveChange: (objective: string) => void;
}

export function DomainSelector({
  domain,
  objective,
  onDomainChange,
  onObjectiveChange,
}: DomainSelectorProps) {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Briefcase className="w-5 h-5" />
          Area de Pratica
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DOMAINS.map((domainOption: DomainOption) => {
            const IconComponent = domainOption.icon;
            return (
              <div
                key={domainOption.id}
                className={`p-6 rounded-lg cursor-pointer border-2 transition-all ${
                  domain === domainOption.id
                    ? 'border-violet-500 bg-violet-900/30'
                    : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                }`}
                onClick={() => onDomainChange(domainOption.id as VapiConfig['domain'])}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg ${domainOption.color} flex items-center justify-center`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{domainOption.name}</h3>
                    <p className="text-sm text-gray-300">{domainOption.description}</p>
                  </div>
                </div>

                {domain === domainOption.id && (
                  <div className="space-y-2">
                    <Label className="text-white text-sm">Objetivo:</Label>
                    <Select
                      value={objective}
                      onValueChange={onObjectiveChange}
                    >
                      <SelectTrigger className="bg-gray-600 border-gray-500 text-white">
                        <SelectValue placeholder="Selecione um objetivo" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        {domainOption.objectives.map((obj) => (
                          <SelectItem
                            key={obj}
                            value={obj}
                            className="text-white hover:bg-gray-600"
                          >
                            {obj}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default DomainSelector;
