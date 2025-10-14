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

