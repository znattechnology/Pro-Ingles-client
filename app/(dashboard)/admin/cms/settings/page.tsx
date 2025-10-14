'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { 
  Globe, 
  Save, 
  AlertCircle,
  ArrowLeft,
  Phone,
  Mail,
  MessageCircle,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  BarChart3,
  Settings2
} from "lucide-react"
import Link from 'next/link'
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface LandingPageSettings {
  id?: number
  site_title: string
  site_description: string
  meta_keywords: string
  contact_email: string
  contact_phone: string
  whatsapp_number: string
  facebook_url: string
  instagram_url: string
  linkedin_url: string
  youtube_url: string
  google_analytics_id: string
  facebook_pixel_id: string
  is_active: boolean
  maintenance_mode: boolean
  maintenance_message: string
}

const CMS_API_BASE = process.env.NEXT_PUBLIC_CMS_API_URL || 'http://localhost:8000/api/v1/cms'

export default function CMSSettingsPage() {
  const [settings, setSettings] = useState<LandingPageSettings>({
    site_title: '',
    site_description: '',
    meta_keywords: '',
    contact_email: '',
    contact_phone: '',
    whatsapp_number: '',
    facebook_url: '',
    instagram_url: '',
    linkedin_url: '',
    youtube_url: '',
    google_analytics_id: '',
    facebook_pixel_id: '',
    is_active: true,
    maintenance_mode: false,
    maintenance_message: ''
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${CMS_API_BASE}/settings/`)
      if (!response.ok) throw new Error('Falha ao carregar configurações')
      
      const data = await response.json()
      if (data.results && data.results.length > 0) {
        setSettings(data.results[0])
      }
      setError(null)
    } catch (err) {
      setError('Erro ao carregar configurações. Verifique se o backend está rodando.')
      console.error('Error fetching settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      
      const method = settings.id ? 'PUT' : 'POST'
      const url = settings.id 
        ? `${CMS_API_BASE}/settings/${settings.id}/`
        : `${CMS_API_BASE}/settings/`
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Falha ao salvar configurações')
      }
      
      const savedSettings = await response.json()
      setSettings(savedSettings)
      
      toast({
        title: "✅ Sucesso!",
        description: "Configurações salvas com sucesso.",
      })
      
      // Opcional: limpar cache do CMS
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

  const handleInputChange = (field: keyof LandingPageSettings) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setSettings(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  const handleSwitchChange = (field: keyof LandingPageSettings) => (checked: boolean) => {
    setSettings(prev => ({
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
            <p>Carregando configurações...</p>
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
            <h2 className="text-3xl font-bold tracking-tight">Configurações da Landing Page</h2>
            <p className="text-muted-foreground">
              Gerencie informações básicas, contatos e redes sociais
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
        
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
            <CardDescription>
              Título, descrição e palavras-chave do site
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="site_title">Título do Site</Label>
                <Input
                  id="site_title"
                  value={settings.site_title}
                  onChange={handleInputChange('site_title')}
                  placeholder="ProEnglish Angola"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="site_description">Descrição do Site</Label>
                <Input
                  id="site_description"
                  value={settings.site_description}
                  onChange={handleInputChange('site_description')}
                  placeholder="A primeira plataforma de inglês feita para Angola"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="meta_keywords">Palavras-chave (SEO)</Label>
              <Textarea
                id="meta_keywords"
                value={settings.meta_keywords}
                onChange={handleInputChange('meta_keywords')}
                placeholder="inglês, angola, aprender inglês, IA tutor, sonangol..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contatos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Informações de Contato
            </CardTitle>
            <CardDescription>
              Email, telefone e WhatsApp para contato
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email de Contato
                </Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={settings.contact_email}
                  onChange={handleInputChange('contact_email')}
                  placeholder="contato@proenglish.ao"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Telefone
                </Label>
                <Input
                  id="contact_phone"
                  value={settings.contact_phone}
                  onChange={handleInputChange('contact_phone')}
                  placeholder="+244 923 456 789"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp_number" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </Label>
                <Input
                  id="whatsapp_number"
                  value={settings.whatsapp_number}
                  onChange={handleInputChange('whatsapp_number')}
                  placeholder="+244923456789"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Redes Sociais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Facebook className="h-5 w-5" />
              Redes Sociais
            </CardTitle>
            <CardDescription>
              Links para perfis nas redes sociais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="facebook_url" className="flex items-center gap-2">
                  <Facebook className="h-4 w-4" />
                  Facebook
                </Label>
                <Input
                  id="facebook_url"
                  type="url"
                  value={settings.facebook_url}
                  onChange={handleInputChange('facebook_url')}
                  placeholder="https://facebook.com/proenglish"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram_url" className="flex items-center gap-2">
                  <Instagram className="h-4 w-4" />
                  Instagram
                </Label>
                <Input
                  id="instagram_url"
                  type="url"
                  value={settings.instagram_url}
                  onChange={handleInputChange('instagram_url')}
                  placeholder="https://instagram.com/proenglish"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin_url" className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </Label>
                <Input
                  id="linkedin_url"
                  type="url"
                  value={settings.linkedin_url}
                  onChange={handleInputChange('linkedin_url')}
                  placeholder="https://linkedin.com/company/proenglish"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtube_url" className="flex items-center gap-2">
                  <Youtube className="h-4 w-4" />
                  YouTube
                </Label>
                <Input
                  id="youtube_url"
                  type="url"
                  value={settings.youtube_url}
                  onChange={handleInputChange('youtube_url')}
                  placeholder="https://youtube.com/@proenglish"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics e Tracking
            </CardTitle>
            <CardDescription>
              Google Analytics e Facebook Pixel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="google_analytics_id">Google Analytics ID</Label>
                <Input
                  id="google_analytics_id"
                  value={settings.google_analytics_id}
                  onChange={handleInputChange('google_analytics_id')}
                  placeholder="GA-XXXXXXXXX-X"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook_pixel_id">Facebook Pixel ID</Label>
                <Input
                  id="facebook_pixel_id"
                  value={settings.facebook_pixel_id}
                  onChange={handleInputChange('facebook_pixel_id')}
                  placeholder="123456789012345"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Configurações do Sistema
            </CardTitle>
            <CardDescription>
              Status do site e modo de manutenção
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Site Ativo</Label>
                <div className="text-sm text-muted-foreground">
                  Controla se o site está disponível para os usuários
                </div>
              </div>
              <Switch
                checked={settings.is_active}
                onCheckedChange={handleSwitchChange('is_active')}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Modo Manutenção</Label>
                <div className="text-sm text-muted-foreground">
                  Mostra página de manutenção para usuários normais
                </div>
              </div>
              <Switch
                checked={settings.maintenance_mode}
                onCheckedChange={handleSwitchChange('maintenance_mode')}
              />
            </div>
            
            {settings.maintenance_mode && (
              <div className="space-y-2">
                <Label htmlFor="maintenance_message">Mensagem de Manutenção</Label>
                <Textarea
                  id="maintenance_message"
                  value={settings.maintenance_message}
                  onChange={handleInputChange('maintenance_message')}
                  placeholder="Site em manutenção. Voltamos em breve!"
                  rows={3}
                />
              </div>
            )}
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