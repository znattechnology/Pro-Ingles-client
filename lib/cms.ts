// CMS API integration for ProEnglish Landing Page
const CMS_API_BASE = process.env.NEXT_PUBLIC_CMS_API_URL || 'http://localhost:8000/api/v1/cms';

export interface CMSLandingPageData {
  settings: {
    site_title: string;
    site_description: string;
    meta_keywords: string;
    contact_email: string;
    contact_phone: string;
    whatsapp_number: string;
    facebook_url: string;
    instagram_url: string;
    linkedin_url: string;
    youtube_url: string;
    is_active: boolean;
    maintenance_mode: boolean;
    maintenance_message: string;
  };
  hero: {
    badge_text: string;
    badge_is_active: boolean;
    headline: string;
    headline_highlight: string;
    description: string;
    primary_cta_text: string;
    primary_cta_url: string;
    secondary_cta_text: string;
    secondary_cta_url: string;
    social_proof_text: string;
    rating_value: string;
    rating_count: string;
    hero_image: string | null;
    background_video: string | null;
    is_active: boolean;
  };
  hero_stats: Array<{
    value: string;
    label: string;
    icon: string;
    section: string;
    is_active: boolean;
  }>;
  hero_companies: Array<{
    name: string;
    logo_url: string | null;
    category: string;
    website_url: string;
  }>;
  ticker_companies: Array<{
    name: string;
    logo_url: string | null;
    category: string;
    website_url: string;
  }>;
  services: Array<{
    title: string;
    subtitle: string;
    description: string;
    icon: string;
    service_type: 'course' | 'practice_lab' | 'ai_tutor' | 'other';
    student_count: string;
    level: string;
    duration: string;
    certification: string;
    service_image_url: string | null;
    gradient_from: string;
    gradient_to: string;
    features: string[];
    curriculum_topics: string[];
    target_companies: Array<{
      name: string;
      logo_url: string | null;
    }>;
  }>;
  pricing_tiers: Array<{
    title: string;
    subtitle: string;
    icon: string;
    monthly_price: string;
    yearly_price: string;
    formatted_monthly_price: string;
    formatted_yearly_price: string;
    currency: string;
    yearly_discount_text: string;
    promotional_badge: string;
    description: string;
    angola_benefit: string;
    features: string[];
    button_text: string;
    button_url: string;
    is_popular: boolean;
    is_inverse_design: boolean;
    gradient_from: string;
    gradient_to: string;
  }>;
  features: Array<{
    title: string;
    description: string;
    icon: string;
    gradient_from: string;
    gradient_to: string;
    background_image_url: string | null;
    benefits: string[];
    use_cases: string[];
    grid_column_span: number;
    is_highlighted: boolean;
  }>;
  testimonials: Array<{
    name: string;
    title: string;
    company_name: string;
    location: string;
    avatar_url: string | null;
    text: string;
    result_achieved: string;
    rating: number;
    sector: string;
    date_given: string;
    verified: boolean;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
    category: string;
    keywords: string;
  }>;
  ctas: Array<{
    title: string;
    subtitle: string;
    description: string;
    primary_button_text: string;
    primary_button_url: string;
    secondary_button_text: string;
    secondary_button_url: string;
    icon: string;
    background_image_url: string | null;
    gradient_from: string;
    gradient_to: string;
    section: string;
  }>;
  seo: {
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
    canonical_url: string;
    og_title: string;
    og_description: string;
    og_image_url: string | null;
    og_type: string;
    twitter_card: string;
    twitter_title: string;
    twitter_description: string;
    twitter_image_url: string | null;
    schema_markup: any;
    index_page: boolean;
    follow_links: boolean;
  };
  last_updated: string;
}

/**
 * Fetch all landing page data from CMS
 */
export async function fetchLandingPageData(): Promise<CMSLandingPageData | null> {
  try {
    const response = await fetch(`${CMS_API_BASE}/landing-page-data/`, {
      next: { 
        revalidate: 900 // Revalidate every 15 minutes
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch CMS data:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching CMS data:', error);
    return null;
  }
}

/**
 * Fetch specific section data from CMS
 */
export async function fetchCMSSection(section: string) {
  try {
    const response = await fetch(`${CMS_API_BASE}/${section}/`, {
      next: { 
        revalidate: 600 // Revalidate every 10 minutes
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${section} data`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching ${section} data:`, error);
    return null;
  }
}

/**
 * Get hero companies for display
 */
export function getHeroCompanies(cmsData: CMSLandingPageData | null) {
  if (!cmsData) return ["Sonangol", "BAI", "Unitel", "BFA"]; // Fallback
  
  return cmsData.hero_companies
    .filter(company => company.name)
    .map(company => company.name);
}

/**
 * Get hero stats for display
 */
export function getHeroStats(cmsData: CMSLandingPageData | null) {
  if (!cmsData) {
    return [
      { value: "10K+", label: "Angolanos aprendendo" },
      { value: "94%", label: "Taxa de sucesso" },
      { value: "50+", label: "Cursos especializados" }
    ]; // Fallback
  }
  
  return cmsData.hero_stats.map(stat => ({
    value: stat.value,
    label: stat.label
  }));
}

/**
 * Transform CMS services to exploreWorlds format for compatibility
 */
export function transformServicesToExploreWorlds(cmsData: CMSLandingPageData | null) {
  if (!cmsData || !cmsData.services) {
    // Return fallback data if CMS is unavailable
    return [
      {
        id: 'world-1',
        imgUrl: '/service-2.jpg',
        title: 'Inglês para Petróleo & Gás',
        description: 'Especializado para Sonangol, Total Angola e Chevron. Aprenda terminologia técnica, protocolos de segurança e comunicação internacional específica do setor energético angolano.',
        icon: '🛢️',
        companies: ['Sonangol', 'Total Angola', 'Chevron'],
        students: '2.5K+',
        level: 'Técnico-Professional',
        duration: '3-6 meses',
        certification: 'Certificado Internacional'
      }
      // ... other fallback services
    ];
  }

  return cmsData.services.map((service, index) => ({
    id: `world-${index + 1}`,
    imgUrl: service.service_image_url || `/service-${index + 2}.jpg`,
    title: service.title,
    description: service.description,
    icon: service.icon,
    companies: service.target_companies.map(company => company.name),
    students: service.student_count,
    level: service.level,
    duration: service.duration,
    certification: service.certification
  }));
}

/**
 * Transform CMS pricing to components format
 */
export function transformPricingTiers(cmsData: CMSLandingPageData | null) {
  if (!cmsData || !cmsData.pricing_tiers) {
    // Return fallback pricing data
    return [
      {
        title: "Básico",
        subtitle: "Para começar",
        monthlyPrice: 0,
        yearlyPrice: 0,
        buttonText: "Começar Grátis",
        popular: false,
        inverse: false,
        icon: "🚀",
        features: [
          "3 lições por dia",
          "5 min de Speaking com IA",
          "Progresso básico"
        ]
      }
      // ... other fallback tiers
    ];
  }

  return cmsData.pricing_tiers.map(tier => ({
    title: tier.title,
    subtitle: tier.subtitle,
    monthlyPrice: parseFloat(tier.monthly_price),
    yearlyPrice: parseFloat(tier.yearly_price),
    discount: tier.yearly_discount_text,
    buttonText: tier.button_text,
    popular: tier.is_popular,
    inverse: tier.is_inverse_design,
    icon: tier.icon,
    badge: tier.promotional_badge || null,
    features: tier.features,
    angolaBenefit: tier.angola_benefit,
    testimonial: `Cliente ${tier.title}!` // Could be enhanced with real testimonials
  }));
}

/**
 * Get maintenance mode status
 */
export function isMaintenanceMode(cmsData: CMSLandingPageData | null): boolean {
  return cmsData?.settings?.maintenance_mode || false;
}

/**
 * Get maintenance message
 */
export function getMaintenanceMessage(cmsData: CMSLandingPageData | null): string {
  return cmsData?.settings?.maintenance_message || 'Site em manutenção. Voltamos em breve!';
}

/**
 * Filter services by type
 */
export function getServicesByType(cmsData: CMSLandingPageData | null, serviceType: 'course' | 'practice_lab' | 'ai_tutor' | 'other') {
  if (!cmsData || !cmsData.services) return [];
  
  return cmsData.services.filter(service => service.service_type === serviceType);
}

/**
 * Get Practice Lab specific data
 */
export function getPracticeLabData(cmsData: CMSLandingPageData | null) {
  const practiceLabServices = getServicesByType(cmsData, 'practice_lab');
  
  if (practiceLabServices.length === 0) {
    // Fallback Practice Lab data
    return {
      title: "Practice Lab Inteligente",
      description: "O laboratório de prática mais avançado de Angola. Exercícios adaptativos com IA que se ajustam ao seu progresso e necessidades profissionais específicas.",
      icon: "⚡",
      student_count: "2.8K+",
      features: [
        "Speaking Challenge com IA",
        "Listening Lab com áudios reais", 
        "Writing Workshop profissional",
        "Cenários interativos de trabalho",
        "Gamificação e conquistas",
        "Analytics avançado de progresso"
      ]
    };
  }
  
  return practiceLabServices[0]; // Return first Practice Lab service
}

/**
 * Get IA Tutor specific data
 */
export function getIATutorData(cmsData: CMSLandingPageData | null) {
  const aiTutorServices = getServicesByType(cmsData, 'ai_tutor');
  
  if (aiTutorServices.length === 0) {
    // Fallback IA Tutor data
    return {
      title: "IA Personal Tutor",
      description: "Nossa tecnologia exclusiva! Correção de pronunciação em tempo real, feedback personalizado para sotaque angolano e aprendizado adaptativo com inteligência artificial.",
      icon: "🤖",
      student_count: "3.2K+",
      features: [
        "Correção de pronunciação em tempo real",
        "Feedback personalizado para Angola",
        "Aprendizado adaptativo",
        "IA conversacional",
        "Análise de progresso avançada"
      ]
    };
  }
  
  return aiTutorServices[0]; // Return first IA Tutor service
}

/**
 * Generate structured data for SEO
 */
export function generateStructuredData(cmsData: CMSLandingPageData | null) {
  if (!cmsData) return null;

  const { settings, seo } = cmsData;

  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": settings.site_title,
    "description": settings.site_description,
    "url": process.env.NEXT_PUBLIC_SITE_URL || "https://proenglish.ao",
    "logo": `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": settings.contact_phone,
      "contactType": "customer service",
      "email": settings.contact_email
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "AO",
      "addressLocality": "Luanda"
    },
    "sameAs": [
      settings.facebook_url,
      settings.instagram_url,
      settings.linkedin_url,
      settings.youtube_url
    ].filter(Boolean),
    "offers": cmsData.pricing_tiers.map(tier => ({
      "@type": "Offer",
      "name": tier.title,
      "description": tier.subtitle,
      "price": tier.monthly_price,
      "priceCurrency": tier.currency,
      "category": "Educational Course"
    }))
  };
}