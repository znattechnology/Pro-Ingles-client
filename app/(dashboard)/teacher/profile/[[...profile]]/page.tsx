"use client";

import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import { useUpdateProfileMutation } from "@/src/domains/auth";
import { userLoggedIn } from "@/src/domains/auth";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import React, { useState, useEffect } from "react";
import Loading from "@/components/course/Loading";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
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
  GraduationCap,
  Users,
  BarChart3,
  Award,
  ArrowLeft,
  Sparkles,
  Star,
  Trophy,
  Flame,
  Zap,
  Brain,
  TrendingUp,
  Clock,
  CheckCircle,
  Heart,
  Crown,
  Briefcase,
  Globe
} from "lucide-react";
import { useRouter } from "next/navigation";

const TeacherProfilePage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading } = useDjangoAuth();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    specialization: '',
    experience: '',
  });

  // Avatar upload states
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Removed excessive debug logging - keeping only critical upload logs

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: (user as any).phone || '',
        bio: (user as any).bio || '',
        location: (user as any).location || '',
        specialization: (user as any).specialization || '',
        experience: (user as any).experience || '',
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

  // Avatar upload handler
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter menos de 5MB');
      return;
    }

    // Rename file if filename is too long (max 100 chars including extension)
    let processedFile = file;
    if (file.name.length > 100) {
      const extension = file.name.substring(file.name.lastIndexOf('.'));
      const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.'));
      const maxNameLength = 95 - extension.length; // Leave room for extension and safety margin
      const truncatedName = nameWithoutExt.substring(0, maxNameLength);
      const newFileName = `${truncatedName}${extension}`;

      processedFile = new File([file], newFileName, { type: file.type });
      console.log(`📝 Filename too long (${file.name.length} chars), renamed to: ${newFileName} (${newFileName.length} chars)`);
    }

    // Store file
    setAvatarFile(processedFile);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(processedFile);

    // Automatically enable editing mode to show save button
    setIsEditing(true);

    toast.success('Imagem selecionada! Clique em "Salvar Alterações" para fazer upload.');
  };

  // Upload profile with avatar using FormData
  const uploadProfileWithAvatar = async (file: File, userData: typeof formData) => {
    console.log('📤 uploadProfileWithAvatar() STARTED');
    console.log('📁 File details:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: new Date(file.lastModified).toISOString()
    });

    const formDataToSend = new FormData();
    formDataToSend.append('avatar', file);
    console.log('✅ File appended to FormData');

    // Log all FormData entries
    console.log('📦 FormData contents:');
    for (const [key, value] of formDataToSend.entries()) {
      console.log(`  - ${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes, ${value.type})` : value);
    }

    const token = localStorage.getItem('access_token');
    const apiUrl = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000/api/v1';
    const endpoint = `${apiUrl}/users/profile/`;

    console.log('\n🌐 HTTP REQUEST:');
    console.log('  - URL:', endpoint);
    console.log('  - Method: PATCH');
    console.log('  - Token:', token ? `${token.substring(0, 20)}...` : 'MISSING!');
    console.log('  - Headers: Authorization only (Content-Type auto-set by browser)');

    try {
      console.log('\n📡 Sending request...');
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type - browser sets it automatically with boundary
        },
        body: formDataToSend,
      });

      console.log('\n📥 Response received:');
      console.log('  - Status:', response.status, response.statusText);
      console.log('  - OK:', response.ok);
      console.log('  - Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        console.log('❌ Response NOT OK, parsing error...');
        const error = await response.json().catch(() => ({ message: 'Erro ao fazer upload' }));
        console.error('❌ SERVER ERROR RESPONSE:');
        console.error('  - Error object:', error);
        console.error('  - Error message:', error.message);
        console.error('  - Error detail:', error.detail);
        console.error('  - Error details:', error.details);
        console.error('  - Full JSON:', JSON.stringify(error, null, 2));
        throw new Error(error.message || error.detail || 'Erro ao fazer upload');
      }

      console.log('✅ Response OK, parsing JSON...');
      const data = await response.json();
      console.log('✅ Upload successful! Response data:', data);
      return data;
    } catch (error) {
      console.error('\n💥 FETCH ERROR:');
      console.error('  - Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('  - Error message:', error instanceof Error ? error.message : String(error));
      console.error('  - Full error:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('\n' + '='.repeat(80));
    console.log('🚀 FORM SUBMIT INITIATED');
    console.log('='.repeat(80));
    console.log('Event type:', e.type);

    e.preventDefault();
    console.log('✅ preventDefault called');

    console.log('\n📊 CURRENT STATE:');
    console.log('  - avatarFile:', avatarFile ? `File(${avatarFile.name}, ${avatarFile.size} bytes)` : 'null');
    console.log('  - isUploading:', isUploading);
    console.log('  - isUpdating:', isUpdating);
    console.log('  - formData:', formData);

    // Prevent double submission
    if (isUploading) {
      console.log('⚠️ Upload already in progress, ignoring');
      return;
    }

    setIsUploading(true);
    console.log('✅ isUploading set to true\n');

    try {
      let updatedUser;

      if (avatarFile) {
        console.log('✅ Avatar file detected, starting upload...');
        console.log('📤 Calling uploadProfileWithAvatar()...\n');

        updatedUser = await uploadProfileWithAvatar(avatarFile, formData);

        console.log('\n✅ Upload successful!');
        console.log('📥 Response:', updatedUser);
        console.log('📥 Response.avatar:', updatedUser.avatar);
        console.log('📥 Response.avatar_url:', updatedUser.avatar_url);

        // Use avatar_url if available, otherwise use avatar
        const userToSave = {
          ...updatedUser,
          avatar: updatedUser.avatar_url || updatedUser.avatar
        };
        console.log('💾 User object to save:', userToSave);
        console.log('💾 User.avatar:', userToSave.avatar);

        // Update localStorage with new user data
        localStorage.setItem('django_user', JSON.stringify(userToSave));
        console.log('✅ Updated localStorage with new user data');

        // Update Redux state with new user data
        const accessToken = localStorage.getItem('access_token') || '';
        const refreshToken = localStorage.getItem('refresh_token') || '';

        console.log('🔄 Dispatching userLoggedIn with:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          userId: userToSave.id,
          userAvatar: userToSave.avatar
        });

        dispatch(userLoggedIn({
          accessToken,
          refreshToken,
          user: userToSave
        }));
        console.log('✅ Updated Redux state with new user data');

        toast.success('Perfil e foto atualizados com sucesso!');

        // Clear upload states
        setIsEditing(false);
        setAvatarFile(null);
        setAvatarPreview(null);

        console.log('✅ States cleared, upload complete!');
        console.log('='.repeat(80) + '\n');
      } else {
        console.log('❌ No avatar file, updating profile only...');
        updatedUser = await updateProfile(formData).unwrap();
        toast.success('Perfil atualizado com sucesso!');

        setIsEditing(false);
        console.log('✅ Profile updated (no avatar)');
        console.log('='.repeat(80) + '\n');
      }
    } catch (error: any) {
      console.log('\n' + '='.repeat(80));
      console.log('❌ ERROR OCCURRED');
      console.log('='.repeat(80));
      console.error('Full error object:', error);
      console.error('Error message:', error?.message);
      console.error('Error data:', error?.data);
      console.error('Error stack:', error?.stack);
      console.log('='.repeat(80) + '\n');

      toast.error(error?.message || error?.data?.message || 'Erro ao atualizar perfil');
    } finally {
      setIsUploading(false);
      console.log('✅ isUploading set to false (finally block)');
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

  // Mock data for statistics
  const teacherStats = {
    courses: 3,
    students: 47,
    lessons: 28,
    totalHours: 156,
    rating: 4.8,
    completionRate: 89,
    engagement: 94
  };

  // Debug: Log user avatar URL and localStorage
  useEffect(() => {
    if (user) {
      console.log('👤 Current user object from Redux:', {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        email: user.email
      });

      // Check localStorage
      const storedUser = localStorage.getItem('django_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        console.log('💾 User from localStorage:', {
          id: parsed.id,
          name: parsed.name,
          avatar: parsed.avatar,
          email: parsed.email
        });
      }
    }
  }, [user]);

  if (isLoading) return <Loading />;
  if (!isAuthenticated || !user) return <div>Faça login para visualizar o seu perfil.</div>;

  return (
    <div className="min-h-screen bg-customgreys-primarybg text-white">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative px-6 py-8"
      >
        {/* Enhanced Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-20 -left-40 w-80 h-80 bg-teal-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />
          {/* Floating particles */}
          <div className="absolute top-20 left-20 w-2 h-2 bg-emerald-400/30 rounded-full animate-bounce" style={{animationDelay: '0s'}} />
          <div className="absolute top-40 right-32 w-1 h-1 bg-teal-400/40 rounded-full animate-bounce" style={{animationDelay: '1s'}} />
          <div className="absolute bottom-32 left-1/3 w-1.5 h-1.5 bg-green-400/30 rounded-full animate-bounce" style={{animationDelay: '2s'}} />
          <div className="absolute bottom-20 right-20 w-2 h-2 bg-emerald-300/20 rounded-full animate-bounce" style={{animationDelay: '3s'}} />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Button 
                variant="ghost"
                onClick={() => router.push('/teacher/dashboard')}
                className="text-gray-400 hover:text-white hover:bg-emerald-600/20 transition-all"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Voltar ao Dashboard
              </Button>
            </motion.div>
          </div>

          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-green-500/10 border border-emerald-500/30 rounded-full px-8 py-3 mb-8 backdrop-blur-sm shadow-lg shadow-emerald-500/10"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Crown className="w-6 h-6 text-emerald-400" />
              </motion.div>
              <span className="text-emerald-300 font-semibold text-lg">Perfil do Professor</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 text-teal-400" />
              </motion.div>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight"
            >
              Meu{' '}
              <motion.span 
                className="bg-gradient-to-r from-emerald-400 via-teal-400 to-green-400 bg-clip-text text-transparent"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ backgroundSize: '200% 200%' }}
              >
                Perfil
              </motion.span>
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                className="inline-block ml-2"
              >
                👨‍🏫
              </motion.span>
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12 font-light"
            >
              Gerencie suas <motion.span className="text-emerald-400 font-medium" whileHover={{ scale: 1.05 }}>informações pessoais</motion.span> e{' '}
              <motion.span className="text-teal-400 font-medium" whileHover={{ scale: 1.05 }}>configurações profissionais</motion.span>
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Profile Header Card */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="px-6 mb-8"
      >
        <div className="max-w-7xl mx-auto">
          <Card className="bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-green-500/10 backdrop-blur-md border-2 border-emerald-500/20 hover:border-emerald-400/60 shadow-2xl shadow-emerald-500/10 hover:shadow-emerald-500/25 transition-all duration-500 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <CardContent className="p-8 relative">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Avatar Section */}
                <div className="relative group/avatar">
                  {/* Hidden file input */}
                  <input
                    id="avatar-upload-input"
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />

                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-emerald-500/50 shadow-2xl shadow-emerald-500/25">
                      <AvatarImage src={avatarPreview || user?.avatar} alt={user?.name} />
                      <AvatarFallback className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white text-3xl font-bold">
                        {getInitials(user?.name || 'P')}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                  <motion.button
                    type="button"
                    onClick={() => document.getElementById('avatar-upload-input')?.click()}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer"
                  >
                    <Camera className="w-8 h-8 text-white" />
                  </motion.button>

                  {/* Upload indicator */}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-400 border-r-2"></div>
                    </div>
                  )}
                </div>
                
                {/* User Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <h1 className="text-3xl md:text-4xl font-bold text-white">{user?.name}</h1>
                      <div className="flex gap-2">
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30 transition-colors">
                          <Crown className="w-3 h-3 mr-1" />
                          Professor Premium
                        </Badge>
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verificado
                        </Badge>
                      </div>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (isEditing) {
                            // When canceling, clear avatar selection
                            setAvatarFile(null);
                            setAvatarPreview(null);
                          }
                          setIsEditing(!isEditing);
                        }}
                        className="bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        {isEditing ? 'Cancelar' : 'Editar Perfil'}
                      </Button>
                    </motion.div>
                  </div>
                  
                  <div className="flex flex-wrap justify-center md:justify-start gap-6 text-gray-300 mb-6">
                    <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm">{user?.email}</span>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-teal-400" />
                      <span className="text-sm">Professor de Inglês</span>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-green-400" />
                      <span className="text-sm">Membro desde {joinDate}</span>
                    </motion.div>
                  </div>

                  {/* File selected indicator */}
                  {avatarFile && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center"
                    >
                      <p className="text-sm text-emerald-300 flex items-center justify-center gap-2">
                        <Camera className="w-4 h-4" />
                        <span className="font-medium">{avatarFile.name}</span>
                        <span className="text-gray-400">({(avatarFile.size / 1024).toFixed(0)} KB)</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Clique em "Salvar Alterações" para confirmar</p>
                    </motion.div>
                  )}

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { icon: BookOpen, label: 'Cursos', value: teacherStats.courses, color: 'text-blue-400' },
                      { icon: Users, label: 'Estudantes', value: teacherStats.students, color: 'text-purple-400' },
                      { icon: Star, label: 'Avaliação', value: teacherStats.rating, color: 'text-yellow-400' },
                      { icon: Trophy, label: 'Taxa Sucesso', value: `${teacherStats.completionRate}%`, color: 'text-orange-400' }
                    ].map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        whileHover={{ y: -4, scale: 1.05 }}
                        className="text-center p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:border-emerald-500/30 transition-all duration-300"
                      >
                        <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
                        <div className="text-white font-bold text-lg">{stat.value}</div>
                        <div className="text-gray-400 text-xs">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="px-6 pb-12"
      >
        <div className="max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <div className="flex justify-center">
              <TabsList className="bg-customgreys-secondarybg/50 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-1 shadow-lg">
                <TabsTrigger value="profile" className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white rounded-lg transition-all duration-300">
                  <User className="w-4 h-4 mr-2" />
                  Perfil
                </TabsTrigger>
                <TabsTrigger value="teaching" className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white rounded-lg transition-all duration-300">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Ensino
                </TabsTrigger>
                <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white rounded-lg transition-all duration-300">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="settings" className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white rounded-lg transition-all duration-300">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <Card className="bg-gradient-to-br from-customgreys-secondarybg/40 via-customgreys-secondarybg/60 to-customgreys-secondarybg/40 backdrop-blur-md border-2 border-emerald-500/20 hover:border-emerald-400/60 shadow-2xl shadow-emerald-500/10 hover:shadow-emerald-500/25 transition-all duration-500">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <User className="w-5 h-5 text-emerald-400" />
                        Informações Pessoais
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isEditing ? (
                        <form
                          onSubmit={handleSubmit}
                          className="space-y-4"
                        >
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-white">Nome Completo</Label>
                            <Input
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              className="bg-customgreys-primarybg/50 border-emerald-500/30 text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
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
                              className="bg-customgreys-primarybg/50 border-emerald-500/30 text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
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
                              className="bg-customgreys-primarybg/50 border-emerald-500/30 text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                              placeholder="Cidade, Estado"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="specialization" className="text-white">Especialização</Label>
                            <Input
                              id="specialization"
                              name="specialization"
                              value={formData.specialization}
                              onChange={handleInputChange}
                              className="bg-customgreys-primarybg/50 border-emerald-500/30 text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                              placeholder="Ex: Inglês Avançado, Business English"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="experience" className="text-white">Experiência</Label>
                            <Input
                              id="experience"
                              name="experience"
                              value={formData.experience}
                              onChange={handleInputChange}
                              className="bg-customgreys-primarybg/50 border-emerald-500/30 text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                              placeholder="Ex: 5 anos ensinando inglês"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="bio" className="text-white">Biografia</Label>
                            <textarea
                              id="bio"
                              name="bio"
                              value={formData.bio}
                              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                              className="w-full min-h-[100px] p-3 bg-customgreys-primarybg/50 border border-emerald-500/30 rounded-md text-white placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                              placeholder="Conte sobre sua experiência como professor..."
                            />
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              type="submit"
                              disabled={isUploading}
                              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isUploading ? (
                                <span className="flex items-center gap-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white border-r-2"></div>
                                  Fazendo Upload...
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
                                setAvatarFile(null);
                                setAvatarPreview(null);
                              }}
                              className="border-gray-600 text-gray-400 hover:bg-gray-800"
                            >
                              Cancelar
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <div className="space-y-4">
                          {[
                            { icon: User, label: 'Nome', value: formData.name },
                            { icon: Phone, label: 'Telefone', value: formData.phone },
                            { icon: MapPin, label: 'Localização', value: formData.location },
                            { icon: Briefcase, label: 'Especialização', value: formData.specialization },
                            { icon: Award, label: 'Experiência', value: formData.experience }
                          ].map((item, index) => (
                            <motion.div
                              key={item.label}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.9 + index * 0.1 }}
                              className="flex items-center gap-3 text-gray-300 p-3 rounded-lg hover:bg-emerald-500/5 transition-colors duration-200"
                            >
                              <item.icon className="w-4 h-4 text-emerald-400" />
                              <div className="flex-1">
                                <div className="text-xs text-gray-500 uppercase tracking-wider">{item.label}</div>
                                <div className="text-white">{item.value || 'Não informado'}</div>
                              </div>
                            </motion.div>
                          ))}
                          {formData.bio && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 1.4 }}
                              className="space-y-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20"
                            >
                              <Label className="text-emerald-400 text-sm font-medium">Biografia</Label>
                              <p className="text-gray-300 text-sm leading-relaxed">
                                {formData.bio}
                              </p>
                            </motion.div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Account Information */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <Card className="bg-gradient-to-br from-customgreys-secondarybg/40 via-customgreys-secondarybg/60 to-customgreys-secondarybg/40 backdrop-blur-md border-2 border-emerald-500/20 hover:border-emerald-400/60 shadow-2xl shadow-emerald-500/10 hover:shadow-emerald-500/25 transition-all duration-500">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Shield className="w-5 h-5 text-emerald-400" />
                        Informações da Conta
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-emerald-500/5 transition-all duration-200"
                        >
                          <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-emerald-400" />
                            <div>
                              <p className="text-white text-sm font-medium">Email</p>
                              <p className="text-gray-400 text-xs">{user?.email}</p>
                            </div>
                          </div>
                          <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verificado
                          </Badge>
                        </motion.div>
                        
                        <Separator className="bg-emerald-500/20" />
                        
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-emerald-500/5 transition-all duration-200"
                        >
                          <div className="flex items-center gap-3">
                            <Crown className="w-4 h-4 text-emerald-400" />
                            <div>
                              <p className="text-white text-sm font-medium">Tipo de Conta</p>
                              <p className="text-gray-400 text-xs">Professor Premium</p>
                            </div>
                          </div>
                          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                            <Star className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        </motion.div>
                        
                        <Separator className="bg-emerald-500/20" />
                        
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-emerald-500/5 transition-all duration-200"
                        >
                          <Calendar className="w-4 h-4 text-emerald-400" />
                          <div>
                            <p className="text-white text-sm font-medium">Professor desde</p>
                            <p className="text-gray-400 text-xs">{joinDate}</p>
                          </div>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>

            {/* Teaching Tab */}
            <TabsContent value="teaching" className="space-y-6">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="grid md:grid-cols-3 gap-6"
              >
                {[
                  { icon: BookOpen, title: 'Cursos Criados', value: teacherStats.courses, color: 'emerald', gradient: 'from-emerald-500 to-teal-500' },
                  { icon: Users, title: 'Estudantes Ativos', value: teacherStats.students, color: 'blue', gradient: 'from-blue-500 to-cyan-500' },
                  { icon: Target, title: 'Lições Ministradas', value: teacherStats.lessons, color: 'purple', gradient: 'from-purple-500 to-violet-500' }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                  >
                    <Card className="bg-gradient-to-br from-customgreys-secondarybg/40 via-customgreys-secondarybg/60 to-customgreys-secondarybg/40 backdrop-blur-md border-2 border-emerald-500/20 hover:border-emerald-400/60 shadow-2xl shadow-emerald-500/10 hover:shadow-emerald-500/25 transition-all duration-500">
                      <CardContent className="p-6 text-center">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className={`w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}
                        >
                          <stat.icon className="w-8 h-8 text-white" />
                        </motion.div>
                        <h3 className="text-3xl font-bold text-white mb-2">{stat.value}</h3>
                        <p className="text-gray-400 text-sm">{stat.title}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              {/* Additional Teaching Metrics */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="grid md:grid-cols-2 gap-6"
              >
                <Card className="bg-gradient-to-br from-customgreys-secondarybg/40 via-customgreys-secondarybg/60 to-customgreys-secondarybg/40 backdrop-blur-md border-2 border-emerald-500/20 hover:border-emerald-400/60 shadow-2xl shadow-emerald-500/10 hover:shadow-emerald-500/25 transition-all duration-500">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                      Performance Geral
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { label: 'Taxa de Conclusão', value: `${teacherStats.completionRate}%`, color: 'text-green-400' },
                      { label: 'Engajamento', value: `${teacherStats.engagement}%`, color: 'text-blue-400' },
                      { label: 'Horas Totais', value: `${teacherStats.totalHours}h`, color: 'text-purple-400' }
                    ].map((metric) => (
                      <div key={metric.label} className="flex justify-between items-center">
                        <span className="text-gray-300">{metric.label}</span>
                        <span className={`font-bold ${metric.color}`}>{metric.value}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-customgreys-secondarybg/40 via-customgreys-secondarybg/60 to-customgreys-secondarybg/40 backdrop-blur-md border-2 border-emerald-500/20 hover:border-emerald-400/60 shadow-2xl shadow-emerald-500/10 hover:shadow-emerald-500/25 transition-all duration-500">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-400" />
                      Avaliações
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <span className="text-4xl font-bold text-white">{teacherStats.rating}</span>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-5 h-5 ${i < Math.floor(teacherStats.rating) ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm">Baseado em 127 avaliações</p>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <Card className="bg-gradient-to-br from-customgreys-secondarybg/40 via-customgreys-secondarybg/60 to-customgreys-secondarybg/40 backdrop-blur-md border-2 border-emerald-500/20 hover:border-emerald-400/60 shadow-2xl shadow-emerald-500/10 hover:shadow-emerald-500/25 transition-all duration-500">
                  <CardContent className="p-12 text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl"
                    >
                      <BarChart3 className="w-10 h-10 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-white mb-4">Analytics Avançado</h3>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                      Visualize métricas detalhadas do desempenho dos seus cursos, progresso dos estudantes e estatísticas de engajamento em breve!
                    </p>
                    <Button
                      onClick={() => router.push('/teacher/laboratory/analytics')}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Ir para Analytics
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <Card className="bg-gradient-to-br from-customgreys-secondarybg/40 via-customgreys-secondarybg/60 to-customgreys-secondarybg/40 backdrop-blur-md border-2 border-emerald-500/20 hover:border-emerald-400/60 shadow-2xl shadow-emerald-500/10 hover:shadow-emerald-500/25 transition-all duration-500">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Settings className="w-5 h-5 text-emerald-400" />
                      Configurações de Professor
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {[
                      {
                        icon: Users,
                        title: 'Notificações de Estudantes',
                        description: 'Receber notificações sobre progresso dos alunos',
                        action: 'Configurar',
                        color: 'emerald'
                      },
                      {
                        icon: Globe,
                        title: 'Perfil Público',
                        description: 'Permitir que estudantes vejam seu perfil',
                        action: 'Gerenciar',
                        color: 'blue'
                      },
                      {
                        icon: Shield,
                        title: 'Privacidade e Segurança',
                        description: 'Configurações de privacidade da conta',
                        action: 'Configurar',
                        color: 'purple'
                      }
                    ].map((setting, index) => (
                      <motion.div
                        key={setting.title}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center justify-between p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:border-emerald-500/30 transition-all duration-300"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-${setting.color}-600 to-${setting.color}-700 flex items-center justify-center`}>
                            <setting.icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{setting.title}</p>
                            <p className="text-gray-400 text-sm">{setting.description}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className={`border-${setting.color}-500 text-${setting.color}-400 hover:bg-${setting.color}-500/10`}>
                          {setting.action}
                        </Button>
                      </motion.div>
                    ))}
                    
                    <Separator className="bg-emerald-500/20" />
                    
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2 }}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-red-500/5 border border-red-500/20 hover:border-red-500/40 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center">
                          <Settings className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Solicitar Desativação</p>
                          <p className="text-gray-400 text-sm">Desativar temporariamente conta de professor</p>
                        </div>
                      </div>
                      <Button variant="destructive" size="sm">
                        Solicitar
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
};

export default TeacherProfilePage;