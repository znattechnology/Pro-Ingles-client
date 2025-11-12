"use client";

import Header from "@/components/course/Header";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import { useUpdateProfileMutation } from "@/src/domains/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import React, { useState, useEffect } from "react";
import Loading from "@/components/course/Loading";
import { toast } from "react-hot-toast";
// Progress APIs
import { useGetStudentProgressQuery } from "@/src/domains/student/practice-courses/api/studentPracticeApiSlice";
import { useGetMyVideoEnrollmentsQuery } from "@/src/domains/student/video-courses/api/studentVideoCourseApiSlice";
import { useGetUserAchievementsQuery, useGetAchievementStatsQuery } from "@/src/domains/student/achievements/api/studentAchievementsApiSlice";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  MapPin, 
  Phone, 
  Edit3, 
  Camera, 
  Settings, 
  BookOpen, 
  Target,
  Trophy,
  Activity,
  Star
} from "lucide-react";

const UserProfilePage = () => {
  const { user, isAuthenticated, isLoading } = useDjangoAuth();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  
  // Progress data from APIs
  const { data: studentProgress, isLoading: progressLoading } = useGetStudentProgressQuery();
  const { data: videoCoursesResponse, isLoading: coursesLoading } = useGetMyVideoEnrollmentsQuery(
    user?.id || '', { skip: !user?.id }
  );
  
  // Achievements data from APIs
  const { data: achievements, isLoading: achievementsLoading } = useGetUserAchievementsQuery();
  const { data: achievementStats, isLoading: achievementStatsLoading } = useGetAchievementStatsQuery();
  
  // Extract enrolled courses from response
  const enrolledCourses = videoCoursesResponse?.data || [];
  
  // Debug logging for development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Profile Debug:', {
      user: user?.id,
      videoCoursesResponse,
      enrolledCourses,
      coursesLoading,
      studentProgress,
      achievements,
      achievementStats,
      achievementsLoading
    });
    
    // Log detailed enrollment structure
    if (enrolledCourses?.length > 0) {
      console.log('📊 First enrollment structure:', enrolledCourses[0]);
      console.log('📊 Available date fields:', {
        enrolled_at: enrolledCourses[0]?.enrolled_at,
        created_at: enrolledCourses[0]?.created_at,
        enrollment_date: enrolledCourses[0]?.enrollment_date,
        updated_at: enrolledCourses[0]?.updated_at
      });
    }
    
    // Log achievements structure
    if (achievements && achievements.length > 0) {
      console.log('🏆 Achievements structure:', achievements[0]);
      console.log('🏆 Achievement stats:', achievementStats);
    }
  }
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: (user as any).phone || '',
        bio: (user as any).bio || '',
        location: (user as any).location || '',
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProfile(formData).unwrap();
      toast.success('Perfil atualizado com sucesso!');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Erro ao atualizar perfil');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatEnrollmentDate = (enrollment: any) => {
    const dateFields = ['enrolled_at', 'created_at', 'enrollment_date', 'date_joined'];
    
    for (const field of dateFields) {
      if (enrollment[field]) {
        try {
          const date = new Date(enrollment[field]);
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit', 
              year: 'numeric'
            });
          }
        } catch (error) {
          console.warn(`Erro ao formatar data ${field}:`, enrollment[field]);
        }
      }
    }
    
    return 'Data não disponível';
  };

  const joinDate = new Date().toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long'
  });

  if (isLoading) return <Loading />;
  if (!isAuthenticated || !user) return <div>Faça login para visualizar o seu perfil.</div>;

  return (
    <>
      <Header title="Perfil do Estudante" subtitle="Gerencie suas informações pessoais e configurações" />
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8">
        {/* Profile Header Card */}
        <Card className="bg-gradient-to-r from-violet-900/20 via-purple-900/20 to-violet-900/20 border-violet-900/30 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar Section */}
              <div className="relative group">
                <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-violet-500/50 shadow-xl">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-gradient-to-br from-violet-600 to-purple-600 text-white text-2xl font-bold">
                    {getInitials(user?.name || 'U')}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </button>
              </div>
              
              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <h1 className="text-2xl md:text-3xl font-bold text-white">{user?.name}</h1>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="border-violet-500 text-violet-400 hover:bg-violet-500 hover:text-white transition-colors"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    {isEditing ? 'Cancelar' : 'Editar Perfil'}
                  </Button>
                </div>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-gray-300">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-violet-400" />
                    <span className="text-sm">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-violet-400" />
                    <span className="text-sm capitalize">
                      {user?.role === 'student' ? 'Estudante' : user?.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-violet-400" />
                    <span className="text-sm">Membro desde {joinDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-customgreys-darkGrey border border-violet-900/30">
            <TabsTrigger value="profile" className="data-[state=active]:bg-violet-900/50 text-white">
              <User className="w-4 h-4 mr-2" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:bg-violet-900/50 text-white">
              <BookOpen className="w-4 h-4 mr-2" />
              Progresso
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-violet-900/50 text-white">
              <Trophy className="w-4 h-4 mr-2" />
              Conquistas
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-violet-900/50 text-white">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card className="bg-customgreys-darkGrey border-violet-900/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-violet-400" />
                    Informações Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-white">Nome Completo</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="bg-customgreys-primarybg border-violet-900/30 text-white"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-white">Telefone</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="bg-customgreys-primarybg border-violet-900/30 text-white"
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-white">Localização</Label>
                        <Input
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          className="bg-customgreys-primarybg border-violet-900/30 text-white"
                          placeholder="Cidade, Estado"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bio" className="text-white">Biografia</Label>
                        <textarea
                          id="bio"
                          name="bio"
                          value={formData.bio}
                          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                          className="w-full min-h-[100px] p-3 bg-customgreys-primarybg border border-violet-900/30 rounded-md text-white placeholder:text-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                          placeholder="Conte um pouco sobre você..."
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          disabled={isUpdating}
                          className="flex-1 bg-violet-800 hover:bg-violet-900 text-white"
                        >
                          {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                          className="border-gray-600 text-gray-400 hover:bg-gray-800"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-gray-300">
                        <User className="w-4 h-4 text-violet-400" />
                        <span>{formData.name || 'Não informado'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-300">
                        <Phone className="w-4 h-4 text-violet-400" />
                        <span>{formData.phone || 'Não informado'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-300">
                        <MapPin className="w-4 h-4 text-violet-400" />
                        <span>{formData.location || 'Não informado'}</span>
                      </div>
                      {formData.bio && (
                        <div className="space-y-2">
                          <Label className="text-white">Biografia</Label>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {formData.bio}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Account Information */}
              <Card className="bg-customgreys-darkGrey border-violet-900/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-violet-400" />
                    Informações da Conta
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-violet-400" />
                        <div>
                          <p className="text-white text-sm font-medium">Email</p>
                          <p className="text-gray-400 text-xs">{user?.email}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">Verificado</span>
                    </div>
                    
                    <Separator className="bg-violet-900/30" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Shield className="w-4 h-4 text-violet-400" />
                        <div>
                          <p className="text-white text-sm font-medium">Tipo de Conta</p>
                          <p className="text-gray-400 text-xs capitalize">
                            {user?.role === 'student' ? 'Estudante' : user?.role}
                          </p>
                        </div>
                      </div>
                      <div className="px-2 py-1 bg-green-900/20 border border-green-500/30 rounded text-green-400 text-xs">
                        ✅ Ativo
                      </div>
                    </div>
                    
                    <Separator className="bg-violet-900/30" />
                    
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-violet-400" />
                      <div>
                        <p className="text-white text-sm font-medium">Membro desde</p>
                        <p className="text-gray-400 text-xs">{joinDate}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            {progressLoading || coursesLoading ? (
              <div className="text-center py-12">
                <Loading />
                <p className="text-gray-400 mt-4">Carregando dados de progresso...</p>
              </div>
            ) : (
              <>
                {/* Statistics Overview */}
                <div className="grid md:grid-cols-4 gap-6">
                  <Card className="bg-customgreys-darkGrey border-violet-900/30">
                    <CardContent className="p-6 text-center">
                      <BookOpen className="w-12 h-12 text-violet-400 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">
                        {enrolledCourses?.length || 0}
                      </h3>
                      <p className="text-gray-400 text-sm">Cursos em Vídeo</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-customgreys-darkGrey border-violet-900/30">
                    <CardContent className="p-6 text-center">
                      <Target className="w-12 h-12 text-green-400 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">
                        {studentProgress?.active_course ? '1' : '0'}
                      </h3>
                      <p className="text-gray-400 text-sm">Cursos Práticos</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-customgreys-darkGrey border-violet-900/30">
                    <CardContent className="p-6 text-center">
                      <Activity className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">{studentProgress?.points || 0}</h3>
                      <p className="text-gray-400 text-sm">Pontos Ganhos</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-customgreys-darkGrey border-violet-900/30">
                    <CardContent className="p-6 text-center">
                      <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">{studentProgress?.streak || 0}</h3>
                      <p className="text-gray-400 text-sm">Sequência de Dias</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Detailed Progress Sections */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Video Courses Progress */}
                  <Card className="bg-customgreys-darkGrey border-violet-900/30">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-violet-400" />
                        Cursos em Vídeo
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {enrolledCourses && enrolledCourses.length > 0 ? (
                        enrolledCourses
                          .map((enrollment: any) => (
                            <div key={enrollment.course?.id || enrollment.id} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <h4 className="text-white font-medium">{enrollment.course?.title || enrollment.title}</h4>
                                <span className="text-violet-400 text-sm">{enrollment.progress_percentage || 0}%</span>
                              </div>
                              <Progress value={enrollment.progress_percentage || 0} className="w-full" />
                              <p className="text-gray-400 text-xs">
                                {enrollment.completed_chapters || 0} de {enrollment.total_chapters || enrollment.course?.totalSections || 0} capítulos completados
                              </p>
                              <div className="text-xs text-gray-500">
                                Inscrito em: {formatEnrollmentDate(enrollment)}
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="text-center py-6">
                          <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                          <p className="text-gray-400">Nenhum curso em vídeo inscrito</p>
                          <p className="text-gray-500 text-sm">Explore nossos cursos em vídeo!</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Practice Course Progress */}
                  <Card className="bg-customgreys-darkGrey border-violet-900/30">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Target className="w-5 h-5 text-green-400" />
                        Curso Prático (Laboratório)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {studentProgress?.active_course ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <h4 className="text-white font-medium">{studentProgress.active_course.title}</h4>
                              <span className="text-green-400 text-sm">Ativo</span>
                            </div>
                            <p className="text-gray-400 text-sm">{studentProgress.active_course.description}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 pt-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-white">{studentProgress.hearts || 5}</div>
                              <div className="text-gray-400 text-xs">❤️ Vidas</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-white">{studentProgress.points || 0}</div>
                              <div className="text-gray-400 text-xs">⭐ Pontos</div>
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-lg font-bold text-white">🔥 {studentProgress.streak || 0}</div>
                            <div className="text-gray-400 text-xs">Dias consecutivos</div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <Target className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                          <p className="text-gray-400">Nenhum curso prático ativo</p>
                          <p className="text-gray-500 text-sm">Vá ao Laboratório para começar!</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            {achievementsLoading ? (
              <div className="text-center py-12">
                <Loading />
                <p className="text-gray-400 mt-4">Carregando conquistas...</p>
              </div>
            ) : (
              <>
                {/* Achievement Stats Overview */}
                {achievementStats && (
                  <div className="grid md:grid-cols-4 gap-4">
                    <Card className="bg-customgreys-darkGrey border-yellow-500/30">
                      <CardContent className="p-4 text-center">
                        <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                        <h3 className="text-lg font-bold text-white">{achievementStats.totalUnlocked}</h3>
                        <p className="text-gray-400 text-xs">Conquistas Desbloqueadas</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-customgreys-darkGrey border-blue-500/30">
                      <CardContent className="p-4 text-center">
                        <Target className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                        <h3 className="text-lg font-bold text-white">{achievementStats.totalAvailable}</h3>
                        <p className="text-gray-400 text-xs">Total Disponíveis</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-customgreys-darkGrey border-purple-500/30">
                      <CardContent className="p-4 text-center">
                        <Activity className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                        <h3 className="text-lg font-bold text-white">{achievementStats.totalPoints}</h3>
                        <p className="text-gray-400 text-xs">Pontos de Conquistas</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-customgreys-darkGrey border-orange-500/30">
                      <CardContent className="p-4 text-center">
                        <Star className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                        <h3 className="text-lg font-bold text-white">{achievementStats.rareAchievements}</h3>
                        <p className="text-gray-400 text-xs">Conquistas Raras</p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Unlocked Achievements List */}
                {achievements && achievements.filter(a => a.isUnlocked).length > 0 ? (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      Suas Conquistas ({achievements.filter(a => a.isUnlocked).length})
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {achievements.filter(achievement => achievement.isUnlocked).map((achievement) => (
                        <Card key={achievement.id} className="bg-customgreys-darkGrey border-yellow-500/50 bg-gradient-to-br from-yellow-900/20 to-orange-900/20 transition-all duration-200">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="text-2xl grayscale-0">
                                {achievement.icon || '🏆'}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-yellow-400">
                                  {achievement.title}
                                </h4>
                                <p className="text-gray-400 text-sm mt-1">
                                  {achievement.description}
                                </p>
                                
                                <div className="mt-2 flex items-center justify-between">
                                  <span className="text-yellow-400 text-xs font-medium">
                                    ✨ {achievement.points} pontos
                                  </span>
                                  {achievement.unlockedAt && (
                                    <span className="text-gray-500 text-xs">
                                      {new Date(achievement.unlockedAt).toLocaleDateString('pt-BR')}
                                    </span>
                                  )}
                                </div>
                                
                                {/* Rarity badge */}
                                <div className="mt-2">
                                  <span className={`
                                    inline-block px-2 py-1 rounded-full text-xs font-medium
                                    ${achievement.rarity === 'common' ? 'bg-gray-700 text-gray-300' : ''}
                                    ${achievement.rarity === 'rare' ? 'bg-blue-700 text-blue-300' : ''}
                                    ${achievement.rarity === 'epic' ? 'bg-purple-700 text-purple-300' : ''}
                                    ${achievement.rarity === 'legendary' ? 'bg-yellow-700 text-yellow-300' : ''}
                                  `}>
                                    {achievement.rarity === 'common' && '⚪'}
                                    {achievement.rarity === 'rare' && '🔵'}
                                    {achievement.rarity === 'epic' && '🟣'}
                                    {achievement.rarity === 'legendary' && '🟡'}
                                    {' '}
                                    {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Card className="bg-customgreys-darkGrey border-violet-900/30">
                    <CardContent className="p-6 text-center">
                      <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">Nenhuma conquista ainda</h3>
                      <p className="text-gray-400">Complete cursos e lições para desbloquear conquistas!</p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-customgreys-darkGrey border-violet-900/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-violet-400" />
                  Configurações de Conta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Notificações por Email</p>
                      <p className="text-gray-400 text-sm">Receber atualizações sobre cursos</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-violet-500 text-violet-400">
                      Configurar
                    </Button>
                  </div>
                  
                  <Separator className="bg-violet-900/30" />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Privacidade</p>
                      <p className="text-gray-400 text-sm">Controle quem pode ver seu perfil</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-violet-500 text-violet-400">
                      Gerenciar
                    </Button>
                  </div>
                  
                  <Separator className="bg-violet-900/30" />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Excluir Conta</p>
                      <p className="text-gray-400 text-sm">Remover permanentemente sua conta</p>
                    </div>
                    <Button variant="destructive" size="sm">
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default UserProfilePage;

