
import logo from "@/public/logosaas.png";
// import SocialX from "@/public/social-x.svg";
// import SocialInsta  from "@/public/social-insta.svg";
// import SocialLinkdIn from "@/public/social-linkedin.svg";
// import SocialPin from "@/public/social-pin.svg";
// import SocialYouTube from "@/public/social-youtube.svg";
import Image from "next/image";
import Link from "next/link";

 const Footer = () => {
  return (
    <footer className="bg-slate-900/20 text-sm text-white/70 py-10 text-center">
      <div className="container">
       <div className="inline-flex relative">
       <Image src={logo} height={40} width={40} alt="Saas"/>
       </div>
        <nav className="flex flex-col md:flex-row md:justify-center gap-6 mt-6">
          <Link href="/about" className="hover:text-white transition-colors">Sobre Nós</Link>
          <a href="#practice-lab" className="hover:text-white transition-colors">Serviços</a>
          <Link href="/search" className="hover:text-white transition-colors">Cursos</Link>
          <a href="#pricing" className="hover:text-white transition-colors">Planos</a>
          <a href="#testimonials" className="hover:text-white transition-colors">Testemunhos</a>
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
        <p className="mt-6">&copy; 2024 Znat-Technology, Inc, Todos os direitos reservados</p>
      </div>
    </footer>
  );
};

export default Footer;