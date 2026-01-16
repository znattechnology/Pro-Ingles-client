import { fetchLandingPageData } from '@/lib/cms'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  BarChart3, 
  Globe, 
  Users, 
  Star, 
  MessageSquare,
  Megaphone,
  Search,
  Settings,
  Building,
  Zap,
  DollarSign,
  FileText,
  Edit,
  ExternalLink,
  Activity,
  RefreshCw
} from "lucide-react"
import Link from 'next/link'

export default async function CMSAdminPage() {
  const cmsData = await fetchLandingPageData()
  
  const stats = cmsData ? {
    hero_sections: 1,
    services: cmsData.services?.length || 0,
    pricing_tiers: cmsData.pricing_tiers?.length || 0,
    companies: (cmsData.hero_companies?.length || 0) + (cmsData.ticker_companies?.length || 0),
    features: cmsData.features?.length || 0,
    testimonials: cmsData.testimonials?.length || 0,
    faqs: cmsData.faqs?.length || 0,
    ctas: cmsData.ctas?.length || 0
  } : {
    hero_sections: 0,
    services: 0,
    pricing_tiers: 0,
    companies: 0,
    features: 0,
    testimonials: 0,
    faqs: 0,
    ctas: 0
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">CMS - Gestão de Conteúdo</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/cms-example" target="_blank">
              <ExternalLink className="h-4 w-4 mr-2" />
              Preview Landing Page
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a 
              href="http://localhost:8000/admin/cms/" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Settings className="h-4 w-4 mr-2" />
              Admin Django
            </a>
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status da API</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cmsData ? (
                <Badge variant="default" className="bg-green-600">
                  ✓ Online
                </Badge>
              ) : (
                <Badge variant="destructive">
                  ✗ Offline
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {cmsData ? 'CMS funcionando normalmente' : 'Verifique o backend Django'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Atualização</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cmsData ? (
                new Date(cmsData.last_updated).toLocaleDateString('pt-AO')
              ) : (
                'N/A'
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {cmsData ? (
                new Date(cmsData.last_updated).toLocaleTimeString('pt-AO')
              ) : (
                'Dados não disponíveis'
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modo Manutenção</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cmsData?.settings?.maintenance_mode ? (
                <Badge variant="destructive">
                  Ativo
                </Badge>
              ) : (
                <Badge variant="default" className="bg-green-600">
                  Inativo
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Status do site para usuários
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Seções</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(stats).reduce((sum, value) => sum + value, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Conteúdos gerenciados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Sections */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        
        {/* Landing Page Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Configurações Gerais
            </CardTitle>
            <CardDescription>
              Informações básicas, contatos e redes sociais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {cmsData?.settings && (
              <div className="space-y-2 text-sm">
                <p><strong>Site:</strong> {cmsData.settings.site_title}</p>
                <p><strong>Email:</strong> {cmsData.settings.contact_email}</p>
                <p><strong>Telefone:</strong> {cmsData.settings.contact_phone}</p>
              </div>
            )}
            <Button asChild className="w-full">
              <Link href="/admin/cms/settings">
                <Edit className="h-4 w-4 mr-2" />
                Editar Configurações
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Hero Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Seção Hero
            </CardTitle>
            <CardDescription>
              Conteúdo principal da página inicial
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <div className="flex justify-between items-center">
                <span>Seções Hero:</span>
                <Badge variant="secondary">{stats.hero_sections}</Badge>
              </div>
              {cmsData?.hero && (
                <p className="text-muted-foreground mt-2">
                  {cmsData.hero.headline}
                </p>
              )}
            </div>
            <Button asChild className="w-full">
              <Link href="/admin/cms/hero">
                <Edit className="h-4 w-4 mr-2" />
                Gerenciar Hero
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Estatísticas
            </CardTitle>
            <CardDescription>
              Números mostrados na hero e outras seções
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <div className="flex justify-between items-center">
                <span>Stats ativas:</span>
                <Badge variant="secondary">{cmsData?.hero_stats?.length || 0}</Badge>
              </div>
              {cmsData?.hero_stats && cmsData.hero_stats.length > 0 && (
                <div className="grid grid-cols-2 gap-1 text-xs mt-2">
                  {cmsData.hero_stats.slice(0, 4).map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="font-bold text-violet-600">{stat.value}</div>
                      <div className="text-muted-foreground truncate">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button asChild className="w-full">
              <Link href="/admin/cms/stats">
                <Edit className="h-4 w-4 mr-2" />
                Gerenciar Stats
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Companies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Empresas Parceiras
            </CardTitle>
            <CardDescription>
              Logos e informações de clientes e parceiros
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <div className="flex justify-between items-center">
                <span>Total empresas:</span>
                <Badge variant="secondary">{stats.companies}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Na Hero:</span>
                <Badge variant="outline">{cmsData?.hero_companies?.length || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>No Ticker:</span>
                <Badge variant="outline">{cmsData?.ticker_companies?.length || 0}</Badge>
              </div>
            </div>
            <Button asChild className="w-full">
              <Link href="/admin/cms/companies">
                <Edit className="h-4 w-4 mr-2" />
                Gerenciar Empresas
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Serviços
            </CardTitle>
            <CardDescription>
              Cursos, English Practice Lab e IA Tutor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <div className="flex justify-between items-center">
                <span>Total serviços:</span>
                <Badge variant="secondary">{stats.services}</Badge>
              </div>
              {cmsData?.services && (
                <div className="text-xs text-muted-foreground">
                  {cmsData.services.slice(0, 2).map((service, index) => (
                    <div key={index} className="truncate">• {service.title}</div>
                  ))}
                  {cmsData.services.length > 2 && (
                    <div>... +{cmsData.services.length - 2} mais</div>
                  )}
                </div>
              )}
            </div>
            <Button asChild className="w-full">
              <Link href="/admin/cms/services">
                <Edit className="h-4 w-4 mr-2" />
                Gerenciar Serviços
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Planos de Preços
            </CardTitle>
            <CardDescription>
              Preços em AOA e ofertas especiais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <div className="flex justify-between items-center">
                <span>Planos ativos:</span>
                <Badge variant="secondary">{stats.pricing_tiers}</Badge>
              </div>
              {cmsData?.pricing_tiers && (
                <div className="text-xs text-muted-foreground">
                  {cmsData.pricing_tiers.slice(0, 2).map((tier, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="truncate">{tier.title}</span>
                      <span>{tier.formatted_monthly_price}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button asChild className="w-full">
              <Link href="/admin/cms/pricing">
                <Edit className="h-4 w-4 mr-2" />
                Gerenciar Preços
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Funcionalidades
            </CardTitle>
            <CardDescription>
              Recursos da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <div className="flex justify-between items-center">
                <span>Features ativas:</span>
                <Badge variant="secondary">{stats.features}</Badge>
              </div>
              {cmsData?.features && cmsData.features.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  {cmsData.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="truncate">• {feature.title}</div>
                  ))}
                </div>
              )}
            </div>
            <Button asChild className="w-full">
              <Link href="/admin/cms/features">
                <Edit className="h-4 w-4 mr-2" />
                Gerenciar Features
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Testimonials */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Depoimentos
            </CardTitle>
            <CardDescription>
              Testemunhos de clientes satisfeitos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <div className="flex justify-between items-center">
                <span>Total depoimentos:</span>
                <Badge variant="secondary">{stats.testimonials}</Badge>
              </div>
              {cmsData?.testimonials && cmsData.testimonials.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  {cmsData.testimonials.slice(0, 2).map((testimonial, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="truncate">{testimonial.name}</span>
                      <span>⭐ {testimonial.rating}/5</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button asChild className="w-full">
              <Link href="/admin/cms/testimonials">
                <Edit className="h-4 w-4 mr-2" />
                Gerenciar Depoimentos
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* FAQs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Perguntas Frequentes
            </CardTitle>
            <CardDescription>
              Dúvidas comuns dos clientes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <div className="flex justify-between items-center">
                <span>FAQs ativas:</span>
                <Badge variant="secondary">{stats.faqs}</Badge>
              </div>
              {cmsData?.faqs && cmsData.faqs.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  {cmsData.faqs.slice(0, 2).map((faq, index) => (
                    <div key={index} className="truncate">
                      • {faq.question}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button asChild className="w-full">
              <Link href="/admin/cms/faqs">
                <Edit className="h-4 w-4 mr-2" />
                Gerenciar FAQs
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* CTAs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Call to Actions
            </CardTitle>
            <CardDescription>
              Chamadas para ação na página
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <div className="flex justify-between items-center">
                <span>CTAs ativas:</span>
                <Badge variant="secondary">{stats.ctas}</Badge>
              </div>
              {cmsData?.ctas && cmsData.ctas.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  {cmsData.ctas.slice(0, 2).map((cta, index) => (
                    <div key={index} className="truncate">
                      • {cta.title} ({cta.section})
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button asChild className="w-full">
              <Link href="/admin/cms/ctas">
                <Edit className="h-4 w-4 mr-2" />
                Gerenciar CTAs
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* SEO */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Configurações SEO
            </CardTitle>
            <CardDescription>
              Meta tags e otimização para buscadores
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {cmsData?.seo && (
              <div className="text-sm space-y-1">
                <div className="truncate">
                  <strong>Title:</strong> {cmsData.seo.meta_title}
                </div>
                <div className="truncate text-muted-foreground">
                  {cmsData.seo.meta_description}
                </div>
              </div>
            )}
            <Button asChild className="w-full">
              <Link href="/admin/cms/seo">
                <Edit className="h-4 w-4 mr-2" />
                Gerenciar SEO
              </Link>
            </Button>
          </CardContent>
        </Card>

      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Ações Rápidas
          </CardTitle>
          <CardDescription>
            Ferramentas úteis para gerenciar o CMS
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" asChild>
              <a 
                href="http://localhost:8000/api/v1/cms/landing-page-data/" 
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileText className="h-4 w-4 mr-2" />
                Ver JSON da API
              </a>
            </Button>
            
            <Button variant="outline" asChild>
              <a 
                href="http://localhost:8000/api/v1/cms/health/" 
                target="_blank"
                rel="noopener noreferrer"
              >
                <Activity className="h-4 w-4 mr-2" />
                Health Check
              </a>
            </Button>
            
            <Button variant="outline" asChild>
              <a 
                href="http://localhost:8000/api/v1/cms/stats-summary/" 
                target="_blank"
                rel="noopener noreferrer"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Estatísticas API
              </a>
            </Button>
            
            <Button variant="outline" asChild>
              <a 
                href="http://localhost:8000/admin/" 
                target="_blank"
                rel="noopener noreferrer"
              >
                <Settings className="h-4 w-4 mr-2" />
                Admin Principal
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}