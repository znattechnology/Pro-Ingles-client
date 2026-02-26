'use client';

import Logo from "@/public/logo/logo.png";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const Footer = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleScrollToSection = (sectionId: string) => {
    // Se não estiver na landing page, redireciona para a home com o hash
    if (pathname !== '/') {
      router.push(`/#${sectionId}`);
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
  };

  return (
    <footer className="bg-slate-900/20 text-sm text-white/70 py-10 text-center">
      <div className="container">
        <div className="inline-flex relative">
          <Image src={Logo} height={60} width={60} alt="ProEnglish Logo"/>
        </div>
        <nav className="flex flex-col md:flex-row md:justify-center gap-6 mt-6">
          <Link href="/about" className="hover:text-white transition-colors">Sobre Nós</Link>
          <button onClick={() => handleScrollToSection('practice-lab')} className="hover:text-white transition-colors">Serviços</button>
          <button onClick={() => handleScrollToSection('pricing')} className="hover:text-white transition-colors">Planos</button>
          <button onClick={() => handleScrollToSection('testimonials')} className="hover:text-white transition-colors">Testemunhos</button>
          <Link href="/verify" className="hover:text-white transition-colors">
            Verificar Certificado
          </Link>
        </nav>
        {/* <div className="flex justify-center gap-6 mt-6 ">
          <SocialX/>
          <SocialInsta/>
          <SocialLinkdIn/>
          <SocialPin/> 
          <SocialYouTube/>
        </div> */}
        <p className="mt-6">&copy; {new Date().getFullYear()} ProEnglish Angola. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;