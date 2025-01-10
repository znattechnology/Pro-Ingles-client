"use client";
import avatar1 from "@/public/avatar-1.png";
import avatar2 from "@/public/avatar-2.png";
import avatar3 from "@/public/avatar-3.png";
import avatar4 from "@/public/avatar-4.png";
import avatar5 from "@/public/avatar-5.png";
import avatar6 from "@/public/avatar-6.png";
import avatar7 from "@/public/avatar-7.png";
import avatar8 from "@/public/avatar-8.png";
import avatar9 from "@/public/avatar-9.png";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";
import React from "react";

const testimonials = [
  {
    text: "Graças ao curso de inglês geral, consegui me sentir confiante em conversas do dia a dia e até em viagens!",
    imageSrc: avatar1.src,
    name: "Ana Silva",
    username: "@AnaSilva00",
  },
  {
    text: "O curso de inglês para negócios transformou minha capacidade de me comunicar em reuniões. Agora, estou mais seguro em apresentações!",
    imageSrc: avatar2.src,
    name: "Carlos Oliveira",
    username: "@CarlosOliveira",
  },
  {
    text: "A flexibilidade das aulas online é um grande diferencial. Posso estudar no meu próprio ritmo.",
    imageSrc: avatar3.src,
    name: "Mariana Ferreira",
    username: "@morganleewhiz",
  },
  {
    text: "Adorei as aulas personalizadas! O professor adaptou o conteúdo às minhas necessidades específicas e isso fez toda a diferença.",
    imageSrc: avatar4.src,
    name: "Fernanda Costa",
    username: "@caseyj",
  },
  {
    text: "O plano grátis foi um excelente ponto de partida. Agora estou ansioso para continuar no plano Premium!",
    imageSrc: avatar5.src,
    name: "Ricardo Mendes",
    username: "@taylorkimm",
  },
  {
    text: "As aulas de inglês para tecnologia da informação me ajudaram a entender melhor os termos técnicos e a me comunicar com minha equipe internacional",
    imageSrc: avatar6.src,
    name: "Juliana Pereira",
    username: "@rileysmith1",
  },
  {
    text: "O feedback que recebi dos professores foi fundamental para meu progresso. Estou muito satisfeito com o aprendizado!.",
    imageSrc: avatar7.src,
    name: "Mateus Santos",
    username: "@jpatelsdesign",
  },
  {
    text: "A comunidade de alunos é incrível! Eu aprendi muito com as interações e as experiências dos outros. ",
    imageSrc: avatar8.src,
    name: "Bianca Rocha",
    username: "@dawsontechtips",
  },
  {
    text: "O curso para o setor petrolífero foi perfeito para minha carreira. Agora me sinto mais preparado para atuar nessa área!.",
    imageSrc: avatar9.src,
    name: "Felipe Almeida",
    username: "@casey09",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

const TenstimonialColumn = (props: {
  className?: string;
  testimonials: typeof testimonials;
  durations?: number;
}) => (
  <div className={props.className}>
        <motion.div className="flex flex-col gap-6 " 
        animate={{
          translateY:"-50%",
        }}

        transition={{
          duration:props.durations || 25,
          repeat:Infinity,
          ease:"linear",
          repeatType:"loop",

        }}
        
        >
    {[...new Array(2)].fill(0).map((_, index) => (
      <React.Fragment key={index}>
        {props.testimonials.map(({ text, imageSrc, name, username }) => (
          <div key={imageSrc} className="card">
            <div className="text-white/70">{text}</div>
            <div className="flex items-center gap-2 mt-5">
              <Image
                src={imageSrc}
                alt={name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex flex-col">
                <div className="font-medium tracking-tight leading-5 text-white">
                  {name}
                </div>
                <div className="leading-5 tracking-tight text-white/70">
                  {username}
                </div>
              </div>
            </div>
          </div>
        ))}
      </React.Fragment>
    ))}
  </motion.div>
  </div>

);
 const Testimonials = () => {
  return (
    <section id="testimonial">
      <div className="container">
        <div className="flex justify-center mt-10">
          <div className="tag">Testemunhos</div>
        </div>

        <div className="section-heading">
          <h2 className="section-title mt-5">o que os nossos clientes dizem</h2>
          {/* <p className="section-description mt-5">
            Isso cobre os fundamentos básicos. A partir daqui, você pode
            adicionar funcionalidades como autenticação, gerenciamento de
            usuários, estilização do frontend, etc. Precisa de ajuda com alguma
            dessas etapas
          </p> */}
        </div>
        <div className="flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_50%,black_75%, white_25%,white_75%,transparent)] max-h-[700px] overflow-hidden mt-10 ">
          <TenstimonialColumn testimonials={firstColumn} durations={15} />
          <TenstimonialColumn
            testimonials={secondColumn }
            className="hidden md:block"
            durations={25}
          />
          <TenstimonialColumn
            testimonials={thirdColumn}
            className="hidden lg:block"
            durations={30}
          />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
