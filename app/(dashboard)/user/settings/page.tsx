"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import {
  Settings,
  User,
  Bell,
  Shield,
  Globe,
  Target,
  Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  Upload,
  Trash2,
  LogOut
} from 'lucide-react';
import { useDjangoAuth } from '@/hooks/useDjangoAuth';
import Loading from '@/components/course/Loading';
import { toast } from 'react-hot-toast';

interface UserSettings {
  // Profile
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  bio: string;
  
  // Learning Preferences
  dailyGoal: number;
  studyReminder: boolean;
  reminderTime: string;
  preferredLanguage: string;
  difficultyLevel: string;
  learningPace: string;
  
  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  lessonReminders: boolean;
  weeklyProgress: boolean;
  achievementAlerts: boolean;
  soundEffects: boolean;
  
  // Privacy & Security
  profileVisibility: string;
  showProgress: boolean;
  dataSharing: boolean;
  
  // Interface
  theme: string;
  language: string;
  timezone: string;
}

export default function UserSettingsPage() {
  const { user, isAuthenticated, isLoading } = useDjangoAuth();
  const [settings, setSettings] = useState<UserSettings>({
    firstName: '',
    lastName: '',
    email: '',
    avatar: '',
    bio: '',
    dailyGoal: 5,
    studyReminder: true,
    reminderTime: '19:00',
    preferredLanguage: 'pt',
    difficultyLevel: 'intermediate',
    learningPace: 'normal',
    emailNotifications: true,
    pushNotifications: true,
    lessonReminders: true,
    weeklyProgress: true,
    achievementAlerts: true,
    soundEffects: true,
    profileVisibility: 'public',
    showProgress: true,
    dataSharing: false,
    theme: 'dark',
    language: 'pt-ao',
    timezone: 'Africa/Luanda'
  });
  
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setSettings(prev => ({
        ...prev,
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleSave = async (section: string) => {
    setSaving(true);
    try {
      // TODO: Implement API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success(`Definições de ${section} guardadas com sucesso!`);
    } catch (error) {
      toast.error('Erro ao guardar definições');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSettings(prev => ({ ...prev, avatar: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) return <Loading />;
  
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-customgreys-primarybg text-white">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
          <p className="text-gray-400">Faça login para aceder às suas definições.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-customgreys-primarybg">
      {/* Modern Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative px-4 sm:px-6 py-4 sm:py-6"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-40 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5" />
        
        <div className='relative max-w-7xl mx-auto'>
          <div className="text-center mb-6 sm:mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 sm:px-4 py-1 sm:py-1.5 mb-4 sm:mb-6"
            >
              <Settings className="w-3 h-3 sm:w-4 sm:h-4 text-violet-400" />
              <span className="text-violet-300 font-medium text-xs sm:text-sm">Definições</span>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 px-2"
            >
              Personalize a Sua <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Experiência</span>
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed px-2 sm:px-4"
            >
              Ajuste as suas preferências, privacidade e metas de aprendizagem na plataforma ProEnglish
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tabs Navigation */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-customgreys-secondarybg/60 backdrop-blur-sm border border-violet-900/30 h-auto p-0.5 sm:p-1 gap-0.5 sm:gap-1">
              <TabsTrigger 
                value="profile" 
                className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm data-[state=active]:bg-violet-600 data-[state=active]:text-white min-h-[44px] transition-all"
              >
                <User className="w-4 h-4 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">Perfil</span>
              </TabsTrigger>
              <TabsTrigger 
                value="learning" 
                className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm data-[state=active]:bg-violet-600 data-[state=active]:text-white min-h-[44px] transition-all"
              >
                <Target className="w-4 h-4 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm hidden xs:inline sm:inline">Aprendizagem</span>
                <span className="text-xs xs:hidden sm:hidden">Estudo</span>
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm data-[state=active]:bg-violet-600 data-[state=active]:text-white min-h-[44px] transition-all"
              >
                <Bell className="w-4 h-4 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm hidden xs:inline sm:inline">Notificações</span>
                <span className="text-xs xs:hidden sm:hidden">Avisos</span>
              </TabsTrigger>
              <TabsTrigger 
                value="privacy" 
                className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm data-[state=active]:bg-violet-600 data-[state=active]:text-white min-h-[44px] transition-all"
              >
                <Shield className="w-4 h-4 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm hidden xs:inline sm:inline">Privacidade</span>
                <span className="text-xs xs:hidden sm:hidden">Segurança</span>
              </TabsTrigger>
            </TabsList>
          </motion.div>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-violet-400" />
                    Informações do Perfil
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-xs sm:text-sm md:text-base">
                    Gira as suas informações pessoais e a sua foto de perfil
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  {/* Avatar Section */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                    <Avatar className="w-20 h-20 sm:w-24 sm:h-24">
                      <AvatarImage src={settings.avatar} />
                      <AvatarFallback className="bg-violet-600 text-white text-lg sm:text-xl">
                        {settings.firstName.charAt(0)}{settings.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center sm:text-left space-y-2">
                      <div>
                        <h3 className="text-white font-semibold text-base sm:text-lg">
                          {settings.firstName} {settings.lastName}
                        </h3>
                        <p className="text-gray-400 text-xs sm:text-sm">{settings.email}</p>
                        <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                          <Badge className="bg-blue-600 text-xs">Estudante</Badge>
                          <Badge className="bg-green-600 text-xs">Nível Intermédio</Badge>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button 
                          size="sm" 
                          className="bg-violet-600 hover:bg-violet-700 text-xs sm:text-sm min-h-[40px] px-3 sm:px-4"
                          onClick={() => document.getElementById('avatar-upload')?.click()}
                        >
                          <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Alterar Foto</span>
                          <span className="sm:hidden">Alterar</span>
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs sm:text-sm border-gray-600 text-gray-300 min-h-[40px] px-3 sm:px-4">
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Remover</span>
                          <span className="sm:hidden">Apagar</span>
                        </Button>
                      </div>
                      <input 
                        id="avatar-upload" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleAvatarUpload}
                      />
                    </div>
                  </div>

                  <Separator className="bg-gray-600" />

                  {/* Personal Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label className="text-gray-300 text-sm sm:text-base">Primeiro Nome</Label>
                      <Input
                        value={settings.firstName}
                        onChange={(e) => setSettings(prev => ({ ...prev, firstName: e.target.value }))}
                        className="bg-customgreys-darkGrey border-gray-600 text-white text-sm sm:text-base"
                        placeholder="Seu primeiro nome"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300 text-sm sm:text-base">Último Nome</Label>
                      <Input
                        value={settings.lastName}
                        onChange={(e) => setSettings(prev => ({ ...prev, lastName: e.target.value }))}
                        className="bg-customgreys-darkGrey border-gray-600 text-white text-sm sm:text-base"
                        placeholder="Seu último nome"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label className="text-gray-300 text-sm sm:text-base">Email</Label>
                      <Input
                        type="email"
                        value={settings.email}
                        onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                        className="bg-customgreys-darkGrey border-gray-600 text-white text-sm sm:text-base"
                        placeholder="seu@email.com"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label className="text-gray-300 text-sm sm:text-base">Biografia</Label>
                      <textarea
                        value={settings.bio}
                        onChange={(e) => setSettings(prev => ({ ...prev, bio: e.target.value }))}
                        className="w-full h-16 sm:h-20 px-3 py-2 bg-customgreys-darkGrey border border-gray-600 rounded-md text-white text-sm sm:text-base placeholder:text-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 resize-none"
                        placeholder="Fale-nos um pouco sobre si..."
                        maxLength={150}
                      />
                      <p className="text-xs text-gray-400">{settings.bio.length}/150 caracteres</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => handleSave('perfil')}
                      disabled={saving}
                      className="bg-violet-600 hover:bg-violet-700 text-sm sm:text-base"
                    >
                      {saving ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                          <span className="hidden sm:inline">A guardar...</span>
                          <span className="sm:hidden">Guardando...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Guardar Alterações</span>
                          <span className="sm:hidden">Guardar</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Learning Preferences Tab */}
          <TabsContent value="learning" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Goals & Preferences */}
              <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg md:text-xl">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                    <span className="hidden sm:inline">Objetivos de Aprendizagem</span>
                    <span className="sm:hidden">Objetivos</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm sm:text-base">Meta Diária de Lições</Label>
                    <Select value={settings.dailyGoal.toString()} onValueChange={(value) => setSettings(prev => ({ ...prev, dailyGoal: parseInt(value) }))}>
                      <SelectTrigger className="bg-customgreys-darkGrey border-gray-600 text-white text-sm sm:text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-customgreys-secondarybg border-gray-600">
                        <SelectItem value="1" className="text-white">1 lição diária</SelectItem>
                        <SelectItem value="3" className="text-white">3 lições diárias</SelectItem>
                        <SelectItem value="5" className="text-white">5 lições diárias</SelectItem>
                        <SelectItem value="10" className="text-white">10 lições diárias</SelectItem>
                        <SelectItem value="15" className="text-white">15 lições diárias</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm sm:text-base">Nível de Dificuldade</Label>
                    <Select value={settings.difficultyLevel} onValueChange={(value) => setSettings(prev => ({ ...prev, difficultyLevel: value }))}>
                      <SelectTrigger className="bg-customgreys-darkGrey border-gray-600 text-white text-sm sm:text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-customgreys-secondarybg border-gray-600">
                        <SelectItem value="beginner" className="text-white">Principiante</SelectItem>
                        <SelectItem value="intermediate" className="text-white">Intermédio</SelectItem>
                        <SelectItem value="advanced" className="text-white">Avançado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm sm:text-base">Ritmo de Aprendizagem</Label>
                    <Select value={settings.learningPace} onValueChange={(value) => setSettings(prev => ({ ...prev, learningPace: value }))}>
                      <SelectTrigger className="bg-customgreys-darkGrey border-gray-600 text-white text-sm sm:text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-customgreys-secondarybg border-gray-600">
                        <SelectItem value="relaxed" className="text-white">Relaxado</SelectItem>
                        <SelectItem value="normal" className="text-white">Normal</SelectItem>
                        <SelectItem value="intensive" className="text-white">Intensivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-gray-300 text-sm sm:text-base">Lembrete Diário</Label>
                      <p className="text-xs text-gray-400">Recebe uma notificação diária para estudar</p>
                    </div>
                    <Switch
                      checked={settings.studyReminder}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, studyReminder: checked }))}
                    />
                  </div>

                  {settings.studyReminder && (
                    <div className="space-y-2">
                      <Label className="text-gray-300 text-sm sm:text-base">Hora do Lembrete</Label>
                      <Input
                        type="time"
                        value={settings.reminderTime}
                        onChange={(e) => setSettings(prev => ({ ...prev, reminderTime: e.target.value }))}
                        className="bg-customgreys-darkGrey border-gray-600 text-white text-sm sm:text-base"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Interface Preferences */}
              <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg md:text-xl">
                    <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                    <span className="hidden sm:inline">Preferências de Interface</span>
                    <span className="sm:hidden">Interface</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm sm:text-base">Idioma da Interface</Label>
                    <Select value={settings.language} onValueChange={(value) => setSettings(prev => ({ ...prev, language: value }))}>
                      <SelectTrigger className="bg-customgreys-darkGrey border-gray-600 text-white text-sm sm:text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-customgreys-secondarybg border-gray-600">
                        <SelectItem value="pt-ao" className="text-white">Português (Angola)</SelectItem>
                        <SelectItem value="pt-br" className="text-white">Português (Brasil)</SelectItem>
                        <SelectItem value="en" className="text-white">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm sm:text-base">Fuso Horário</Label>
                    <Select value={settings.timezone} onValueChange={(value) => setSettings(prev => ({ ...prev, timezone: value }))}>
                      <SelectTrigger className="bg-customgreys-darkGrey border-gray-600 text-white text-sm sm:text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-customgreys-secondarybg border-gray-600">
                        <SelectItem value="Africa/Luanda" className="text-white">África/Luanda (WAT)</SelectItem>
                        <SelectItem value="Europe/Lisbon" className="text-white">Europa/Lisboa (WET)</SelectItem>
                        <SelectItem value="America/Sao_Paulo" className="text-white">América/São Paulo (BRT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-gray-300 text-sm sm:text-base">Efeitos Sonoros</Label>
                      <p className="text-xs text-gray-400">Sons de resposta e música de ambiente</p>
                    </div>
                    <Switch
                      checked={settings.soundEffects}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, soundEffects: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="flex justify-end">
              <Button
                onClick={() => handleSave('aprendizagem')}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 text-sm sm:text-base"
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                    <span className="hidden sm:inline">A guardar...</span>
                    <span className="sm:hidden">...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Guardar Preferências</span>
                    <span className="sm:hidden">Guardar</span>
                  </div>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                    Configurações de Notificação
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-xs sm:text-sm md:text-base">
                    Controla como e quando recebes as notificações da plataforma ProEnglish
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {/* Email Notifications */}
                    <div className="space-y-4">
                      <h3 className="text-white font-semibold flex items-center gap-2 text-sm sm:text-base">
                        <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                        Notificações por Email
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-gray-300 text-xs sm:text-sm">Relatórios de Progresso</Label>
                            <p className="text-xs text-gray-400">Recebe relatórios semanais sobre o seu progresso</p>
                          </div>
                          <Switch
                            checked={settings.weeklyProgress}
                            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, weeklyProgress: checked }))}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-gray-300 text-xs sm:text-sm">Novas Conquistas</Label>
                            <p className="text-xs text-gray-400">Quando desbloquear uma nova conquista</p>
                          </div>
                          <Switch
                            checked={settings.achievementAlerts}
                            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, achievementAlerts: checked }))}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-gray-300 text-xs sm:text-sm">Emails Gerais</Label>
                            <p className="text-xs text-gray-400">Atualizações da plataforma e novidades</p>
                          </div>
                          <Switch
                            checked={settings.emailNotifications}
                            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Push Notifications */}
                    <div className="space-y-4">
                      <h3 className="text-white font-semibold flex items-center gap-2 text-sm sm:text-base">
                        <Smartphone className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                        Notificações Push
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-gray-300 text-xs sm:text-sm">Lembretes de Lição</Label>
                            <p className="text-xs text-gray-400">Lembre-se de completar as suas lições diárias</p>
                          </div>
                          <Switch
                            checked={settings.lessonReminders}
                            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, lessonReminders: checked }))}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-gray-300 text-xs sm:text-sm">Notificações Push</Label>
                            <p className="text-xs text-gray-400">Recebe notificações no seu dispositivo</p>
                          </div>
                          <Switch
                            checked={settings.pushNotifications}
                            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, pushNotifications: checked }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="flex justify-end">
              <Button
                onClick={() => handleSave('notificações')}
                disabled={saving}
                className="bg-yellow-600 hover:bg-yellow-700 text-sm sm:text-base"
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                    <span className="hidden sm:inline">A guardar...</span>
                    <span className="sm:hidden">...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Guardar Notificações</span>
                    <span className="sm:hidden">Guardar</span>
                  </div>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Privacy & Security Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Privacy Settings */}
              <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                    Privacidade
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm sm:text-base">Visibilidade do Perfil</Label>
                    <Select value={settings.profileVisibility} onValueChange={(value) => setSettings(prev => ({ ...prev, profileVisibility: value }))}>
                      <SelectTrigger className="bg-customgreys-darkGrey border-gray-600 text-white text-sm sm:text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-customgreys-secondarybg border-gray-600">
                        <SelectItem value="public" className="text-white">Público</SelectItem>
                        <SelectItem value="friends" className="text-white">Apenas Amigos</SelectItem>
                        <SelectItem value="private" className="text-white">Privado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-gray-300 text-sm sm:text-base">Mostrar Progresso</Label>
                      <p className="text-xs text-gray-400">Permite que outros utilizadores vejam o seu progresso</p>
                    </div>
                    <Switch
                      checked={settings.showProgress}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showProgress: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-gray-300 text-sm sm:text-base">Partilha de Dados</Label>
                      <p className="text-xs text-gray-400">Partilha dados anónimos para melhorarmos a plataforma</p>
                    </div>
                    <Switch
                      checked={settings.dataSharing}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, dataSharing: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Account Security */}
              <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-violet-900/30">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                    Segurança da Conta
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm sm:text-base">Nova Palavra-passe</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Digite a nova palavra-passe"
                        className="bg-customgreys-darkGrey border-gray-600 text-white pr-10 text-sm sm:text-base"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm sm:text-base">Confirmar Palavra-passe</Label>
                    <Input
                      type="password"
                      placeholder="Confirme a nova palavra-passe"
                      className="bg-customgreys-darkGrey border-gray-600 text-white text-sm sm:text-base"
                    />
                  </div>

                  <Button 
                    className="w-full bg-orange-600 hover:bg-orange-700 text-sm sm:text-base"
                    onClick={() => handleSave('palavra-passe')}
                  >
                    <Lock className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    <span className="hidden sm:inline">Alterar Palavra-passe</span>
                    <span className="sm:hidden">Alterar</span>
                  </Button>

                  <Separator className="bg-gray-600" />

                  <Button 
                    variant="outline" 
                    className="w-full border-red-600 text-red-400 hover:bg-red-600 hover:text-white text-sm sm:text-base"
                  >
                    <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    <span className="hidden sm:inline">Terminar todas as sessões</span>
                    <span className="sm:hidden">Terminar sessões</span>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <div className="flex justify-end">
              <Button
                onClick={() => handleSave('privacidade')}
                disabled={saving}
                className="bg-red-600 hover:bg-red-700 text-sm sm:text-base"
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                    <span className="hidden sm:inline">A guardar...</span>
                    <span className="sm:hidden">...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Guardar Privacidade</span>
                    <span className="sm:hidden">Guardar</span>
                  </div>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
