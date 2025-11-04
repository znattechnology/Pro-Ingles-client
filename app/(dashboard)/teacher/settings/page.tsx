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
  BookOpen,
  GraduationCap,
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

interface TeacherSettings {
  // Profile
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  bio: string;
  expertise: string;
  institution: string;
  
  // Teaching Preferences
  defaultLanguage: string;
  teachingStyle: string;
  classSize: number;
  difficultyPreference: string;
  feedbackStyle: string;
  gradingSystem: string;
  
  // Course Management
  autoSave: boolean;
  courseVisibility: string;
  studentProgress: boolean;
  analyticsSharing: boolean;
  courseCopyright: boolean;
  
  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  studentSubmissions: boolean;
  courseUpdates: boolean;
  systemAlerts: boolean;
  weeklyReports: boolean;
  
  // Privacy & Security
  profileVisibility: string;
  showCredentials: boolean;
  dataSharing: boolean;
  
  // Interface
  theme: string;
  language: string;
  timezone: string;
}

export default function TeacherSettingsPage() {
  const { user, isAuthenticated, isLoading } = useDjangoAuth();
  const [settings, setSettings] = useState<TeacherSettings>({
    firstName: '',
    lastName: '',
    email: '',
    avatar: '',
    bio: '',
    expertise: 'english',
    institution: '',
    defaultLanguage: 'pt',
    teachingStyle: 'interactive',
    classSize: 25,
    difficultyPreference: 'mixed',
    feedbackStyle: 'detailed',
    gradingSystem: 'percentage',
    autoSave: true,
    courseVisibility: 'public',
    studentProgress: true,
    analyticsSharing: true,
    courseCopyright: false,
    emailNotifications: true,
    pushNotifications: true,
    studentSubmissions: true,
    courseUpdates: true,
    systemAlerts: true,
    weeklyReports: true,
    profileVisibility: 'public',
    showCredentials: true,
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
          <div className="absolute -top-20 -right-40 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-40 w-80 h-80 bg-red-600/10 rounded-full blur-3xl" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5" />
        
        <div className='relative max-w-7xl mx-auto'>
          <div className="text-center mb-6 sm:mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-3 sm:px-4 py-1 sm:py-1.5 mb-4 sm:mb-6"
            >
              <Settings className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400" />
              <span className="text-orange-300 font-medium text-xs sm:text-sm">Configurações do Professor</span>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 px-2"
            >
              Centro de <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Ensino</span>
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed px-2 sm:px-4"
            >
              Configure as suas preferências de ensino, gestão de cursos e experiência na plataforma ProEnglish
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
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-customgreys-secondarybg/60 backdrop-blur-sm border border-orange-900/30 h-auto p-0.5 sm:p-1 gap-0.5 sm:gap-1">
              <TabsTrigger 
                value="profile" 
                className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm data-[state=active]:bg-orange-600 data-[state=active]:text-white min-h-[44px] transition-all"
              >
                <User className="w-4 h-4 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">Perfil</span>
              </TabsTrigger>
              <TabsTrigger 
                value="teaching" 
                className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm data-[state=active]:bg-orange-600 data-[state=active]:text-white min-h-[44px] transition-all"
              >
                <GraduationCap className="w-4 h-4 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm hidden xs:inline sm:inline">Ensino</span>
                <span className="text-xs xs:hidden sm:hidden">Aulas</span>
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm data-[state=active]:bg-orange-600 data-[state=active]:text-white min-h-[44px] transition-all"
              >
                <Bell className="w-4 h-4 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm hidden xs:inline sm:inline">Notificações</span>
                <span className="text-xs xs:hidden sm:hidden">Avisos</span>
              </TabsTrigger>
              <TabsTrigger 
                value="privacy" 
                className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm data-[state=active]:bg-orange-600 data-[state=active]:text-white min-h-[44px] transition-all"
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
              <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-orange-900/30">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                    Perfil do Professor
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-xs sm:text-sm md:text-base">
                    Gira as suas informações profissionais e credenciais académicas
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  {/* Avatar Section */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                    <Avatar className="w-20 h-20 sm:w-24 sm:h-24">
                      <AvatarImage src={settings.avatar} />
                      <AvatarFallback className="bg-orange-600 text-white text-lg sm:text-xl">
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
                          <Badge className="bg-orange-600 text-xs">Professor</Badge>
                          <Badge className="bg-red-600 text-xs">Inglês</Badge>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button 
                          size="sm" 
                          className="bg-orange-600 hover:bg-orange-700 text-xs sm:text-sm min-h-[40px] px-3 sm:px-4"
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
                    <div className="space-y-2">
                      <Label className="text-gray-300 text-sm sm:text-base">Área de Especialização</Label>
                      <Select value={settings.expertise} onValueChange={(value) => setSettings(prev => ({ ...prev, expertise: value }))}>
                        <SelectTrigger className="bg-customgreys-darkGrey border-gray-600 text-white text-sm sm:text-base">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-customgreys-secondarybg border-gray-600">
                          <SelectItem value="english" className="text-white">Inglês</SelectItem>
                          <SelectItem value="portuguese" className="text-white">Português</SelectItem>
                          <SelectItem value="french" className="text-white">Francês</SelectItem>
                          <SelectItem value="spanish" className="text-white">Espanhol</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300 text-sm sm:text-base">Instituição</Label>
                      <Input
                        value={settings.institution}
                        onChange={(e) => setSettings(prev => ({ ...prev, institution: e.target.value }))}
                        className="bg-customgreys-darkGrey border-gray-600 text-white text-sm sm:text-base"
                        placeholder="Nome da instituição"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label className="text-gray-300 text-sm sm:text-base">Biografia Profissional</Label>
                      <textarea
                        value={settings.bio}
                        onChange={(e) => setSettings(prev => ({ ...prev, bio: e.target.value }))}
                        className="w-full h-20 sm:h-24 px-3 py-2 bg-customgreys-darkGrey border border-gray-600 rounded-md text-white text-sm sm:text-base placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 resize-none"
                        placeholder="Descreva a sua experiência e qualificações..."
                        maxLength={250}
                      />
                      <p className="text-xs text-gray-400">{settings.bio.length}/250 caracteres</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => handleSave('perfil')}
                      disabled={saving}
                      className="bg-orange-600 hover:bg-orange-700 text-sm sm:text-base"
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

          {/* Teaching Preferences Tab */}
          <TabsContent value="teaching" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Teaching Methodology */}
              <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-orange-900/30">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg md:text-xl">
                    <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                    <span className="hidden sm:inline">Metodologia de Ensino</span>
                    <span className="sm:hidden">Metodologia</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm sm:text-base">Estilo de Ensino</Label>
                    <Select value={settings.teachingStyle} onValueChange={(value) => setSettings(prev => ({ ...prev, teachingStyle: value }))}>
                      <SelectTrigger className="bg-customgreys-darkGrey border-gray-600 text-white text-sm sm:text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-customgreys-secondarybg border-gray-600">
                        <SelectItem value="interactive" className="text-white">Interativo</SelectItem>
                        <SelectItem value="traditional" className="text-white">Tradicional</SelectItem>
                        <SelectItem value="gamified" className="text-white">Gamificado</SelectItem>
                        <SelectItem value="collaborative" className="text-white">Colaborativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm sm:text-base">Tamanho Preferido da Turma</Label>
                    <Select value={settings.classSize.toString()} onValueChange={(value) => setSettings(prev => ({ ...prev, classSize: parseInt(value) }))}>
                      <SelectTrigger className="bg-customgreys-darkGrey border-gray-600 text-white text-sm sm:text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-customgreys-secondarybg border-gray-600">
                        <SelectItem value="10" className="text-white">Até 10 estudantes</SelectItem>
                        <SelectItem value="25" className="text-white">Até 25 estudantes</SelectItem>
                        <SelectItem value="50" className="text-white">Até 50 estudantes</SelectItem>
                        <SelectItem value="100" className="text-white">Mais de 50 estudantes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm sm:text-base">Nível de Dificuldade Padrão</Label>
                    <Select value={settings.difficultyPreference} onValueChange={(value) => setSettings(prev => ({ ...prev, difficultyPreference: value }))}>
                      <SelectTrigger className="bg-customgreys-darkGrey border-gray-600 text-white text-sm sm:text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-customgreys-secondarybg border-gray-600">
                        <SelectItem value="beginner" className="text-white">Principiante</SelectItem>
                        <SelectItem value="intermediate" className="text-white">Intermédio</SelectItem>
                        <SelectItem value="advanced" className="text-white">Avançado</SelectItem>
                        <SelectItem value="mixed" className="text-white">Misto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm sm:text-base">Estilo de Feedback</Label>
                    <Select value={settings.feedbackStyle} onValueChange={(value) => setSettings(prev => ({ ...prev, feedbackStyle: value }))}>
                      <SelectTrigger className="bg-customgreys-darkGrey border-gray-600 text-white text-sm sm:text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-customgreys-secondarybg border-gray-600">
                        <SelectItem value="detailed" className="text-white">Detalhado</SelectItem>
                        <SelectItem value="concise" className="text-white">Conciso</SelectItem>
                        <SelectItem value="encouraging" className="text-white">Encorajador</SelectItem>
                        <SelectItem value="constructive" className="text-white">Construtivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Course Management */}
              <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-orange-900/30">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg md:text-xl">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                    <span className="hidden sm:inline">Gestão de Cursos</span>
                    <span className="sm:hidden">Cursos</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm sm:text-base">Sistema de Avaliação</Label>
                    <Select value={settings.gradingSystem} onValueChange={(value) => setSettings(prev => ({ ...prev, gradingSystem: value }))}>
                      <SelectTrigger className="bg-customgreys-darkGrey border-gray-600 text-white text-sm sm:text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-customgreys-secondarybg border-gray-600">
                        <SelectItem value="percentage" className="text-white">Percentual (0-100%)</SelectItem>
                        <SelectItem value="letters" className="text-white">Letras (A-F)</SelectItem>
                        <SelectItem value="points" className="text-white">Pontos</SelectItem>
                        <SelectItem value="pass-fail" className="text-white">Aprovado/Reprovado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm sm:text-base">Visibilidade Padrão dos Cursos</Label>
                    <Select value={settings.courseVisibility} onValueChange={(value) => setSettings(prev => ({ ...prev, courseVisibility: value }))}>
                      <SelectTrigger className="bg-customgreys-darkGrey border-gray-600 text-white text-sm sm:text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-customgreys-secondarybg border-gray-600">
                        <SelectItem value="public" className="text-white">Público</SelectItem>
                        <SelectItem value="unlisted" className="text-white">Não listado</SelectItem>
                        <SelectItem value="private" className="text-white">Privado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-gray-300 text-sm sm:text-base">Guardar Automaticamente</Label>
                      <p className="text-xs text-gray-400">Guarda automaticamente as alterações nos cursos</p>
                    </div>
                    <Switch
                      checked={settings.autoSave}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoSave: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-gray-300 text-sm sm:text-base">Monitorar Progresso</Label>
                      <p className="text-xs text-gray-400">Acompanhar automaticamente o progresso dos estudantes</p>
                    </div>
                    <Switch
                      checked={settings.studentProgress}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, studentProgress: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-gray-300 text-sm sm:text-base">Partilhar Analytics</Label>
                      <p className="text-xs text-gray-400">Permite que os estudantes vejam estatísticas da turma</p>
                    </div>
                    <Switch
                      checked={settings.analyticsSharing}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, analyticsSharing: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="flex justify-end">
              <Button
                onClick={() => handleSave('ensino')}
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
              <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-orange-900/30">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                    Configurações de Notificação
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-xs sm:text-sm md:text-base">
                    Controla como e quando recebes notificações sobre os seus cursos e estudantes
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
                            <Label className="text-gray-300 text-xs sm:text-sm">Submissões de Estudantes</Label>
                            <p className="text-xs text-gray-400">Quando os estudantes submetem trabalhos</p>
                          </div>
                          <Switch
                            checked={settings.studentSubmissions}
                            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, studentSubmissions: checked }))}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-gray-300 text-xs sm:text-sm">Atualizações de Curso</Label>
                            <p className="text-xs text-gray-400">Mudanças importantes nos seus cursos</p>
                          </div>
                          <Switch
                            checked={settings.courseUpdates}
                            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, courseUpdates: checked }))}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-gray-300 text-xs sm:text-sm">Relatórios Semanais</Label>
                            <p className="text-xs text-gray-400">Resumo semanal do progresso da turma</p>
                          </div>
                          <Switch
                            checked={settings.weeklyReports}
                            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, weeklyReports: checked }))}
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
                            <Label className="text-gray-300 text-xs sm:text-sm">Alertas do Sistema</Label>
                            <p className="text-xs text-gray-400">Problemas técnicos e manutenções</p>
                          </div>
                          <Switch
                            checked={settings.systemAlerts}
                            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, systemAlerts: checked }))}
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
              <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-orange-900/30">
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
                        <SelectItem value="colleagues" className="text-white">Apenas Colegas</SelectItem>
                        <SelectItem value="private" className="text-white">Privado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-gray-300 text-sm sm:text-base">Mostrar Credenciais</Label>
                      <p className="text-xs text-gray-400">Permite que outros vejam as suas qualificações</p>
                    </div>
                    <Switch
                      checked={settings.showCredentials}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showCredentials: checked }))}
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
              <Card className="bg-customgreys-secondarybg/60 backdrop-blur-sm border-orange-900/30">
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
