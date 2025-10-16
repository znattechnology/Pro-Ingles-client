'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { 
  DollarSign, 
  Save, 
  AlertCircle,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Crown,
  X
} from "lucide-react"
import Link from 'next/link'
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface PricingTier {
  id?: number
  title: string
  subtitle: string
  icon: string
  monthly_price: string
  yearly_price: string
  currency: string
  yearly_discount_text: string
  promotional_badge: string
  description: string
  angola_benefit: string
  features: string[]
  button_text: string
  button_url: string
  is_popular: boolean
  is_inverse_design: boolean
  gradient_from: string
  gradient_to: string
  is_active: boolean
  order: number
}

const CMS_API_BASE = process.env.NEXT_PUBLIC_CMS_API_URL || 'http://localhost:8000/api/v1/cms'

const emptyTier: PricingTier = {
  title: '',
  subtitle: '',
  icon: '🚀',
  monthly_price: '0',
  yearly_price: '0',
  currency: 'AOA',
  yearly_discount_text: '',
  promotional_badge: '',
  description: '',
  angola_benefit: '',
  features: [],
  button_text: 'Escolher Plano',
  button_url: '/signup',
  is_popular: false,
  is_inverse_design: false,
  gradient_from: 'violet-600',
  gradient_to: 'purple-600',
  is_active: true,
  order: 0
}

export default function CMSPricingPage() {
  const [tiers, setTiers] = useState<PricingTier[]>([])
  const [editingTier, setEditingTier] = useState<PricingTier | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newFeature, setNewFeature] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    fetchTiers()
  }, [])

  const fetchTiers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${CMS_API_BASE}/pricing/`)
      if (!response.ok) throw new Error('Falha ao carregar planos de preços')
      
      const data = await response.json()
      setTiers(data.results || data)
      setError(null)
    } catch (err) {
      setError('Erro ao carregar planos. Verifique se o backend está rodando.')
      console.error('Error fetching pricing:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (tier: PricingTier) => {
    try {
      setSaving(true)
      setError(null)
      
      const method = tier.id ? 'PUT' : 'POST'
      const url = tier.id 
        ? `${CMS_API_BASE}/pricing/${tier.id}/`
        : `${CMS_API_BASE}/pricing/`
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tier),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Falha ao salvar plano')
      }
      
      const savedTier = await response.json()
      
      if (tier.id) {
        setTiers(prev => prev.map(t => t.id === tier.id ? savedTier : t))
      } else {
        setTiers(prev => [...prev, savedTier])
      }
      
      toast({
        title: "✅ Sucesso!",
        description: `Plano ${tier.id ? 'atualizado' : 'criado'} com sucesso.`,
      })
      
      setIsDialogOpen(false)
      setEditingTier(null)
      
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

  const handleDelete = async (tierId: number) => {
    if (!confirm('Tem certeza que deseja excluir este plano?')) return
    
    try {
      setSaving(true)
      const response = await fetch(`${CMS_API_BASE}/pricing/${tierId}/`, {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Falha ao excluir plano')
      
      setTiers(prev => prev.filter(t => t.id !== tierId))
      toast({
        title: "✅ Sucesso!",
        description: "Plano excluído com sucesso.",
      })
      
    } catch (_err) {
      toast({
        title: "❌ Erro",
        description: "Erro ao excluir plano.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const openEditDialog = (tier: PricingTier | null = null) => {
    setEditingTier(tier || { ...emptyTier, order: tiers.length })
    setNewFeature('')
    setIsDialogOpen(true)
  }

  const addFeature = () => {
    if (!newFeature.trim() || !editingTier) return
    setEditingTier(prev => prev ? {
      ...prev,
      features: [...prev.features, newFeature.trim()]
    } : null)
    setNewFeature('')
  }

  const removeFeature = (index: number) => {
    setEditingTier(prev => prev ? {
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    } : null)
  }

  const formatPrice = (price: string, currency: string) => {
    const num = parseFloat(price)
    if (num === 0) return 'Gratuito'
    return `${num.toLocaleString('pt-AO')} ${currency}`
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto mb-4"></div>
            <p>Carregando planos de preços...</p>
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
            <h2 className="text-3xl font-bold tracking-tight">Planos de Preços</h2>
            <p className="text-muted-foreground">
              Gerencie preços em AOA e ofertas especiais
            </p>
          </div>
        </div>
        <Button onClick={() => openEditDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Plano
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Lista de Planos */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tiers.map((tier) => (
          <Card 
            key={tier.id}
            className={`relative ${
              tier.is_popular 
                ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/10' 
                : ''
            }`}
          >
            {tier.is_popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-violet-600 text-white flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  {tier.promotional_badge || 'Popular'}
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-2">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-3xl mb-2">{tier.icon}</div>
                  <CardTitle className="text-xl">{tier.title}</CardTitle>
                  <CardDescription>{tier.subtitle}</CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => openEditDialog(tier)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => tier.id && handleDelete(tier.id)}
                    disabled={saving}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {formatPrice(tier.monthly_price, tier.currency)}
                  {parseFloat(tier.monthly_price) > 0 && (
                    <span className="text-sm text-muted-foreground">/mês</span>
                  )}
                </div>
                {tier.yearly_discount_text && (
                  <p className="text-sm text-green-600 mt-1">{tier.yearly_discount_text}</p>
                )}
              </div>

              {tier.angola_benefit && (
                <div className="bg-violet-100 dark:bg-violet-900/20 p-3 rounded text-center">
                  <p className="text-sm text-violet-700 dark:text-violet-300">
                    {tier.angola_benefit}
                  </p>
                </div>
              )}

              <div className="space-y-1">
                {tier.features.slice(0, 5).map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <span className="text-green-600 text-xs">✓</span>
                    {feature}
                  </div>
                ))}
                {tier.features.length > 5 && (
                  <div className="text-sm text-muted-foreground">
                    +{tier.features.length - 5} mais features
                  </div>
                )}
              </div>

              <Button 
                className="w-full"
                variant={tier.is_inverse_design ? "outline" : "default"}
              >
                {tier.button_text}
              </Button>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Ordem: {tier.order}</span>
                {!tier.is_active && (
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    Inativo
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tiers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">Nenhum plano cadastrado ainda.</p>
            <Button onClick={() => openEditDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Plano
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialog para Editar/Criar Plano */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTier?.id ? 'Editar Plano' : 'Novo Plano'}
            </DialogTitle>
            <DialogDescription>
              Configure preços e features do plano
            </DialogDescription>
          </DialogHeader>

          {editingTier && (
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informações Básicas</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tier_title">Título *</Label>
                    <Input
                      id="tier_title"
                      value={editingTier.title}
                      onChange={(e) => setEditingTier(prev => prev ? {
                        ...prev,
                        title: e.target.value
                      } : null)}
                      placeholder="Professional"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tier_subtitle">Subtítulo</Label>
                    <Input
                      id="tier_subtitle"
                      value={editingTier.subtitle}
                      onChange={(e) => setEditingTier(prev => prev ? {
                        ...prev,
                        subtitle: e.target.value
                      } : null)}
                      placeholder="Para quem quer crescer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tier_icon">Ícone</Label>
                    <Input
                      id="tier_icon"
                      value={editingTier.icon}
                      onChange={(e) => setEditingTier(prev => prev ? {
                        ...prev,
                        icon: e.target.value
                      } : null)}
                      placeholder="👑"
                    />
                  </div>
                </div>
              </div>

              {/* Preços */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Preços</h3>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tier_monthly_price">Preço Mensal</Label>
                    <Input
                      id="tier_monthly_price"
                      type="number"
                      step="0.01"
                      value={editingTier.monthly_price}
                      onChange={(e) => setEditingTier(prev => prev ? {
                        ...prev,
                        monthly_price: e.target.value
                      } : null)}
                      placeholder="14950.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tier_yearly_price">Preço Anual</Label>
                    <Input
                      id="tier_yearly_price"
                      type="number"
                      step="0.01"
                      value={editingTier.yearly_price}
                      onChange={(e) => setEditingTier(prev => prev ? {
                        ...prev,
                        yearly_price: e.target.value
                      } : null)}
                      placeholder="149500.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tier_currency">Moeda</Label>
                    <Input
                      id="tier_currency"
                      value={editingTier.currency}
                      onChange={(e) => setEditingTier(prev => prev ? {
                        ...prev,
                        currency: e.target.value
                      } : null)}
                      placeholder="AOA"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tier_discount">Desconto Anual</Label>
                    <Input
                      id="tier_discount"
                      value={editingTier.yearly_discount_text}
                      onChange={(e) => setEditingTier(prev => prev ? {
                        ...prev,
                        yearly_discount_text: e.target.value
                      } : null)}
                      placeholder="2 meses grátis"
                    />
                  </div>
                </div>
              </div>

              {/* Textos */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tier_angola_benefit">Benefício para Angola</Label>
                  <Textarea
                    id="tier_angola_benefit"
                    value={editingTier.angola_benefit}
                    onChange={(e) => setEditingTier(prev => prev ? {
                      ...prev,
                      angola_benefit: e.target.value
                    } : null)}
                    placeholder="Criado especificamente para profissionais angolanos"
                    rows={2}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tier_button_text">Texto do Botão</Label>
                    <Input
                      id="tier_button_text"
                      value={editingTier.button_text}
                      onChange={(e) => setEditingTier(prev => prev ? {
                        ...prev,
                        button_text: e.target.value
                      } : null)}
                      placeholder="Acelerar Carreira"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tier_button_url">URL do Botão</Label>
                    <Input
                      id="tier_button_url"
                      value={editingTier.button_url}
                      onChange={(e) => setEditingTier(prev => prev ? {
                        ...prev,
                        button_url: e.target.value
                      } : null)}
                      placeholder="/user/upgrade"
                    />
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Features Incluídas</h3>
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
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {editingTier.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="text-green-600">✓</span>
                      <span className="flex-1 text-sm">{feature}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFeature(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Configurações */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Configurações</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Plano Popular</Label>
                      <Switch
                        checked={editingTier.is_popular}
                        onCheckedChange={(checked) => setEditingTier(prev => prev ? {
                          ...prev,
                          is_popular: checked
                        } : null)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Design Inverso</Label>
                      <Switch
                        checked={editingTier.is_inverse_design}
                        onCheckedChange={(checked) => setEditingTier(prev => prev ? {
                          ...prev,
                          is_inverse_design: checked
                        } : null)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Plano Ativo</Label>
                      <Switch
                        checked={editingTier.is_active}
                        onCheckedChange={(checked) => setEditingTier(prev => prev ? {
                          ...prev,
                          is_active: checked
                        } : null)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tier_promotional_badge">Badge Promocional</Label>
                    <Input
                      id="tier_promotional_badge"
                      value={editingTier.promotional_badge}
                      onChange={(e) => setEditingTier(prev => prev ? {
                        ...prev,
                        promotional_badge: e.target.value
                      } : null)}
                      placeholder="Mais Escolhido"
                    />
                    
                    <div className="space-y-2">
                      <Label htmlFor="tier_order">Ordem</Label>
                      <Input
                        id="tier_order"
                        type="number"
                        min="0"
                        value={editingTier.order}
                        onChange={(e) => setEditingTier(prev => prev ? {
                          ...prev,
                          order: parseInt(e.target.value) || 0
                        } : null)}
                      />
                    </div>
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
              onClick={() => editingTier && handleSave(editingTier)}
              disabled={saving || !editingTier?.title}
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