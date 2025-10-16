'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { 
  Zap, 
  Save, 
  AlertCircle,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Star,
  X
} from "lucide-react"
import Link from 'next/link'
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ServiceItem {
  id?: number
  title: string
  subtitle: string
  description: string
  icon: string
  service_type: 'course' | 'practice_lab' | 'ai_tutor' | 'other'
  student_count: string
  level: string
  duration: string
  certification: string
  service_image?: string | null
  gradient_from: string
  gradient_to: string
  features: string[]
  curriculum_topics: string[]
  is_featured: boolean
  is_active: boolean
  order: number
}

const CMS_API_BASE = process.env.NEXT_PUBLIC_CMS_API_URL || 'http://localhost:8000/api/v1/cms'

const SERVICE_TYPE_OPTIONS = [
  { value: 'course', label: 'Curso Especializado' },
  { value: 'practice_lab', label: 'Practice Lab' },
  { value: 'ai_tutor', label: 'IA Personal Tutor' },
  { value: 'other', label: 'Outros' },
]

const emptyService: ServiceItem = {
  title: '',
  subtitle: '',
  description: '',
  icon: '',
  service_type: 'course',
  student_count: '0+',
  level: 'Iniciante-Avançado',
  duration: '2-4 meses',
  certification: 'Certificado ProEnglish',
  service_image: null,
  gradient_from: 'violet-600',
  gradient_to: 'purple-600',
  features: [],
  curriculum_topics: [],
  is_featured: false,
  is_active: true,
  order: 0
}

export default function CMSServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([])
  const [editingService, setEditingService] = useState<ServiceItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newFeature, setNewFeature] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${CMS_API_BASE}/services/`)
      if (!response.ok) throw new Error('Falha ao carregar serviços')
      
      const data = await response.json()
      setServices(data.results || data)
      setError(null)
    } catch (err) {
      setError('Erro ao carregar serviços. Verifique se o backend está rodando.')
      console.error('Error fetching services:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (service: ServiceItem) => {
    try {
      setSaving(true)
      setError(null)
      
      const method = service.id ? 'PUT' : 'POST'
      const url = service.id 
        ? `${CMS_API_BASE}/services/${service.id}/`
        : `${CMS_API_BASE}/services/`
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(service),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Falha ao salvar serviço')
      }
      
      const savedService = await response.json()
      
      if (service.id) {
        setServices(prev => prev.map(s => s.id === service.id ? savedService : s))
      } else {
        setServices(prev => [...prev, savedService])
      }
      
      toast({
        title: "✅ Sucesso!",
        description: `Serviço ${service.id ? 'atualizado' : 'criado'} com sucesso.`,
      })
      
      setIsDialogOpen(false)
      setEditingService(null)
      
      // Limpar cache do CMS
      try {
        await fetch(`${CMS_API_BASE}/clear-cache/`, { method: 'POST' })
      } catch (cacheError) {
        console.warn('Could not clear cache:', cacheError)
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      toast({
        title: "❌ Erro",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (serviceId: number) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return
    
    try {
      setSaving(true)
      const response = await fetch(`${CMS_API_BASE}/services/${serviceId}/`, {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Falha ao excluir serviço')
      
      setServices(prev => prev.filter(s => s.id !== serviceId))
      toast({
        title: "✅ Sucesso!",
        description: "Serviço excluído com sucesso.",
      })
      
    } catch {
      toast({
        title: "❌ Erro",
        description: "Erro ao excluir serviço.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const openEditDialog = (service: ServiceItem | null = null) => {
    setEditingService(service || { ...emptyService, order: services.length })
    setNewFeature('')
    setIsDialogOpen(true)
  }

  const addFeature = () => {
    if (!newFeature.trim() || !editingService) return
    setEditingService(prev => prev ? {
      ...prev,
      features: [...prev.features, newFeature.trim()]
    } : null)
    setNewFeature('')
  }

  const removeFeature = (index: number) => {
    setEditingService(prev => prev ? {
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    } : null)
  }


  const getServiceTypeLabel = (type: string) => {
    return SERVICE_TYPE_OPTIONS.find(opt => opt.value === type)?.label || type
  }

  const getServiceTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'course': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'practice_lab': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'ai_tutor': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto mb-4"></div>
            <p>Carregando serviços...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-4 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/cms">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao CMS
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Serviços</h2>
            <p className="text-muted-foreground">
              Gerencie cursos especializados e serviços oferecidos
            </p>
          </div>
        </div>
        <Button onClick={() => openEditDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Serviço
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cursos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {services.filter(s => s.service_type === 'course').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Practice Lab</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {services.filter(s => s.service_type === 'practice_lab').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">IA Tutor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {services.filter(s => s.service_type === 'ai_tutor').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Serviços */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Serviços ({services.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {services.map((service) => (
              <div 
                key={service.id}
                className="p-6 border rounded-lg space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{service.icon}</span>
                      <div>
                        <h3 className="text-lg font-semibold">{service.title}</h3>
                        {service.subtitle && (
                          <p className="text-sm text-muted-foreground">{service.subtitle}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Badge 
                          variant="secondary"
                          className={getServiceTypeBadgeColor(service.service_type)}
                        >
                          {getServiceTypeLabel(service.service_type)}
                        </Badge>
                        {service.is_featured && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Star className="h-3 w-3 mr-1" />
                            Destaque
                          </Badge>
                        )}
                        {!service.is_active && (
                          <Badge variant="secondary" className="bg-red-100 text-red-800">
                            Inativo
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {service.description.length > 200 
                        ? service.description.substring(0, 200) + '...'
                        : service.description
                      }
                    </p>
                    
                    <div className="flex items-center gap-6 text-sm">
                      <div><strong>Estudantes:</strong> {service.student_count}</div>
                      <div><strong>Nível:</strong> {service.level}</div>
                      <div><strong>Duração:</strong> {service.duration}</div>
                    </div>
                    
                    {service.features.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1">Features:</p>
                        <div className="flex flex-wrap gap-1">
                          {service.features.slice(0, 5).map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {service.features.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{service.features.length - 5} mais
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => openEditDialog(service)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => service.id && handleDelete(service.id)}
                      disabled={saving}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {services.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum serviço cadastrado ainda.</p>
              <Button onClick={() => openEditDialog()} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Serviço
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para Editar/Criar Serviço */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingService?.id ? 'Editar Serviço' : 'Novo Serviço'}
            </DialogTitle>
            <DialogDescription>
              Configure as informações do serviço oferecido
            </DialogDescription>
          </DialogHeader>

          {editingService && (
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informações Básicas</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="service_title">Título *</Label>
                    <Input
                      id="service_title"
                      value={editingService.title}
                      onChange={(e) => setEditingService(prev => prev ? {
                        ...prev,
                        title: e.target.value
                      } : null)}
                      placeholder="Inglês para Petróleo & Gás"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service_icon">Ícone</Label>
                    <Input
                      id="service_icon"
                      value={editingService.icon}
                      onChange={(e) => setEditingService(prev => prev ? {
                        ...prev,
                        icon: e.target.value
                      } : null)}
                      placeholder="🛢️ (emoji)"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="service_subtitle">Subtítulo</Label>
                  <Input
                    id="service_subtitle"
                    value={editingService.subtitle}
                    onChange={(e) => setEditingService(prev => prev ? {
                      ...prev,
                      subtitle: e.target.value
                    } : null)}
                    placeholder="Para profissionais do setor energético"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="service_description">Descrição *</Label>
                  <Textarea
                    id="service_description"
                    value={editingService.description}
                    onChange={(e) => setEditingService(prev => prev ? {
                      ...prev,
                      description: e.target.value
                    } : null)}
                    placeholder="Especializado para Sonangol, Total Angola e Chevron..."
                    rows={4}
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="service_type">Tipo de Serviço</Label>
                    <Select
                      value={editingService.service_type}
                      onValueChange={(value: any) => setEditingService(prev => prev ? {
                        ...prev,
                        service_type: value
                      } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_TYPE_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="service_image">Imagem (URL)</Label>
                    <Input
                      id="service_image"
                      value={editingService.service_image || ''}
                      onChange={(e) => setEditingService(prev => prev ? {
                        ...prev,
                        service_image: e.target.value || null
                      } : null)}
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* Metadados do Serviço */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Metadados</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="service_student_count">Número de Estudantes</Label>
                    <Input
                      id="service_student_count"
                      value={editingService.student_count}
                      onChange={(e) => setEditingService(prev => prev ? {
                        ...prev,
                        student_count: e.target.value
                      } : null)}
                      placeholder="2.5K+"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service_level">Nível</Label>
                    <Input
                      id="service_level"
                      value={editingService.level}
                      onChange={(e) => setEditingService(prev => prev ? {
                        ...prev,
                        level: e.target.value
                      } : null)}
                      placeholder="Técnico-Professional"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service_duration">Duração</Label>
                    <Input
                      id="service_duration"
                      value={editingService.duration}
                      onChange={(e) => setEditingService(prev => prev ? {
                        ...prev,
                        duration: e.target.value
                      } : null)}
                      placeholder="3-6 meses"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service_certification">Certificação</Label>
                    <Input
                      id="service_certification"
                      value={editingService.certification}
                      onChange={(e) => setEditingService(prev => prev ? {
                        ...prev,
                        certification: e.target.value
                      } : null)}
                      placeholder="Certificado Internacional"
                    />
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Features do Serviço</h3>
                <div className="flex gap-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Digite uma feature e pressione Enter"
                    onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                  />
                  <Button type="button" onClick={addFeature} disabled={!newFeature.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editingService.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {feature}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1"
                        onClick={() => removeFeature(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Configurações */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Configurações</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Serviço em Destaque</Label>
                      <div className="text-sm text-muted-foreground">
                        Destacar na página
                      </div>
                    </div>
                    <Switch
                      checked={editingService.is_featured}
                      onCheckedChange={(checked) => setEditingService(prev => prev ? {
                        ...prev,
                        is_featured: checked
                      } : null)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Serviço Ativo</Label>
                      <div className="text-sm text-muted-foreground">
                        Visível no site
                      </div>
                    </div>
                    <Switch
                      checked={editingService.is_active}
                      onCheckedChange={(checked) => setEditingService(prev => prev ? {
                        ...prev,
                        is_active: checked
                      } : null)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="service_order">Ordem</Label>
                    <Input
                      id="service_order"
                      type="number"
                      min="0"
                      value={editingService.order}
                      onChange={(e) => setEditingService(prev => prev ? {
                        ...prev,
                        order: parseInt(e.target.value) || 0
                      } : null)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => editingService && handleSave(editingService)}
              disabled={saving || !editingService?.title || !editingService?.description}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}