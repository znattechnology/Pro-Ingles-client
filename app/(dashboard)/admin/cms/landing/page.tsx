import { fetchLandingPageData } from '@/lib/cms'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Globe, 
  Star, 
  Building, 
  DollarSign,
  Users,
  MessageSquare,
  Megaphone,
  Search,
  ExternalLink,
  Edit,
  Eye,
  RefreshCw
} from "lucide-react"
import Link from 'next/link'
import Image from 'next/image'

export default async function CMSLandingPage() {
  const cmsData = await fetchLandingPageData()

  if (!cmsData) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">CMS API não disponível</h2>
          <p className="text-muted-foreground mb-4">
            Verifique se o backend Django está rodando em localhost:8000
          </p>
          <Button asChild>
            <a href="http://localhost:8000/admin/cms/" target="_blank">
              Acessar Admin Django
            </a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-4 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Landing Page - Visualização Completa</h2>
          <p className="text-muted-foreground">
            Preview completo de todos os conteúdos da landing page
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/cms-example" target="_blank">
              <Eye className="h-4 w-4 mr-2" />
              Preview Completo
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/admin/cms">
              <RefreshCw className="h-4 w-4 mr-2" />
              Voltar ao CMS
            </Link>
          </Button>
        </div>
      </div>

      {/* Status and Info */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Última Atualização</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {new Date(cmsData.last_updated).toLocaleDateString('pt-AO')}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(cmsData.last_updated).toLocaleTimeString('pt-AO')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Modo Manutenção</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {cmsData.settings.maintenance_mode ? (
                <Badge variant="destructive">Ativo</Badge>
              ) : (
                <Badge variant="default" className="bg-green-600">Inativo</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Status atual do site
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Seções</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {[
                cmsData.services?.length || 0,
                cmsData.pricing_tiers?.length || 0,
                cmsData.features?.length || 0,
                cmsData.testimonials?.length || 0,
                cmsData.faqs?.length || 0,
                cmsData.ctas?.length || 0
              ].reduce((sum, value) => sum + value, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Conteúdos ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Empresas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {(cmsData.hero_companies?.length || 0) + (cmsData.ticker_companies?.length || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Parceiros cadastrados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Hero Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Seção Hero
              </CardTitle>
              <CardDescription>
                Conteúdo principal da página inicial
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="http://localhost:8000/admin/cms/herosection/" target="_blank">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {cmsData.hero.badge_is_active && (
            <div>
              <Badge variant="secondary" className="mb-2">Badge Ativo</Badge>
              <p className="text-sm bg-violet-100 dark:bg-violet-900/20 p-2 rounded">
                {cmsData.hero.badge_text}
              </p>
            </div>
          )}
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Headlines</h3>
              <div className="space-y-2">
                <p className="text-lg font-semibold">{cmsData.hero.headline}</p>
                <p className="text-md text-violet-600 font-medium">{cmsData.hero.headline_highlight}</p>
                <p className="text-sm text-muted-foreground">{cmsData.hero.description}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Botões CTA</h3>
              <div className="space-y-2">
                <Button className="w-full" size="sm">
                  {cmsData.hero.primary_cta_text}
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  {cmsData.hero.secondary_cta_text}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Social Proof</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm">{cmsData.hero.social_proof_text}</span>
                <Badge variant="outline">
                  ⭐ {cmsData.hero.rating_value}/5 ({cmsData.hero.rating_count})
                </Badge>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Estatísticas</h3>
              <div className="flex gap-4">
                {cmsData.hero_stats.slice(0, 3).map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="font-bold text-violet-600">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Companies */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Empresas Parceiras
              </CardTitle>
              <CardDescription>
                Logos exibidos na hero e ticker
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="http://localhost:8000/admin/cms/company/" target="_blank">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Empresas na Hero ({cmsData.hero_companies.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {cmsData.hero_companies.map((company, index) => (
                <div key={index} className="p-2 border rounded text-center">
                  <span className="text-sm font-medium">{company.name}</span>
                  <br />
                  <Badge variant="outline" className="text-xs mt-1">
                    {company.category}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="font-semibold mb-2">Empresas no Ticker ({cmsData.ticker_companies.length})</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {cmsData.ticker_companies.slice(0, 12).map((company, index) => (
                <div key={index} className="p-1 border rounded text-center">
                  <span className="text-xs">{company.name}</span>
                </div>
              ))}
              {cmsData.ticker_companies.length > 12 && (
                <div className="p-1 border rounded text-center text-muted-foreground">
                  <span className="text-xs">+{cmsData.ticker_companies.length - 12} mais</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Serviços ({cmsData.services.length})
              </CardTitle>
              <CardDescription>
                Cursos especializados e serviços oferecidos
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="http://localhost:8000/admin/cms/serviceitem/" target="_blank">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cmsData.services.slice(0, 6).map((service, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{service.icon}</span>
                  <div>
                    <h3 className="font-semibold text-sm">{service.title}</h3>
                    <Badge variant="outline" className="text-xs">
                      {service.service_type}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {service.description.substring(0, 80)}...
                </p>
                <div className="flex justify-between text-xs">
                  <span>{service.student_count}</span>
                  <span>{service.duration}</span>
                </div>
              </div>
            ))}
            {cmsData.services.length > 6 && (
              <div className="p-4 border rounded-lg border-dashed flex items-center justify-center text-muted-foreground">
                <span className="text-sm">+{cmsData.services.length - 6} mais serviços</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Planos de Preços ({cmsData.pricing_tiers.length})
              </CardTitle>
              <CardDescription>
                Preços em AOA adaptados para Angola
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="http://localhost:8000/admin/cms/pricingtier/" target="_blank">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {cmsData.pricing_tiers.map((tier, index) => (
              <div 
                key={index}
                className={`p-4 border rounded-lg ${
                  tier.is_popular ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/10' : ''
                }`}
              >
                <div className="text-center mb-3">
                  <span className="text-2xl">{tier.icon}</span>
                  <h3 className="font-bold">{tier.title}</h3>
                  <p className="text-sm text-muted-foreground">{tier.subtitle}</p>
                  {tier.is_popular && (
                    <Badge className="mt-1">
                      {tier.promotional_badge || 'Popular'}
                    </Badge>
                  )}
                </div>
                
                <div className="text-center mb-3">
                  <div className="text-xl font-bold">
                    {tier.formatted_monthly_price}
                    {tier.monthly_price !== "0.00" && (
                      <span className="text-sm text-muted-foreground">/mês</span>
                    )}
                  </div>
                  {tier.yearly_discount_text && (
                    <p className="text-sm text-green-600 mt-1">{tier.yearly_discount_text}</p>
                  )}
                </div>

                {tier.angola_benefit && (
                  <div className="bg-violet-100 dark:bg-violet-900/20 p-2 rounded text-center mb-3">
                    <p className="text-xs text-violet-700 dark:text-violet-300">
                      {tier.angola_benefit}
                    </p>
                  </div>
                )}

                <ul className="text-sm space-y-1 mb-3">
                  {tier.features.slice(0, 3).map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span className="text-xs">{feature}</span>
                    </li>
                  ))}
                  {tier.features.length > 3 && (
                    <li className="text-xs text-muted-foreground">
                      +{tier.features.length - 3} mais features
                    </li>
                  )}
                </ul>

                <Button 
                  size="sm" 
                  className="w-full"
                  variant={tier.is_inverse_design ? "outline" : "default"}
                >
                  {tier.button_text}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bottom Row - Testimonials, FAQs, CTAs */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Testimonials */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Depoimentos ({cmsData.testimonials.length})
                </CardTitle>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="http://localhost:8000/admin/cms/testimonial/" target="_blank">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </a>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cmsData.testimonials.slice(0, 3).map((testimonial, index) => (
                <div key={index} className="p-3 border rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{testimonial.name}</span>
                    <Badge variant="outline" className="text-xs">
                      ⭐ {testimonial.rating}/5
                    </Badge>
                    {testimonial.verified && (
                      <Badge variant="default" className="text-xs">Verificado</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {testimonial.title} - {testimonial.company_name}
                  </p>
                  <p className="text-xs">
                    "{testimonial.text.substring(0, 100)}..."
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* FAQs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  FAQs ({cmsData.faqs.length})
                </CardTitle>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="http://localhost:8000/admin/cms/faqitem/" target="_blank">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </a>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cmsData.faqs.slice(0, 4).map((faq, index) => (
                <div key={index} className="p-3 border rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {faq.category}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium mb-1">
                    {faq.question.length > 60 ? faq.question.substring(0, 60) + '...' : faq.question}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {faq.answer.substring(0, 80)}...
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Links Úteis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-4">
            <Button variant="outline" size="sm" asChild>
              <a href="http://localhost:8000/api/v1/cms/landing-page-data/" target="_blank">
                Ver JSON Completo
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="http://localhost:8000/admin/cms/" target="_blank">
                Admin Django
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/cms-example" target="_blank">
                Preview Landing Page
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="http://localhost:8000/api/v1/cms/health/" target="_blank">
                Health Check
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}