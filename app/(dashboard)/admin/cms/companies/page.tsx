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
  Building, 
  Save, 
  AlertCircle,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff
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

interface Company {
  id?: number
  name: string
  logo?: string | null
  website_url: string
  description: string
  category: 'oil_gas' | 'banking' | 'telecoms' | 'government' | 'education' | 'technology' | 'other'
  show_in_hero: boolean
  show_in_ticker: boolean
  is_active: boolean
  order: number
}

const CMS_API_BASE = process.env.NEXT_PUBLIC_CMS_API_URL || 'http://localhost:8000/api/v1/cms'

const CATEGORY_OPTIONS = [
  { value: 'oil_gas', label: 'Petróleo & Gás' },
  { value: 'banking', label: 'Bancário' },
  { value: 'telecoms', label: 'Telecomunicações' },
  { value: 'government', label: 'Governo' },
  { value: 'education', label: 'Educação' },
  { value: 'technology', label: 'Tecnologia' },
  { value: 'other', label: 'Outros' },
]

const emptyCompany: Company = {
  name: '',
  logo: null,
  website_url: '',
  description: '',
  category: 'other',
  show_in_hero: false,
  show_in_ticker: true,
  is_active: true,
  order: 0
}

export default function CMSCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${CMS_API_BASE}/companies/`)
      if (!response.ok) throw new Error('Falha ao carregar empresas')
      
      const data = await response.json()
      setCompanies(data.results || data)
      setError(null)
    } catch (err) {
      setError('Erro ao carregar empresas. Verifique se o backend está rodando.')
      console.error('Error fetching companies:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (company: Company) => {
    try {
      setSaving(true)
      setError(null)
      
      const method = company.id ? 'PUT' : 'POST'
      const url = company.id 
        ? `${CMS_API_BASE}/companies/${company.id}/`
        : `${CMS_API_BASE}/companies/`
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(company),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Falha ao salvar empresa')
      }
      
      const savedCompany = await response.json()
      
      if (company.id) {
        setCompanies(prev => prev.map(c => c.id === company.id ? savedCompany : c))
      } else {
        setCompanies(prev => [...prev, savedCompany])
      }
      
      toast({
        title: "✅ Sucesso!",
        description: `Empresa ${company.id ? 'atualizada' : 'criada'} com sucesso.`,
      })
      
      setIsDialogOpen(false)
      setEditingCompany(null)
      
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

  const handleDelete = async (companyId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta empresa?')) return
    
    try {
      setSaving(true)
      const response = await fetch(`${CMS_API_BASE}/companies/${companyId}/`, {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Falha ao excluir empresa')
      
      setCompanies(prev => prev.filter(c => c.id !== companyId))
      toast({
        title: "✅ Sucesso!",
        description: "Empresa excluída com sucesso.",
      })
      
    } catch (_err) {
      toast({
        title: "❌ Erro",
        description: "Erro ao excluir empresa.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const openEditDialog = (company: Company | null = null) => {
    setEditingCompany(company || { ...emptyCompany })
    setIsDialogOpen(true)
  }

  const getCategoryLabel = (category: string) => {
    return CATEGORY_OPTIONS.find(opt => opt.value === category)?.label || category
  }

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'oil_gas': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      case 'banking': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'telecoms': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'government': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'education': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'technology': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto mb-4"></div>
            <p>Carregando empresas...</p>
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
            <h2 className="text-3xl font-bold tracking-tight">Empresas Parceiras</h2>
            <p className="text-muted-foreground">
              Gerencie as empresas exibidas na hero e ticker
            </p>
          </div>
        </div>
        <Button onClick={() => openEditDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Empresa
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
            <div className="text-2xl font-bold">{companies.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Na Hero</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-600">
              {companies.filter(c => c.show_in_hero).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">No Ticker</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {companies.filter(c => c.show_in_ticker).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {companies.filter(c => c.is_active).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Empresas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Empresas ({companies.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <div 
                key={company.id}
                className="p-4 border rounded-lg space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{company.name}</h3>
                    <Badge 
                      variant="secondary"
                      className={getCategoryBadgeColor(company.category)}
                    >
                      {getCategoryLabel(company.category)}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => openEditDialog(company)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => company.id && handleDelete(company.id)}
                      disabled={saving}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {company.description && (
                  <p className="text-sm text-muted-foreground">
                    {company.description.length > 80 
                      ? company.description.substring(0, 80) + '...'
                      : company.description
                    }
                  </p>
                )}

                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    {company.show_in_hero ? (
                      <>
                        <Eye className="h-3 w-3 text-violet-600" />
                        <span className="text-violet-600">Hero</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-400">Hero</span>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {company.show_in_ticker ? (
                      <>
                        <Eye className="h-3 w-3 text-blue-600" />
                        <span className="text-blue-600">Ticker</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-400">Ticker</span>
                      </>
                    )}
                  </div>

                  {!company.is_active && (
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      Inativa
                    </Badge>
                  )}
                </div>

                {company.website_url && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full" 
                    asChild
                  >
                    <a href={company.website_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Website
                    </a>
                  </Button>
                )}
              </div>
            ))}
          </div>

          {companies.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma empresa cadastrada ainda.</p>
              <Button onClick={() => openEditDialog()} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeira Empresa
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para Editar/Criar Empresa */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCompany?.id ? 'Editar Empresa' : 'Nova Empresa'}
            </DialogTitle>
            <DialogDescription>
              Configure as informações da empresa e onde ela deve aparecer
            </DialogDescription>
          </DialogHeader>

          {editingCompany && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Nome da Empresa *</Label>
                  <Input
                    id="company_name"
                    value={editingCompany.name}
                    onChange={(e) => setEditingCompany(prev => prev ? {
                      ...prev,
                      name: e.target.value
                    } : null)}
                    placeholder="Sonangol"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_category">Categoria</Label>
                  <Select
                    value={editingCompany.category}
                    onValueChange={(value: any) => setEditingCompany(prev => prev ? {
                      ...prev,
                      category: value
                    } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_website">Website</Label>
                <Input
                  id="company_website"
                  type="url"
                  value={editingCompany.website_url}
                  onChange={(e) => setEditingCompany(prev => prev ? {
                    ...prev,
                    website_url: e.target.value
                  } : null)}
                  placeholder="https://sonangol.co.ao"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_description">Descrição</Label>
                <Textarea
                  id="company_description"
                  value={editingCompany.description}
                  onChange={(e) => setEditingCompany(prev => prev ? {
                    ...prev,
                    description: e.target.value
                  } : null)}
                  placeholder="Breve descrição da empresa..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_logo">Logo (URL)</Label>
                <Input
                  id="company_logo"
                  type="url"
                  value={editingCompany.logo || ''}
                  onChange={(e) => setEditingCompany(prev => prev ? {
                    ...prev,
                    logo: e.target.value || null
                  } : null)}
                  placeholder="https://exemplo.com/logo.png"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mostrar na Hero</Label>
                    <div className="text-sm text-muted-foreground">
                      Aparecer na seção principal da página
                    </div>
                  </div>
                  <Switch
                    checked={editingCompany.show_in_hero}
                    onCheckedChange={(checked) => setEditingCompany(prev => prev ? {
                      ...prev,
                      show_in_hero: checked
                    } : null)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mostrar no Ticker</Label>
                    <div className="text-sm text-muted-foreground">
                      Aparecer na barra de empresas parceiras
                    </div>
                  </div>
                  <Switch
                    checked={editingCompany.show_in_ticker}
                    onCheckedChange={(checked) => setEditingCompany(prev => prev ? {
                      ...prev,
                      show_in_ticker: checked
                    } : null)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Empresa Ativa</Label>
                    <div className="text-sm text-muted-foreground">
                      Empresa visível no site
                    </div>
                  </div>
                  <Switch
                    checked={editingCompany.is_active}
                    onCheckedChange={(checked) => setEditingCompany(prev => prev ? {
                      ...prev,
                      is_active: checked
                    } : null)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_order">Ordem de Exibição</Label>
                <Input
                  id="company_order"
                  type="number"
                  min="0"
                  value={editingCompany.order}
                  onChange={(e) => setEditingCompany(prev => prev ? {
                    ...prev,
                    order: parseInt(e.target.value) || 0
                  } : null)}
                  placeholder="0"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => editingCompany && handleSave(editingCompany)}
              disabled={saving || !editingCompany?.name}
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