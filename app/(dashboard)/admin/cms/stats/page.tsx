'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  Save, 
  AlertCircle,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  TrendingUp
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

interface StatItem {
  id?: number
  value: string
  label: string
  icon: string
  section: 'hero' | 'about' | 'footer'
  is_active: boolean
  order: number
}

const CMS_API_BASE = process.env.NEXT_PUBLIC_CMS_API_URL || 'http://localhost:8000/api/v1/cms'

const SECTION_OPTIONS = [
  { value: 'hero', label: 'Hero Section' },
  { value: 'about', label: 'About Section' },
  { value: 'footer', label: 'Footer' },
]

const emptyStat: StatItem = {
  value: '',
  label: '',
  icon: '',
  section: 'hero',
  is_active: true,
  order: 0
}

export default function CMSStatsPage() {
  const [stats, setStats] = useState<StatItem[]>([])
  const [editingStat, setEditingStat] = useState<StatItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${CMS_API_BASE}/stats/`)
      if (!response.ok) throw new Error('Falha ao carregar estatísticas')
      
      const data = await response.json()
      setStats(data.results || data)
      setError(null)
    } catch (err) {
      setError('Erro ao carregar estatísticas. Verifique se o backend está rodando.')
      console.error('Error fetching stats:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (stat: StatItem) => {
    try {
      setSaving(true)
      setError(null)
      
      const method = stat.id ? 'PUT' : 'POST'
      const url = stat.id 
        ? `${CMS_API_BASE}/stats/${stat.id}/`
        : `${CMS_API_BASE}/stats/`
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stat),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Falha ao salvar estatística')
      }
      
      const savedStat = await response.json()
      
      if (stat.id) {
        setStats(prev => prev.map(s => s.id === stat.id ? savedStat : s))
      } else {
        setStats(prev => [...prev, savedStat])
      }
      
      toast({
        title: "✅ Sucesso!",
        description: `Estatística ${stat.id ? 'atualizada' : 'criada'} com sucesso.`,
      })
      
      setIsDialogOpen(false)
      setEditingStat(null)
      
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

  const handleDelete = async (statId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta estatística?')) return
    
    try {
      setSaving(true)
      const response = await fetch(`${CMS_API_BASE}/stats/${statId}/`, {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Falha ao excluir estatística')
      
      setStats(prev => prev.filter(s => s.id !== statId))
      toast({
        title: "✅ Sucesso!",
        description: "Estatística excluída com sucesso.",
      })
      
    } catch {
      toast({
        title: "❌ Erro",
        description: "Erro ao excluir estatística.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const openEditDialog = (stat: StatItem | null = null) => {
    setEditingStat(stat || { ...emptyStat, order: stats.length })
    setIsDialogOpen(true)
  }


  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto mb-4"></div>
            <p>Carregando estatísticas...</p>
          </div>
        </div>
      </div>
    )
  }

  const heroStats = stats.filter(s => s.section === 'hero')
  const aboutStats = stats.filter(s => s.section === 'about')
  const footerStats = stats.filter(s => s.section === 'footer')

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
            <h2 className="text-3xl font-bold tracking-tight">Estatísticas</h2>
            <p className="text-muted-foreground">
              Gerencie os números mostrados na hero e outras seções
            </p>
          </div>
        </div>
        <Button onClick={() => openEditDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Estatística
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Hero</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-600">
              {heroStats.filter(s => s.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">About</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {aboutStats.filter(s => s.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Footer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {footerStats.filter(s => s.is_active).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hero Stats */}
      {heroStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-violet-600" />
              Estatísticas da Hero ({heroStats.length})
            </CardTitle>
            <CardDescription>
              Números exibidos na seção principal da página
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {heroStats.map((stat) => (
                <div key={stat.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-center flex-1">
                      <div className="text-2xl font-bold text-violet-600">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => openEditDialog(stat)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => stat.id && handleDelete(stat.id)}
                        disabled={saving}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span>Ordem: {stat.order}</span>
                    {!stat.is_active && (
                      <Badge variant="secondary" className="bg-red-100 text-red-800">
                        Inativa
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* About Stats */}
      {aboutStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Estatísticas About ({aboutStats.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {aboutStats.map((stat) => (
                <div key={stat.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-center flex-1">
                      <div className="text-2xl font-bold text-blue-600">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => openEditDialog(stat)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => stat.id && handleDelete(stat.id)}
                        disabled={saving}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span>Ordem: {stat.order}</span>
                    {!stat.is_active && (
                      <Badge variant="secondary" className="bg-red-100 text-red-800">
                        Inativa
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer Stats */}
      {footerStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-gray-600" />
              Estatísticas Footer ({footerStats.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {footerStats.map((stat) => (
                <div key={stat.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-center flex-1">
                      <div className="text-2xl font-bold text-gray-600">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => openEditDialog(stat)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => stat.id && handleDelete(stat.id)}
                        disabled={saving}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span>Ordem: {stat.order}</span>
                    {!stat.is_active && (
                      <Badge variant="secondary" className="bg-red-100 text-red-800">
                        Inativa
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {stats.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">Nenhuma estatística cadastrada ainda.</p>
            <Button onClick={() => openEditDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Estatística
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialog para Editar/Criar Estatística */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingStat?.id ? 'Editar Estatística' : 'Nova Estatística'}
            </DialogTitle>
            <DialogDescription>
              Configure o valor e onde a estatística deve aparecer
            </DialogDescription>
          </DialogHeader>

          {editingStat && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stat_value">Valor *</Label>
                  <Input
                    id="stat_value"
                    value={editingStat.value}
                    onChange={(e) => setEditingStat(prev => prev ? {
                      ...prev,
                      value: e.target.value
                    } : null)}
                    placeholder="10K+, 94%, 50+"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stat_label">Label *</Label>
                  <Input
                    id="stat_label"
                    value={editingStat.label}
                    onChange={(e) => setEditingStat(prev => prev ? {
                      ...prev,
                      label: e.target.value
                    } : null)}
                    placeholder="Angolanos aprendendo"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stat_icon">Ícone (opcional)</Label>
                <Input
                  id="stat_icon"
                  value={editingStat.icon}
                  onChange={(e) => setEditingStat(prev => prev ? {
                    ...prev,
                    icon: e.target.value
                  } : null)}
                  placeholder="📈, 🎯, ⭐ ou nome do ícone Lucide"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stat_section">Seção</Label>
                <Select
                  value={editingStat.section}
                  onValueChange={(value: any) => setEditingStat(prev => prev ? {
                    ...prev,
                    section: value
                  } : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a seção" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTION_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stat_order">Ordem</Label>
                  <Input
                    id="stat_order"
                    type="number"
                    min="0"
                    value={editingStat.order}
                    onChange={(e) => setEditingStat(prev => prev ? {
                      ...prev,
                      order: parseInt(e.target.value) || 0
                    } : null)}
                  />
                </div>
                <div className="flex items-center justify-between pt-8">
                  <Label>Ativa</Label>
                  <Switch
                    checked={editingStat.is_active}
                    onCheckedChange={(checked) => setEditingStat(prev => prev ? {
                      ...prev,
                      is_active: checked
                    } : null)}
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded">
                <strong>Preview:</strong>
                <div className="mt-2 text-center">
                  <div className="text-xl font-bold text-violet-600">
                    {editingStat.value || 'Valor'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {editingStat.label || 'Label'}
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
              onClick={() => editingStat && handleSave(editingStat)}
              disabled={saving || !editingStat?.value || !editingStat?.label}
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