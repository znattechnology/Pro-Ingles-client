"use client";

/**
 * Teacher Achievement Management Page - Gamification System
 * 
 * This page allows teachers to create, edit and manage achievements/badges
 * for their students, providing a comprehensive gamification experience.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { motion } from "framer-motion";
import { 
  Trophy, 
  Crown, 
  Star, 
  Target, 
  Flame, 
  BookOpen, 
  Clock, 
  Zap,
  Award,
  Users,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Eye,
  Save,
  X,
  Settings,
  Filter,
  Search,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Loading from '@/components/course/Loading';
import {
  useGetTeacherAchievementsQuery,
  useCreateAchievementMutation,
  useUpdateAchievementMutation,
  useDeleteAchievementMutation,
  useToggleAchievementStatusMutation,
  useGetTeacherAchievementStatsQuery,
  type TeacherAchievement,
  type CreateAchievementData
} from '@/redux/features/admin/teacherAchievementsApi';


// Using TeacherAchievement interface from API
type Achievement = TeacherAchievement;

export default function TeacherAchievementsPage() {
  const router = useRouter();
  
  // API hooks
  const { data: achievements = [], isLoading, refetch } = useGetTeacherAchievementsQuery();
  const { data: statsData } = useGetTeacherAchievementStatsQuery();
  const [createAchievement] = useCreateAchievementMutation();
  const [updateAchievement] = useUpdateAchievementMutation();
  const [deleteAchievement] = useDeleteAchievementMutation();
  const [toggleStatus] = useToggleAchievementStatusMutation();
  
  // Local state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [formData, setFormData] = useState<CreateAchievementData>({
    title: '',
    description: '',
    icon: '🏆',
    category: 'learning',
    rarity: 'common',
    points: 10,
    requirement_type: 'points_earned',
    requirement_target: 100,
    requirement_unit: 'pontos',
    is_secret: false
  });


  const categories = [
    { id: 'all', name: 'Todas', icon: Trophy },
    { id: 'learning', name: 'Aprendizagem', icon: BookOpen },
    { id: 'streak', name: 'Sequência', icon: Flame },
    { id: 'milestone', name: 'Marcos', icon: Target },
    { id: 'social', name: 'Social', icon: Users },
    { id: 'special', name: 'Especiais', icon: Crown }
  ];

  const rarityColors = {
    common: 'border-gray-500 bg-gray-500/10 text-gray-400',
    rare: 'border-blue-500 bg-blue-500/10 text-blue-400',
    epic: 'border-purple-500 bg-purple-500/10 text-purple-400',
    legendary: 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
  };

  const requirementTypes = [
    { value: 'points_earned', label: 'Pontos Acumulados' },
    { value: 'lessons_completed', label: 'Lições Completadas' },
    { value: 'streak_days', label: 'Dias Consecutivos' },
    { value: 'challenges_completed', label: 'Desafios Completados' },
    { value: 'perfect_lessons', label: 'Lições Perfeitas' },
    { value: 'course_completed', label: 'Cursos Completados' },
    { value: 'hours_studied', label: 'Horas Estudadas' }
  ];

  const emojiOptions = [
    '🏆', '🎯', '⭐', '🔥', '👑', '💎', '🚀', '⚡', '🎖️', '🏅',
    '🌟', '💫', '✨', '🎊', '🎉', '📚', '🎓', '💪', '🧠', '❤️'
  ];

  const filteredAchievements = achievements.filter(achievement => {
    const matchesCategory = selectedCategory === 'all' || achievement.category === selectedCategory;
    const matchesSearch = achievement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const stats = statsData || {
    total: achievements.length,
    active: achievements.filter(a => a.is_active).length,
    inactive: achievements.filter(a => !a.is_active).length,
    totalUnlocked: achievements.reduce((sum, a) => sum + (a.unlocked_count || 0), 0)
  };

  const handleSaveAchievement = async () => {
    try {
      if (editingAchievement) {
        // Update existing achievement
        await updateAchievement({
          id: editingAchievement.id,
          data: formData
        }).unwrap();
      } else {
        // Create new achievement
        await createAchievement(formData).unwrap();
      }
      closeModal();
    } catch (error) {
      console.error('Failed to save achievement:', error);
    }
  };

  const handleEditAchievement = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setFormData({
      title: achievement.title,
      description: achievement.description,
      icon: achievement.icon,
      category: achievement.category,
      rarity: achievement.rarity,
      points: achievement.points,
      requirement_type: achievement.requirement_type,
      requirement_target: achievement.requirement_target,
      requirement_unit: achievement.requirement_unit,
      is_secret: achievement.is_secret
    });
    setIsCreateModalOpen(true);
  };

  const handleDeleteAchievement = async (id: string) => {
    try {
      await deleteAchievement(id).unwrap();
    } catch (error) {
      console.error('Failed to delete achievement:', error);
    }
  };

  const toggleAchievementStatus = async (id: string) => {
    try {
      await toggleStatus({ id }).unwrap();
    } catch (error) {
      console.error('Failed to toggle achievement status:', error);
    }
  };

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setEditingAchievement(null);
    setFormData({
      title: '',
      description: '',
      icon: '🏆',
      category: 'learning',
      rarity: 'common',
      points: 10,
      requirement_type: 'points_earned',
      requirement_target: 100,
      requirement_unit: 'pontos',
      is_secret: false
    });
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-customgreys-primarybg text-white">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative px-6 py-12"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-600/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-600/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          {/* Back Button */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Button
              variant="outline"
              onClick={() => router.push('/teacher/laboratory')}
              className="bg-customgreys-secondarybg/50 backdrop-blur-sm border-customgreys-darkerGrey text-white hover:bg-customgreys-darkerGrey"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Laboratório
            </Button>
          </motion.div>

          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-6 py-2 mb-6"
            >
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-300 font-medium">Gestão de Conquistas</span>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-5xl md:text-6xl font-bold mb-4"
            >
              Sistema de <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Badges</span>
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
            >
              Crie e gerencie conquistas para motivar seus estudantes
            </motion.p>
          </div>

          {/* Stats Overview */}
          <motion.div 
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          >
            <motion.div
              whileHover={{ y: -4 }}
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.total}</div>
              <div className="text-sm text-gray-400">Total</div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.active}</div>
              <div className="text-sm text-gray-400">Ativas</div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-gray-500/10 to-slate-500/10 border border-gray-500/20"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gray-500/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-gray-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.inactive}</div>
              <div className="text-sm text-gray-400">Inativas</div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <Award className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.totalUnlocked}</div>
              <div className="text-sm text-gray-400">Desbloqueadas</div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Toolbar */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col md:flex-row gap-4 mb-8"
          >
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar conquistas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-customgreys-secondarybg border-customgreys-darkerGrey text-white"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48 bg-customgreys-secondarybg border-customgreys-darkerGrey text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id} className="text-white hover:bg-customgreys-darkerGrey">
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Create Button */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Conquista
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-2xl bg-customgreys-secondarybg border-customgreys-darkerGrey text-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">
                    {editingAchievement ? 'Editar Conquista' : 'Nova Conquista'}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Nome da conquista"
                        className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="icon">Ícone *</Label>
                      <Select value={formData.icon} onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}>
                        <SelectTrigger className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-customgreys-primarybg border-customgreys-darkerGrey">
                          {emojiOptions.map((emoji) => (
                            <SelectItem key={emoji} value={emoji} className="text-white hover:bg-customgreys-darkerGrey">
                              <span className="text-lg mr-2">{emoji}</span> {emoji}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descreva como conquistar esta badge"
                      className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white"
                      rows={3}
                    />
                  </div>

                  <Separator className="bg-customgreys-darkerGrey" />

                  {/* Category and Rarity */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoria *</Label>
                      <Select value={formData.category} onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-customgreys-primarybg border-customgreys-darkerGrey">
                          {categories.slice(1).map((category) => (
                            <SelectItem key={category.id} value={category.id} className="text-white hover:bg-customgreys-darkerGrey">
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rarity">Raridade *</Label>
                      <Select value={formData.rarity} onValueChange={(value: any) => setFormData(prev => ({ ...prev, rarity: value }))}>
                        <SelectTrigger className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-customgreys-primarybg border-customgreys-darkerGrey">
                          <SelectItem value="common" className="text-white hover:bg-customgreys-darkerGrey">Comum</SelectItem>
                          <SelectItem value="rare" className="text-white hover:bg-customgreys-darkerGrey">Rara</SelectItem>
                          <SelectItem value="epic" className="text-white hover:bg-customgreys-darkerGrey">Épica</SelectItem>
                          <SelectItem value="legendary" className="text-white hover:bg-customgreys-darkerGrey">Lendária</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="points">Pontos *</Label>
                      <Input
                        id="points"
                        type="number"
                        value={formData.points}
                        onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                        className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white"
                      />
                    </div>
                  </div>

                  <Separator className="bg-customgreys-darkerGrey" />

                  {/* Requirements */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Critérios de Desbloqueio</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="requirement_type">Tipo de Requisito *</Label>
                        <Select value={formData.requirement_type} onValueChange={(value) => setFormData(prev => ({ ...prev, requirement_type: value }))}>
                          <SelectTrigger className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-customgreys-primarybg border-customgreys-darkerGrey">
                            {requirementTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value} className="text-white hover:bg-customgreys-darkerGrey">
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="requirement_target">Meta *</Label>
                        <Input
                          id="requirement_target"
                          type="number"
                          value={formData.requirement_target}
                          onChange={(e) => setFormData(prev => ({ ...prev, requirement_target: parseInt(e.target.value) || 0 }))}
                          className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="requirement_unit">Unidade *</Label>
                        <Input
                          id="requirement_unit"
                          value={formData.requirement_unit}
                          onChange={(e) => setFormData(prev => ({ ...prev, requirement_unit: e.target.value }))}
                          placeholder="ex: pontos, lições, dias"
                          className="bg-customgreys-primarybg border-customgreys-darkerGrey text-white"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_secret"
                        checked={formData.is_secret}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_secret: e.target.checked }))}
                        className="rounded border-customgreys-darkerGrey"
                      />
                      <Label htmlFor="is_secret" className="text-sm">
                        Conquista secreta (oculta até ser desbloqueada)
                      </Label>
                    </div>
                  </div>

                  <Separator className="bg-customgreys-darkerGrey" />

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSaveAchievement}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      disabled={!formData.title || !formData.description}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingAchievement ? 'Atualizar' : 'Criar'} Conquista
                    </Button>
                    <Button
                      variant="outline"
                      onClick={closeModal}
                      className="border-customgreys-darkerGrey text-gray-400 hover:bg-customgreys-darkerGrey hover:text-white"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>

          {/* Achievements Grid */}
          <motion.div 
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.7 + (index * 0.1) }}
                className="group"
              >
                <Card className={`bg-customgreys-secondarybg border-customgreys-darkerGrey hover:border-yellow-500/30 transition-all duration-300 h-full ${
                  !achievement.is_active ? 'opacity-50' : ''
                }`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`text-3xl ${
                          achievement.is_active ? '' : 'opacity-60'
                        }`}>{achievement.icon}</div>
                        <div>
                          <CardTitle className={`text-lg ${
                            achievement.is_active ? 'text-white' : 'text-gray-200'
                          }`}>{achievement.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`${rarityColors[achievement.rarity]} text-xs`}>
                              <Star className="w-3 h-3 mr-1" />
                              {achievement.rarity}
                            </Badge>
                            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                              +{achievement.points} pts
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditAchievement(achievement)}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleAchievementStatus(achievement.id)}
                          className={achievement.is_active ? "text-gray-400 hover:text-gray-300 hover:bg-gray-500/20" : "text-green-400 hover:text-green-300 hover:bg-green-500/20"}
                        >
                          {achievement.is_active ? <Eye className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteAchievement(achievement.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className={`text-sm leading-relaxed ${
                      achievement.is_active ? 'text-gray-300' : 'text-gray-400'
                    }`}>
                      {achievement.description}
                    </p>
                    
                    <div className="bg-customgreys-primarybg/50 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">Critério de Desbloqueio</div>
                      <div className="text-sm text-white">
                        {achievement.requirement_target} {achievement.requirement_unit}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-gray-400">
                        <Users className="w-4 h-4 inline mr-1" />
                        {achievement.unlocked_count} desbloqueadas
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        achievement.is_active 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {achievement.is_active ? 'Ativa' : 'Inativa'}
                      </div>
                    </div>

                    {achievement.is_secret && (
                      <div className="flex items-center gap-2 text-xs text-purple-400">
                        <Eye className="w-3 h-3" />
                        Conquista Secreta
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {filteredAchievements.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Trophy className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                {searchQuery || selectedCategory !== 'all' 
                  ? 'Nenhuma conquista encontrada' 
                  : 'Nenhuma conquista criada ainda'
                }
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || selectedCategory !== 'all'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece criando sua primeira conquista para gamificar o aprendizado'
                }
              </p>
              {!searchQuery && selectedCategory === 'all' && (
                <Button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Conquista
                </Button>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}