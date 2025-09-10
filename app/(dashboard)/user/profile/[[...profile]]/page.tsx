"use client";

import Header from "@/components/course/Header";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import { useUpdateProfileMutation } from "@/redux/features/auth/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, { useState, useEffect } from "react";
import Loading from "@/components/course/Loading";
import { toast } from "react-hot-toast";

const UserProfilePage = () => {
  const { user, isAuthenticated, isLoading } = useDjangoAuth();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
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
    } catch (error: any) {
      toast.error(error?.data?.message || 'Erro ao atualizar perfil');
    }
  };

  if (isLoading) return <Loading />;
  if (!isAuthenticated || !user) return <div>Faça login para visualizar o seu perfil.</div>;

  return (
    <>
      <Header title="Perfil" subtitle="Veja o seu perfil" />
      <div className="flex justify-center items-start min-h-[calc(100vh-100px)] p-5">
        <Card className="w-full max-w-2xl bg-customgreys-darkGrey border-violet-900/30">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Informações do Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Nome</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="bg-customgreys-primarybg border-violet-900/30 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="bg-customgreys-primarybg border-violet-900/30 text-white"
                  required
                  disabled
                />
                <p className="text-sm text-gray-400">O email não pode ser alterado</p>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Tipo de conta</Label>
                <div className="px-3 py-2 bg-customgreys-primarybg border border-violet-900/30 rounded-md text-white capitalize">
                  {user.role === 'student' ? 'Estudante' : 
                   user.role === 'teacher' ? 'Professor' : 
                   user.role === 'admin' ? 'Administrador' : user.role}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isUpdating}
                className="w-full bg-violet-800 hover:bg-violet-900 text-white"
              >
                {isUpdating ? 'Atualizando...' : 'Atualizar Perfil'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default UserProfilePage;

