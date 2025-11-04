"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {

  DollarSign,
  Bell,
  Menu,
  Users,
  BookOpen,
  FileText,
  GraduationCap,
  MessageSquare,
  ClipboardList,
  Bus,
  BarChart2,
  CalendarDays,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import Logo from "./logo";

const features = [
    {
      icon: Users,
      title: "Gestão de Alunos",
      description:
        "Sistema abrangente de informações de alunos para gerenciar matrículas, perfis e registros acadêmicos com facilidade",
      href: "/recursos/gestao-alunos",
    },
    {
      icon: GraduationCap,
      title: "Gestão Acadêmica",
      description:
        "Simplifique o planejamento curricular, exames, notas e geração de boletins em um sistema unificado",
      href: "/recursos/gestao-academica",
    },
    {
      icon: MessageSquare,
      title: "Hub de Comunicação",
      description:
        "Sistema de mensagens integrado com notificações multicanais para comunicação escolar eficiente",
      href: "/recursos/comunicacao",
    },
    {
      icon: DollarSign,
      title: "Gestão Financeira",
      description:
        "Sistema completo de gestão de taxas com pagamentos online, faturamento e relatórios financeiros abrangentes",
      href: "/recursos/financeiro",
    },
    {
      icon: ClipboardList,
      title: "Gestão de Funcionários",
      description:
        "Ferramentas eficientes para gerenciar registros de funcionários, frequência, avaliação de desempenho e processamento de folha de pagamento",
      href: "/recursos/gestao-funcionarios",
    },
    {
      icon: Bus,
      title: "Gestão de Transporte",
      description:
        "Rastreamento de transporte em tempo real, gerenciamento de rotas e notificações automáticas para transporte seguro de alunos",
      href: "/recursos/transporte",
    },
    {
      icon: BarChart2,
      title: "Análise e Relatórios",
      description:
        "Ferramentas de análise poderosas para decisões baseadas em dados, com relatórios e insights personalizáveis",
      href: "/recursos/analises",
    },
    {
      icon: BookOpen,
      title: "Gestão de Recursos",
      description:
        "Sistema de biblioteca digital, rastreamento de inventário e agendamento de instalações em uma plataforma integrada",
      href: "/recursos/recursos",
    },
    {
      icon: CalendarDays,
      title: "Sistema de Frequência",
      description:
        "Rastreamento automatizado de frequência para alunos e funcionários com recursos de notificação instantânea",
      href: "/recursos/frequencia",
    },
    {
      icon: FileText,
      title: "Portal de Exames",
      description:
        "Sistema completo de gestão de exames, desde o agendamento até a publicação de resultados, com acesso seguro",
      href: "/recursos/exames",
    },
    {
      icon: Bell,
      title: "Quadro de Avisos",
      description:
        "Quadro de avisos digital para anúncios, eventos e atualizações importantes com distribuição direcionada",
      href: "/recursos/avisos",
    },
    {
      icon: Shield,
      title: "Segurança e Acesso",
      description:
        "Controle de acesso baseado em funções com criptografia de dados e backups seguros para total tranquilidade",
      href: "/recursos/seguranca",
    },
  ];


export default function SiteHeader() {
  const [open, setOpen] = React.useState(false);
  const [showFeatures, setShowFeatures] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div className="container max-w-6xl mx-auto flex h-14 items-center justify-between">
      <div className="flex items-center space-x-4">
        <Logo/>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/" legacyBehavior passHref>
                <NavigationMenuLink className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                  Home
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>Funcionalidades</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-[800px] p-4">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b">
                    <h4 className="text-lg font-medium">Funcionalidades</h4>
                    <Link
                      href="/features"
                      className="text-sm text-blue-500 hover:underline"
                    >
                      Ver todas
                    </Link>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    {features.map((feature, index) => (
                      <Link
                        key={index}
                        href={`/feature/${feature.title
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                        className="block group"
                      >
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-muted rounded-md group-hover:bg-muted/80">
                            <feature.icon className="h-6 w-6 text-violet-500" />
                          </div>
                          <div>
                            <h5 className="font-medium mb-1 group-hover:text-violet-500">
                              {feature.title}
                            </h5>
                            <p className="text-sm text-muted-foreground">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium mb-1">Comece</h4>
                        <p className="text-sm text-muted-foreground">
                          Their food sources have decreased, and their
                          numbers
                        </p>
                      </div>
                      <Button asChild variant="secondary">
                        <Link href="/contact-us">
                        Comece
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/#pricing" legacyBehavior passHref>
                <NavigationMenuLink className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                 Preços
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/#how-it-works" legacyBehavior passHref>
                <NavigationMenuLink className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                Como funciona ?
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div className="hidden md:flex items-center space-x-4">
        <Button asChild variant="ghost"><Link href={"/login"}>
        Iniciar sessão</Link></Button>
        <Button variant="secondary" asChild><Link href={"/contact-us"}>Peça uma demostração</Link></Button>
      </div> 

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full p-0">
          <SheetHeader className="border-b p-4">
            <SheetTitle className="text-left">Navegação</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col py-4">
            <Link
              href="/"
              className="px-4 py-2 text-lg font-medium hover:bg-accent"
              onClick={() => setOpen(false)}
            >
              Home
            </Link>
            <button
              className="flex items-center justify-between px-4 py-2 text-lg font-medium hover:bg-accent text-left"
              onClick={() => setShowFeatures(!showFeatures)}
            >
              Funcionalidades
              <ChevronDown
                className={cn(
                  "h-5 w-5 transition-transform",
                  showFeatures && "rotate-180"
                )}
              />
            </button>
            {showFeatures && (
              <div className="px-4 py-2 space-y-4">
                {features.map((feature, index) => (
                  <Link
                    key={index}
                    href={`/feature/${feature.title
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                    className="flex items-start gap-4 py-2"
                    onClick={() => setOpen(false)}
                  >
                    <div className="p-2 bg-muted rounded-md">
                      <feature.icon className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <h5 className="font-medium mb-1">{feature.title}</h5>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <Link
              href="/#pricing"
              className="px-4 py-2 text-lg font-medium hover:bg-accent"
              onClick={() => setOpen(false)}
            >
              Preços
            </Link>
            <Link
              href="/academy"
              className="px-4 py-2 text-lg font-medium hover:bg-accent"
              onClick={() => setOpen(false)}
            >
              Como funciona ?
            </Link>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
            <div className="grid gap-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setOpen(false)}
                asChild
              >
                <Link href={"/login"}>
                Iniciar sessão</Link>
              </Button>
              <Button variant="secondary" asChild className="w-full " onClick={() => setOpen(false)}>
                <Link href={"/contact-us"}>Peça uma demostração</Link>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  </header>
  );
}
