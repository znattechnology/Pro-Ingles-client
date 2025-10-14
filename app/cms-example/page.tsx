import { fetchLandingPageData, transformServicesToExploreWorlds, transformPricingTiers } from '@/lib/cms';
import { CMSLandingPageData } from '@/lib/cms';

// Example component showing how to use CMS data
export default async function CMSExamplePage() {
  // Fetch CMS data at build time / request time
  const cmsData: CMSLandingPageData | null = await fetchLandingPageData();
  
  // Transform data for existing components
  const exploreWorlds = transformServicesToExploreWorlds(cmsData);
  const pricingTiers = transformPricingTiers(cmsData);

  if (!cmsData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">CMS não disponível</h1>
          <p>Usando dados fallback da landing page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-4">
            {cmsData.settings.site_title} - CMS Demo
          </h1>
          <p className="text-xl text-gray-300">
            {cmsData.settings.site_description}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Última atualização: {new Date(cmsData.last_updated).toLocaleString('pt-AO')}
          </p>
        </header>

        {/* Hero Section Preview */}
        <section className="mb-12 p-6 bg-violet-900/20 rounded-lg border border-violet-500/30">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            🎯 Hero Section
            {cmsData.hero.badge_is_active && (
              <span className="text-sm bg-violet-600 px-3 py-1 rounded-full">
                Badge Ativo
              </span>
            )}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Conteúdo Principal</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Badge:</strong> {cmsData.hero.badge_text}</p>
                <p><strong>Headline:</strong> {cmsData.hero.headline}</p>
                <p><strong>Highlight:</strong> {cmsData.hero.headline_highlight}</p>
                <p><strong>Descrição:</strong> {cmsData.hero.description}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">CTAs e Social Proof</h3>
              <div className="space-y-2 text-sm">
                <p><strong>CTA Primário:</strong> {cmsData.hero.primary_cta_text}</p>
                <p><strong>CTA Secundário:</strong> {cmsData.hero.secondary_cta_text}</p>
                <p><strong>Social Proof:</strong> {cmsData.hero.social_proof_text}</p>
                <p><strong>Rating:</strong> {cmsData.hero.rating_value}/5 ({cmsData.hero.rating_count})</p>
              </div>
            </div>
          </div>

          {/* Hero Stats */}
          <div className="mt-4">
            <h3 className="text-xl font-semibold mb-2">Estatísticas</h3>
            <div className="flex gap-6">
              {cmsData.hero_stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-violet-400">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Preview */}
        <section className="mb-12 p-6 bg-purple-900/20 rounded-lg border border-purple-500/30">
          <h2 className="text-2xl font-bold mb-4">🛠️ Serviços ({cmsData.services.length})</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cmsData.services.slice(0, 6).map((service, index) => (
              <div key={index} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{service.icon}</span>
                  <h3 className="font-semibold">{service.title}</h3>
                </div>
                <p className="text-sm text-gray-300 mb-2">
                  {service.description.substring(0, 100)}...
                </p>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{service.student_count} estudantes</span>
                  <span>{service.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Preview */}
        <section className="mb-12 p-6 bg-green-900/20 rounded-lg border border-green-500/30">
          <h2 className="text-2xl font-bold mb-4">💰 Planos de Preços ({cmsData.pricing_tiers.length})</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {cmsData.pricing_tiers.map((tier, index) => (
              <div 
                key={index} 
                className={`p-6 rounded-lg border ${
                  tier.is_popular 
                    ? 'bg-violet-900/30 border-violet-500' 
                    : 'bg-gray-800/50 border-gray-700/50'
                }`}
              >
                <div className="text-center mb-4">
                  <span className="text-3xl">{tier.icon}</span>
                  <h3 className="text-xl font-bold mt-2">{tier.title}</h3>
                  <p className="text-gray-400">{tier.subtitle}</p>
                  {tier.is_popular && (
                    <span className="inline-block mt-2 px-3 py-1 bg-violet-600 text-white text-xs rounded-full">
                      {tier.promotional_badge}
                    </span>
                  )}
                </div>
                
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold">
                    {tier.formatted_monthly_price}
                    {tier.monthly_price !== "0.00" && <span className="text-sm text-gray-400">/mês</span>}
                  </div>
                  {tier.yearly_discount_text && (
                    <p className="text-sm text-green-400 mt-1">{tier.yearly_discount_text}</p>
                  )}
                </div>

                <div className="mb-4 p-3 bg-violet-900/20 rounded text-center">
                  <p className="text-sm text-violet-300">{tier.angola_benefit}</p>
                </div>

                <ul className="space-y-1 text-sm mb-6">
                  {tier.features.slice(0, 5).map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      {feature}
                    </li>
                  ))}
                  {tier.features.length > 5 && (
                    <li className="text-gray-400 text-xs">
                      +{tier.features.length - 5} mais features...
                    </li>
                  )}
                </ul>

                <button 
                  className={`w-full py-3 rounded font-semibold ${
                    tier.is_inverse_design
                      ? 'bg-white text-black hover:bg-gray-100'
                      : 'bg-violet-600 text-white hover:bg-violet-700'
                  }`}
                >
                  {tier.button_text}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Companies Preview */}
        <section className="mb-12 p-6 bg-blue-900/20 rounded-lg border border-blue-500/30">
          <h2 className="text-2xl font-bold mb-4">🏢 Empresas Parceiras</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Mostrar na Hero ({cmsData.hero_companies.length})</h3>
              <div className="flex flex-wrap gap-2">
                {cmsData.hero_companies.map((company, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 bg-violet-600 text-white text-sm rounded-full"
                  >
                    {company.name}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Ticker ({cmsData.ticker_companies.length})</h3>
              <div className="flex flex-wrap gap-2">
                {cmsData.ticker_companies.slice(0, 8).map((company, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded-full"
                  >
                    {company.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SEO Preview */}
        <section className="mb-12 p-6 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
          <h2 className="text-2xl font-bold mb-4">🔍 Configurações SEO</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Meta Tags</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Title:</strong> {cmsData.seo.meta_title}</p>
                <p><strong>Description:</strong> {cmsData.seo.meta_description}</p>
                <p><strong>Keywords:</strong> {cmsData.seo.meta_keywords}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Open Graph</h3>
              <div className="space-y-2 text-sm">
                <p><strong>OG Title:</strong> {cmsData.seo.og_title}</p>
                <p><strong>OG Description:</strong> {cmsData.seo.og_description}</p>
                <p><strong>Twitter Title:</strong> {cmsData.seo.twitter_title}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="p-6 bg-red-900/20 rounded-lg border border-red-500/30">
          <h2 className="text-2xl font-bold mb-4">📞 Informações de Contato</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Contatos</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> {cmsData.settings.contact_email}</p>
                <p><strong>Telefone:</strong> {cmsData.settings.contact_phone}</p>
                <p><strong>WhatsApp:</strong> {cmsData.settings.whatsapp_number}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Redes Sociais</h3>
              <div className="space-y-2 text-sm">
                {cmsData.settings.facebook_url && <p>Facebook: ✓</p>}
                {cmsData.settings.instagram_url && <p>Instagram: ✓</p>}
                {cmsData.settings.linkedin_url && <p>LinkedIn: ✓</p>}
                {cmsData.settings.youtube_url && <p>YouTube: ✓</p>}
                {!cmsData.settings.facebook_url && !cmsData.settings.instagram_url && 
                 !cmsData.settings.linkedin_url && !cmsData.settings.youtube_url && (
                  <p className="text-gray-500">Nenhuma rede social configurada</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Admin Link */}
        <div className="mt-8 text-center">
          <a 
            href="http://localhost:8000/admin/cms/" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all duration-200"
          >
            🔧 Acessar Admin CMS
          </a>
        </div>

      </div>
    </div>
  );
}