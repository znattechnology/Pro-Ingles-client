
import logo from "@/public/logosaas.png";
// import SocialX from "@/public/social-x.svg";
// import SocialInsta  from "@/public/social-insta.svg";
// import SocialLinkdIn from "@/public/social-linkedin.svg";
// import SocialPin from "@/public/social-pin.svg";
// import SocialYouTube from "@/public/social-youtube.svg";
import Image from "next/image";

 const Footer = () => {
  return (
    <footer className="bg-slate-900/20 text-sm text-white/70 py-10 text-center">
      <div className="container">
       <div className="inline-flex relative">
       <Image src={logo} height={40} width={40} alt="Saas"/>
       </div>
        <nav className="flex flex-col md:flex-row md:justify-center gap-6 mt-6">
        <a href="#about">Sobre Nós</a>
                <a href="#service">Serviços</a>
                <a href="search">Cursos</a>
                <a href="#plan">Planos</a>
                <a href="#testimonial">Testemunhos</a>
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