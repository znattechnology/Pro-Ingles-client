'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';
import type { UserProfile } from '../../types';

interface UserProfileCardProps {
  userProfile: UserProfile;
  onChange: (profile: UserProfile) => void;
}

export function UserProfileCard({ userProfile, onChange }: UserProfileCardProps) {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <User className="w-5 h-5" />
          Seu Perfil
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-white">Nome *</Label>
          <Input
            id="username"
            placeholder="Como a IA deve te chamar?"
            value={userProfile.name}
            onChange={(e) => onChange({ ...userProfile, name: e.target.value })}
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="background" className="text-white">Background (opcional)</Label>
          <Input
            id="background"
            placeholder="Ex: Engenheiro de Petroleo, Desenvolvedor..."
            value={userProfile.background || ''}
            onChange={(e) => onChange({ ...userProfile, background: e.target.value })}
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default UserProfileCard;
