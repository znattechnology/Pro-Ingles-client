'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { 
  Star, 
  Save, 
  AlertCircle,
  ArrowLeft,
  Badge as BadgeIcon,
  Type,
  MousePointer,
  Users,
  Image as ImageIcon,
  Play
} from "lucide-react"
import Link from 'next/link'
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface HeroSection {
  id?: number
  badge_text: string
  badge_is_active: boolean
  headline: string
  headline_highlight: string
  description: string
  primary_cta_text: string
  primary_cta_url: string
  secondary_cta_text: string
  secondary_cta_url: string
  social_proof_text: string
  rating_value: string
  rating_count: string
  hero_image?: string | null
  background_video?: string | null
  is_active: boolean
  order: number
}

const CMS_API_BASE = process.env.NEXT_PUBLIC_CMS_API_URL || 'http://localhost:8000/api/v1/cms'

export default function CMSHeroPage() {
  const [hero, setHero] = useState<HeroSection>({
    badge_text: '',
    badge_is_active: true,
    headline: '',
    headline_highlight: '',
    description: '',
    primary_cta_text: '',
    primary_cta_url: '',
    secondary_cta_text: '',
    secondary_cta_url: '',
    social_proof_text: '',
    rating_value: '5.0',
    rating_count: '',
    hero_image: null,
    background_video: null,
    is_active: true,
    order: 0
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchHero()
  }, [])

  const fetchHero = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${CMS_API_BASE}/hero/`)
      if (!response.ok) throw new Error('Falha ao carregar seção hero')
      
      const data = await response.json()
      if (data.results && data.results.length > 0) {
        setHero(data.results[0])
      }
      setError(null)
    } catch (err) {
      setError('Erro ao carregar seção hero. Verifique se o backend está rodando.')
      console.error('Error fetching hero:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      
      const method = hero.id ? 'PUT' : 'POST'
      const url = hero.id 
        ? `${CMS_API_BASE}/hero/${hero.id}/`
        : `${CMS_API_BASE}/hero/`
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hero),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Falha ao salvar seção hero')
      }
      
      const savedHero = await response.json()
      setHero(savedHero)
      
      toast({
        title: "✅ Sucesso!",
        description: "Seção Hero salva com sucesso.",
      })
      
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

  const handleInputChange = (field: keyof HeroSection) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setHero(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  const handleNumberChange = (field: keyof HeroSection) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value === '' ? 0 : parseFloat(e.target.value)
    setHero(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSwitchChange = (field: keyof HeroSection) => (checked: boolean) => {
    setHero(prev => ({
      ...prev,
      [field]: checked
    }))
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto mb-4"></div>
            <p>Carregando seção hero...</p>
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
            <h2 className="text-3xl font-bold tracking-tight">Seção Hero</h2>
            <p className="text-muted-foreground">
              Gerencie o conteúdo principal da página inicial
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        
        {/* Badge */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BadgeIcon className="h-5 w-5" />
              Badge Promocional
            </CardTitle>
            <CardDescription>
              Banner pequeno que aparece acima do título principal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Badge Ativo</Label>
                <div className="text-sm text-muted-foreground">
                  Mostrar ou ocultar o badge
                </div>
              </div>
              <Switch
                checked={hero.badge_is_active}
                onCheckedChange={handleSwitchChange('badge_is_active')}
              />
            </div>
            
            {hero.badge_is_active && (
              <div className="space-y-2">
                <Label htmlFor="badge_text">Texto do Badge</Label>
                <Input
                  id="badge_text"
                  value={hero.badge_text}
                  onChange={handleInputChange('badge_text')}
                  placeholder="🇦🇴 A primeira plataforma de inglês feita para Angola"
                />
                <div className="p-2 bg-violet-100 dark:bg-violet-900/20 rounded text-sm">
                  <strong>Preview:</strong> {hero.badge_text || 'Texto do badge aparecerá aqui'}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Headlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Títulos Principais
            </CardTitle>
            <CardDescription>
              Headline principal e destaque
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="headline">Título Principal</Label>
                <Input
                  id="headline"
                  value={hero.headline}
                  onChange={handleInputChange('headline')}
                  placeholder="Inglês Especializado"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="headline_highlight">Destaque do Título</Label>
                <Input
                  id="headline_highlight"
                  value={hero.headline_highlight}
                  onChange={handleInputChange('headline_highlight')}
                  placeholder="com IA Personal Tutor"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={hero.description}
                onChange={handleInputChange('description')}
                placeholder="A única plataforma que combina inteligência artificial..."
                rows={3}
              />
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded">
              <strong>Preview:</strong>
              <div className="mt-2">
                <h1 className="text-2xl font-bold">
                  {hero.headline || 'Título Principal'} 
                  <span className="text-violet-600 ml-2">
                    {hero.headline_highlight || 'Destaque'}
                  </span>
                </h1>
                <p className="text-muted-foreground mt-2">
                  {hero.description || 'Descrição aparecerá aqui...'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTAs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MousePointer className="h-5 w-5" />
              Botões de Ação (CTAs)
            </CardTitle>
            <CardDescription>
              Botões principais que direcionam os usuários
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary_cta_text">Botão Primário - Texto</Label>
                <Input
                  id="primary_cta_text"
                  value={hero.primary_cta_text}
                  onChange={handleInputChange('primary_cta_text')}
                  placeholder="Começar Grátis - 7 Dias"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primary_cta_url">Botão Primário - URL</Label>
                <Input
                  id="primary_cta_url"
                  value={hero.primary_cta_url}
                  onChange={handleInputChange('primary_cta_url')}
                  placeholder="/signup"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary_cta_text">Botão Secundário - Texto</Label>
                <Input
                  id="secondary_cta_text"
                  value={hero.secondary_cta_text}
                  onChange={handleInputChange('secondary_cta_text')}
                  placeholder="Ver Demo do IA Tutor"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary_cta_url">Botão Secundário - URL</Label>
                <Input
                  id="secondary_cta_url"
                  value={hero.secondary_cta_url}
                  onChange={handleInputChange('secondary_cta_url')}
                  placeholder="#demo"
                />
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded">
              <strong>Preview:</strong>
              <div className="mt-2 flex gap-2">
                <Button>
                  {hero.primary_cta_text || 'Botão Primário'}
                </Button>
                <Button variant="outline">
                  {hero.secondary_cta_text || 'Botão Secundário'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Proof */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Prova Social
            </CardTitle>
            <CardDescription>
              Números e avaliações que geram confiança
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="social_proof_text">Texto de Prova Social</Label>
                <Input
                  id="social_proof_text"
                  value={hero.social_proof_text}
                  onChange={handleInputChange('social_proof_text')}
                  placeholder="Mais de 10.000 angolanos"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating_value">Avaliação (1-5)</Label>
                <Input
                  id="rating_value"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={hero.rating_value}
                  onChange={handleInputChange('rating_value')}
                  placeholder="4.9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating_count">Quantidade de Reviews</Label>
                <Input
                  id="rating_count"
                  value={hero.rating_count}
                  onChange={handleInputChange('rating_count')}
                  placeholder="2.1k reviews"
                />
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded">
              <strong>Preview:</strong>
              <div className="mt-2 flex items-center gap-4">
                <span className="text-sm">{hero.social_proof_text || 'Prova social'}</span>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">⭐</span>
                  <span className="text-sm font-medium">
                    {hero.rating_value || '5.0'}/5 ({hero.rating_count || 'reviews'})
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mídia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Mídia
            </CardTitle>
            <CardDescription>
              Imagens e vídeos de fundo (funcionalidade futura)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hero_image" className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Imagem Hero
                </Label>
                <Input
                  id="hero_image"
                  type="text"
                  value={hero.hero_image || ''}
                  onChange={handleInputChange('hero_image')}
                  placeholder="URL da imagem ou deixe vazio"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="background_video" className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Vídeo de Fundo
                </Label>
                <Input
                  id="background_video"
                  type="text"
                  value={hero.background_video || ''}
                  onChange={handleInputChange('background_video')}
                  placeholder="URL do vídeo ou deixe vazio"
                />
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              💡 Nota: O upload de arquivos será implementado em versões futuras. 
              Por enquanto, use URLs diretas para imagens e vídeos hospedados externamente.
            </div>
          </CardContent>
        </Card>

        {/* Configurações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Configurações de Exibição
            </CardTitle>
            <CardDescription>
              Controle de visibilidade e ordem
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Seção Ativa</Label>
                  <div className="text-sm text-muted-foreground">
                    Mostrar esta seção na landing page
                  </div>
                </div>
                <Switch
                  checked={hero.is_active}
                  onCheckedChange={handleSwitchChange('is_active')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="order">Ordem de Exibição</Label>
                <Input
                  id="order"
                  type="number"
                  min="0"
                  value={hero.order}
                  onChange={handleNumberChange('order')}
                  placeholder="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Botão de Salvar Fixo */}
      <div className="sticky bottom-4 flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg" className="shadow-lg">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </div>
  )
}