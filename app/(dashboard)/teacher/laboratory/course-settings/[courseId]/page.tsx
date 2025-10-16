"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import Loading from "@/components/course/Loading";
import { motion } from "framer-motion";
import { 
  ChevronLeft,
  Save,
  Settings,
  AlertCircle,
  Bell,
  Eye,
  Trash2,
  Archive
} from "lucide-react";

interface CourseSettings {
  isPublic: boolean;
  allowSelfEnrollment: boolean;
  enableNotifications: boolean;
  enableProgress: boolean;
  maxStudents: number;
  timeLimit: number;
  passingScore: number;
  allowRetries: boolean;
  enableCertificates: boolean;
}

const CourseSettingsPage = () => {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const { isAuthenticated } = useDjangoAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [courseTitle, setCourseTitle] = useState("");
  const [settings, setSettings] = useState<CourseSettings>({
    isPublic: true,
    allowSelfEnrollment: true,
    enableNotifications: true,
    enableProgress: true,
    maxStudents: 100,
    timeLimit: 60,
    passingScore: 70,
    allowRetries: true,
    enableCertificates: false
  });

  useEffect(() => {
    loadCourseSettings();
  }, [courseId]);

  const loadCourseSettings = async () => {
    try {
      setIsLoading(true);
      // Simular carregamento das configurações
      setCourseTitle("Curso de Inglês para Medicina");
      // As configurações já estão no estado inicial
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error loading course settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      console.log('Saving settings:', { courseId, settings });
      
      // Simulando delay de API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert('Configurações salvas com sucesso!');
      
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Erro ao salvar configurações. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSettingChange = (key: keyof CourseSettings, value: boolean | number) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleArchiveCourse = async () => {
    if (confirm('Tem certeza que deseja arquivar este curso? Os estudantes não poderão mais acessá-lo.')) {
      alert('Funcionalidade de arquivar será implementada');
    }
  };

  const handleDeleteCourse = async () => {
    if (confirm('ATENÇÃO: Tem certeza que deseja excluir este curso? Esta ação não pode ser desfeita!')) {
      if (confirm('Esta é sua última chance. Confirma a exclusão permanente do curso?')) {
        alert('Funcionalidade de exclusão será implementada');
      }
    }
  };

  if (!isAuthenticated || isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-customgreys-primarybg text-white">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative px-6 py-6"
      >
        <div className="relative max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost"
              onClick={() => router.push('/teacher/laboratory/manage-courses')}
              className="text-gray-400 hover:text-white hover:bg-violet-600/20 transition-all text-sm"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Voltar aos Cursos
            </Button>

            <Button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300 text-sm"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Configurações do <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Curso</span>
            </h1>
            <p className="text-base text-gray-300">
              {courseTitle}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="px-6 pb-12">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Access & Visibility Settings */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-gradient-to-br from-violet-500/5 to-purple-500/5 backdrop-blur-xl rounded-2xl border border-violet-500/20 p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Eye className="h-5 w-5 mr-2 text-violet-400" />
              Acesso e Visibilidade
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white font-medium">Curso Público</Label>
                  <p className="text-sm text-gray-400">Permitir que o curso apareça nos resultados de busca</p>
                </div>
                <Switch
                  checked={settings.isPublic}
                  onCheckedChange={(checked) => handleSettingChange('isPublic', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white font-medium">Auto-inscrição</Label>
                  <p className="text-sm text-gray-400">Permitir que estudantes se inscrevam automaticamente</p>
                </div>
                <Switch
                  checked={settings.allowSelfEnrollment}
                  onCheckedChange={(checked) => handleSettingChange('allowSelfEnrollment', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Máximo de Estudantes</Label>
                <Input
                  type="number"
                  value={settings.maxStudents}
                  onChange={(e) => handleSettingChange('maxStudents', parseInt(e.target.value))}
                  className="bg-customgreys-darkGrey border-customgreys-darkerGrey text-white w-32"
                />
              </div>
            </div>
          </motion.div>

          {/* Learning Settings */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-gradient-to-br from-violet-500/5 to-purple-500/5 backdrop-blur-xl rounded-2xl border border-violet-500/20 p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2 text-violet-400" />
              Configurações de Aprendizado
            </h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-300">Tempo Limite (minutos)</Label>
                  <Input
                    type="number"
                    value={settings.timeLimit}
                    onChange={(e) => handleSettingChange('timeLimit', parseInt(e.target.value))}
                    className="bg-customgreys-darkGrey border-customgreys-darkerGrey text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Pontuação Mínima (%)</Label>
                  <Input
                    type="number"
                    value={settings.passingScore}
                    onChange={(e) => handleSettingChange('passingScore', parseInt(e.target.value))}
                    className="bg-customgreys-darkGrey border-customgreys-darkerGrey text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white font-medium">Permitir Tentativas Múltiplas</Label>
                  <p className="text-sm text-gray-400">Estudantes podem refazer desafios</p>
                </div>
                <Switch
                  checked={settings.allowRetries}
                  onCheckedChange={(checked) => handleSettingChange('allowRetries', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white font-medium">Mostrar Progresso</Label>
                  <p className="text-sm text-gray-400">Exibir barra de progresso para estudantes</p>
                </div>
                <Switch
                  checked={settings.enableProgress}
                  onCheckedChange={(checked) => handleSettingChange('enableProgress', checked)}
                />
              </div>
            </div>
          </motion.div>

          {/* Notifications Settings */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-gradient-to-br from-violet-500/5 to-purple-500/5 backdrop-blur-xl rounded-2xl border border-violet-500/20 p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Bell className="h-5 w-5 mr-2 text-violet-400" />
              Notificações
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white font-medium">Notificações Ativas</Label>
                  <p className="text-sm text-gray-400">Receber notificações sobre atividade dos estudantes</p>
                </div>
                <Switch
                  checked={settings.enableNotifications}
                  onCheckedChange={(checked) => handleSettingChange('enableNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white font-medium">Certificados</Label>
                  <p className="text-sm text-gray-400">Gerar certificados automáticos ao concluir</p>
                </div>
                <Switch
                  checked={settings.enableCertificates}
                  onCheckedChange={(checked) => handleSettingChange('enableCertificates', checked)}
                />
              </div>
            </div>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="bg-gradient-to-br from-red-500/5 to-orange-500/5 backdrop-blur-xl rounded-2xl border border-red-500/20 p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-red-400" />
              Zona de Perigo
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <div>
                  <Label className="text-white font-medium">Arquivar Curso</Label>
                  <p className="text-sm text-gray-400">O curso ficará indisponível para novos estudantes</p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleArchiveCourse}
                  className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Arquivar
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <div>
                  <Label className="text-white font-medium">Excluir Curso</Label>
                  <p className="text-sm text-gray-400">Esta ação não pode ser desfeita</p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleDeleteCourse}
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CourseSettingsPage;