
import { LayoutDashboard, Users, BookOpen, UserCog, MessageSquare, DollarSign, Settings2, BarChart2, Package, Bus } from 'lucide-react';


export const sidebarLinks = [
  {
    title: "Home",
    url: "/dashboard",
    icon: LayoutDashboard,
    isActive: true,
    items: [
      {
        title: "Visão Geral",
        url: "/dashboard",
      },
    ],
  },
  {
    title: "Usuários",
    url: "/dashboard/users",
    icon: Users,
    items: [
      { title: "Usuários", url: "/dashboard/users/users" },
      { title: "Faturas", url: "/dashboard/users/faturas" },
      { title: "Equipa", url: "/dashboard/users/team" },
    ],
  },
  {
    title: "Cursos",
    url: "/dashboard/content",
    icon: BookOpen,
    items: [
      { title: "Criar curso", url: "/dashboard/content/create-course" },
      { title: "Cursos", url: "/dashboard/content/courses" },
    ],
  },
  {
    title: "Live",
    url: "/dashboard/live",
    icon: MessageSquare, // Escolha um ícone apropriado
    items: [
      { title: "Live", url: "/dashboard/live/live" },
      { title: "Próximas Live", url: "/dashboard/live/upcoming-live" },
      { title: "Live Pessoal", url: "/dashboard/live/personal-live" },
      { title: "Gravadas", url: "/dashboard/live/recordings" },
      { title: "Passadas", url: "/dashboard/live/previous-live" },
    ],
  },
  {
    title: "Analítica",
    url: "/dashboard/analitycs",
    icon: BarChart2,
    items: [
      { title: "Cursos", url: "/dashboard/analityc/course-analitcs" },
      { title: "Usuários", url: "/dashboard/analityc/users-analitcs" },
      { title: "Compras", url: "/dashboard/analityc/orders-analitcs" },
    ],
  },
  {
    title: "Configurações",
    url: "/dashboard/manage",
    icon: Settings2,
    items: [
      { title: "Banner", url: "/dashboard/manage/banner" },
      { title: "Faq", url: "/dashboard/manage/faq" },
      { title: "Categorias", url: "/dashboard/manage/categories" },
    ],
  },
  {
    title: "Ajuda",
    url: "/dashboard/help",
    icon: Package, // Escolha um ícone apropriado
    items: [],
  },
];


export const exploreWorlds = [
  {
    id: 'world-1',
    imgUrl: '/service-2.jpg',
    title: 'Inglês Geral',
    description: 'Desenvolva habilidades essenciais de leitura, escrita, audição e fala, do básico ao avançado.'
  },
  {
    id: 'world-2',
    imgUrl: '/service-3.jpg',
    title: 'Inglês para Negócios',
    description: 'Aprenda a se comunicar com confiança em ambientes corporativos e negociações internacionais.'
  },
  {
    id: 'world-3',
    imgUrl: '/service-4.jpg',
    title: 'Inglês para Tecnologia',
    description: 'Domine o vocabulário técnico e a fluência necessária para o setor de TI e inovação.'
  },
  {
    id: 'world-4',
    imgUrl: '/service-5.jpg',
    title: 'Inglês para o Setor Bancário',
    description: 'Especialize-se em terminologias financeiras e comunicações claras no setor bancário global.'
  },
  {
    id: 'world-5',
    imgUrl: '/service-6.jpg',
    title: 'Inglês para o Setor Petrolífero',
    description: 'Aprenda inglês técnico para operações, segurança e comunicação no setor de petróleo e gás.'
  },
];


export const startingFeatures = [
  'Find a world that suits you and you want to enter',
  'Enter the world by reading basmalah to be safe',
  'No need to beat around the bush, just stay on the gas and have fun',
];

export const newFeatures = [
  {
    imgUrl: '/vrpano.svg',
    title: 'A new world',
    subtitle:
        'we have the latest update with new world for you to try never mind',
  },
  {
    imgUrl: '/headset.svg',
    title: 'More realistic',
    subtitle:
        'In the latest update, your eyes are narrow, making the world more realistic than ever',
  },
];

export const insights = [
  {
    imgUrl: '/planet-06.png',
    title: 'The launch of the Metaverse makes Elon musk ketar-ketir',
    subtitle:
        'Magna etiam tempor orci eu lobortis elementum nibh tellus molestie. Diam maecenas sed enim ut sem viverra alique.',
  },
  {
    imgUrl: '/planet-07.png',
    title: '7 tips to easily master the madness of the Metaverse',
    subtitle:
        'Vitae congue eu consequat ac felis donec. Et magnis dis parturient montes nascetur ridiculus mus. Convallis tellus id interdum',
  },
  {
    imgUrl: '/planet-08.png',
    title: 'With one platform you can explore the whole world virtually',
    subtitle:
        'Quam quisque id diam vel quam elementum. Viverra nam libero justo laoreet sit amet cursus sit. Mauris in aliquam sem',
  },
];

export const socials = [
  {
    name: 'twitter',
    url: '/twitter.svg',
  },
  {
    name: 'linkedin',
    url: '/linkedin.svg',
  },
  {
    name: 'instagram',
    url: '/instagram.svg',
  },
  {
    name: 'facebook',
    url: '/facebook.svg',
  },
];

export const navigation = [
  {
    id: "0",
    title: "Features",
    url: "#features",
  },
  {
    id: "1",
    title: "Pricing",
    url: "#pricing",
  },
  {
    id: "2",
    title: "How to use",
    url: "#how-to-use",
  },
  {
    id: "3",
    title: "Roadmap",
    url: "#roadmap",
  },
  {
    id: "4",
    title: "New account",
    url: "#signup",
    onlyMobile: true,
  },
  {
    id: "5",
    title: "Sign in",
    url: "#login",
    onlyMobile: true,
  },
];
