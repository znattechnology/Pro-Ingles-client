"use client";

import Header from "@/components/course/Header";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import { useUpdateProfileMutation } from "@/src/domains/auth";
import { studentProfileSchema } from "@/lib/schemas/profile.schema";
import { getInitials, formatJoinDate } from "@/lib/profile.utils";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import { useProfileForm } from "@/hooks/useProfileForm";
import { useProfileUpdate } from "@/hooks/useProfileUpdate";
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
  Activity
} from "lucide-react";

const UserProfilePage = () => {
  const { user, isAuthenticated, isLoading } = useDjangoAuth();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Custom hooks for form handling
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
    formValues,
  } = useProfileForm({
    schema: studentProfileSchema,
    user,
  });

  // Custom hook for avatar upload
  const {
    avatarFile,
    avatarPreview,
    isUploading,
    handleAvatarChange,
    clearAvatarState,
    setIsUploading,
  } = useAvatarUpload(() => setIsEditing(true));

  // Custom hook for profile update/form submission
  const { onSubmit, loadingStep, loadingMessage } = useProfileUpdate({
    updateProfileMutation: updateProfile,
    isUploading,
    setIsUploading,
    avatarFile,
    setIsEditing,
    clearAvatarState,
  });

  // Format join date
  const joinDate = formatJoinDate();

  if (isLoading) return <Loading />;
  if (!isAuthenticated || !user) return <div>Faça login para visualizar o seu perfil.</div>;

  return (
    <>
      <Header title="Perfil do Estudante" subtitle="Gerencie suas informações pessoais e configurações" />
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8">
        {/* Hidden file input for avatar upload */}
        <input
          id="avatar-upload-input"
          type="file"
          accept="image/jpeg,image/png,image/jpg,image/webp"
          className="hidden"
          onChange={handleAvatarChange}
        />

        {/* Profile Header Card */}
        <Card className="bg-gradient-to-r from-violet-900/20 via-purple-900/20 to-violet-900/20 border-violet-900/30 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar Section */}
              <div className="relative group">
                <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-violet-500/50 shadow-xl">
                  <AvatarImage src={avatarPreview || user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-gradient-to-br from-violet-600 to-purple-600 text-white text-2xl font-bold">
                    {getInitials(user?.name || 'U')}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => document.getElementById('avatar-upload-input')?.click()}
                  className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer"
                  disabled={isUploading}
                >
                  <Camera className="w-6 h-6 text-white" />
                </button>

                {/* Upload indicator */}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-violet-400 border-r-2"></div>
                  </div>
                )}
              </div>
              
              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <h1 className="text-2xl md:text-3xl font-bold text-white">{user?.name}</h1>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(!isEditing);
                      if (isEditing) {
                        // Clear avatar states and reset form on cancel
                        clearAvatarState();
                        reset();
                      }
                    }}
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

                {/* Avatar file selected indicator */}
                {avatarFile && !isUploading && (
                  <div className="mt-4 p-3 bg-violet-900/30 border border-violet-500/30 rounded-lg">
                    <p className="text-sm text-violet-300 flex items-center justify-center md:justify-start gap-2">
                      <Camera className="w-4 h-4" />
                      <span className="font-medium">{avatarFile.name}</span>
                      <span className="text-gray-400">({(avatarFile.size / 1024).toFixed(0)} KB)</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1 text-center md:text-left">Clique em "Salvar Alterações" para confirmar</p>
                  </div>
                )}
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
                    <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-white">Nome Completo</Label>
                        <Input
                          id="name"
                          {...register('name')}
                          className="bg-customgreys-primarybg border-violet-900/30 text-white"
                        />
                        {errors.name && (
                          <p className="text-sm text-red-400 mt-1">{errors.name.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-white">Telefone</Label>
                        <Input
                          id="phone"
                          {...register('phone')}
                          className="bg-customgreys-primarybg border-violet-900/30 text-white"
                          placeholder="+244912345678"
                        />
                        {errors.phone && (
                          <p className="text-sm text-red-400 mt-1">{errors.phone.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-white">Localização</Label>
                        <Input
                          id="location"
                          {...register('location')}
                          className="bg-customgreys-primarybg border-violet-900/30 text-white"
                          placeholder="Cidade, Estado"
                        />
                        {errors.location && (
                          <p className="text-sm text-red-400 mt-1">{errors.location.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bio" className="text-white">Biografia</Label>
                        <textarea
                          id="bio"
                          {...register('bio')}
                          className="w-full min-h-[100px] p-3 bg-customgreys-primarybg border border-violet-900/30 rounded-md text-white placeholder:text-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                          placeholder="Conte um pouco sobre você..."
                        />
                        {errors.bio && (
                          <p className="text-sm text-red-400 mt-1">{errors.bio.message}</p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          disabled={isUploading}
                          className="flex-1 bg-violet-800 hover:bg-violet-900 text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isUploading ? (
                            <span className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white border-r-2"></div>
                              {loadingMessage || 'Processando...'}
                            </span>
                          ) : (
                            'Salvar Alterações'
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            clearAvatarState();
                            reset();
                          }}
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
                        <span>{formValues.name || 'Não informado'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-300">
                        <Phone className="w-4 h-4 text-violet-400" />
                        <span>{formValues.phone || 'Não informado'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-300">
                        <MapPin className="w-4 h-4 text-violet-400" />
                        <span>{formValues.location || 'Não informado'}</span>
                      </div>
                      {formValues.bio && (
                        <div className="space-y-2">
                          <Label className="text-white">Biografia</Label>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {formValues.bio}
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
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-customgreys-darkGrey border-violet-900/30">
                <CardContent className="p-6 text-center">
                  <BookOpen className="w-12 h-12 text-violet-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">0</h3>
                  <p className="text-gray-400 text-sm">Cursos Concluídos</p>
                </CardContent>
              </Card>
              
              <Card className="bg-customgreys-darkGrey border-violet-900/30">
                <CardContent className="p-6 text-center">
                  <Target className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">0</h3>
                  <p className="text-gray-400 text-sm">Lições Completadas</p>
                </CardContent>
              </Card>
              
              <Card className="bg-customgreys-darkGrey border-violet-900/30">
                <CardContent className="p-6 text-center">
                  <Activity className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">0h</h3>
                  <p className="text-gray-400 text-sm">Tempo de Estudo</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <Card className="bg-customgreys-darkGrey border-violet-900/30">
              <CardContent className="p-6 text-center">
                <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Nenhuma conquista ainda</h3>
                <p className="text-gray-400">Complete cursos e lições para desbloquear conquistas!</p>
              </CardContent>
            </Card>
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

