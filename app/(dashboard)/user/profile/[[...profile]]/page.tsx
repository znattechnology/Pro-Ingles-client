"use client";

import Header from "@/components/course/Header";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import { useUpdateProfileMutation } from "@/src/domains/auth";
import { userLoggedIn } from "@/src/domains/auth";
import { useDispatch } from "react-redux";
import { uploadAvatarToS3 } from "@/lib/utils";
import { studentProfileSchema, StudentProfileFormData } from "@/lib/schemas/profile.schema";
import { validateAvatarFile } from "@/lib/validators/avatar.validator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  const dispatch = useDispatch();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<StudentProfileFormData>({
    resolver: zodResolver(studentProfileSchema),
    mode: 'onChange', // Validate on change for real-time feedback
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      bio: '',
      location: '',
    },
  });

  // Watch form values for display when not editing
  const formValues = watch();

  // Avatar upload states
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Populate form with user data when user changes
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        phone: (user as any).phone || '',
        bio: (user as any).bio || '',
        location: (user as any).location || '',
      });
    }
  }, [user, reset]);

  // Avatar upload handler with centralized validation
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Use centralized avatar validator
    const validation = validateAvatarFile(file);
    if (!validation.valid) {
      toast.error(validation.error!);
      return;
    }

    setAvatarFile(validation.processedFile!);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(processedFile);

    // Automatically enable editing mode
    setIsEditing(true);

    toast.success('Imagem selecionada! Clique em "Salvar Alterações" para fazer upload.');
  };

  // Upload avatar to S3 and update profile
  const uploadProfileWithAvatar = async (file: File) => {
    try {
      // Step 1: Upload file to S3 and get the avatar URL
      const avatarUrl = await uploadAvatarToS3(file);

      // Step 2: Update user profile in database with the new avatar URL
      const token = localStorage.getItem('access_token');
      const apiUrl = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000/api/v1';
      const endpoint = `${apiUrl}/users/profile/`;

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          avatar: avatarUrl
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erro ao atualizar perfil' }));
        throw new Error(error.message || error.detail || 'Erro ao atualizar perfil');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error);
      throw error;
    }
  };

  // Form submission handler with validated data
  const onSubmit = async (formData: StudentProfileFormData) => {
    // Prevent double submission
    if (isUploading) return;

    setIsUploading(true);

    try {
      let updatedUser;

      if (avatarFile) {
        updatedUser = await uploadProfileWithAvatar(avatarFile);

        // Avatar field now contains the full S3/CloudFront URL
        const userToSave = {
          ...updatedUser,
          avatar: updatedUser.avatar
        };

        // Update localStorage with new user data
        localStorage.setItem('django_user', JSON.stringify(userToSave));

        // Update Redux state with new user data
        const accessToken = localStorage.getItem('access_token') || '';
        const refreshToken = localStorage.getItem('refresh_token') || '';

        dispatch(userLoggedIn({
          accessToken,
          refreshToken,
          user: userToSave
        }));

        toast.success('Perfil e foto atualizados com sucesso!');

        // Clear upload states
        setIsEditing(false);
        setAvatarFile(null);
        setAvatarPreview(null);
      } else {
        // formData is already validated by Zod!
        updatedUser = await updateProfile(formData).unwrap();
        toast.success('Perfil atualizado com sucesso!');
        setIsEditing(false);
      }
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error(error?.message || error?.data?.message || 'Erro ao atualizar perfil');
    } finally {
      setIsUploading(false);
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
                >
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
                    onClick={() => {
                      setIsEditing(!isEditing);
                      if (isEditing) {
                        // Clear avatar states and reset form on cancel
                        setAvatarFile(null);
                        setAvatarPreview(null);
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
                          disabled={isUpdating}
                          className="flex-1 bg-violet-800 hover:bg-violet-900 text-white"
                        >
                          {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            setAvatarFile(null);
                            setAvatarPreview(null);
                            reset(); // Reset form to original values
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

