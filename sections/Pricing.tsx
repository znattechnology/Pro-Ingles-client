
import { CheckIcon } from "lucide-react";
import { twMerge } from "tailwind-merge";

const pricingTiers = [
  {
    title: "Plano Grátis",
    monthlyPrice: 0,
    buttonText: "Comece gratuitamente",
    popular: false,
    inverse: false,
    features: [
      "Acesso a lições básicas de inglês",
      "Exercícios de prática semanais",
      "Acesso à comunidade de alunos",
      "Material de estudo essencial",
     
    ],
  },
  {
    title: "Plano Premium",
    monthlyPrice: 9,
    buttonText: "Subscreva-se já",
    popular: true,
    inverse: true,
    features: [
      "Tudo do Plano Grátis",
      "Aulas ao vivo com professores experientes",
      "Acesso a conteúdos avançados e específicos",
      "Certificados de conclusão de curso",
      "Feedback personalizado sobre seu progresso",
     
    ],
  },
  {
    title: "Plano Business",
    monthlyPrice: 19,
    buttonText: "Contacta-nos",
    popular: false,
    inverse: false,
    features: [
      "Tudo do Plano Premium",
      "Treinamento específico para áreas como negócios, TI, setor bancário e petrolífero",
      "Aulas personalizadas para equipes",
      "Relatórios de progresso detalhados para empresas",
      "Sessões de coaching individual para objetivos específicos",
  
    ],
  },
];

 const Pricing = () => {
  return (
    <section className="" id="plan">
      <div className="container">
       <div className="section-heading">
       <h2 className="section-title">Nossos Planos de Subscrição</h2>
        <p className="section-description mt-5">
        Escolha o plano que melhor se adapta aos seus objetivos e comece a aprender inglês de maneira prática e eficiente!
        </p>
       </div>
        {/* Price Card */}
        <div className="flex flex-col gap-6 items-center mt-10 lg:flex-row lg:items-end lg:justify-center">
          {pricingTiers.map(
            ({
              title,
              monthlyPrice,
              buttonText,
              popular,
              inverse,
              features,
            }) => (
              <div
                key={title}
                className={twMerge( "card", inverse === true && "bg-violet-800 bg-opacity-20 border border-violet-800")}
              >
                <div className="flex justify-between ">
                  <h3 className="text-lg font-bold text-white">{title}</h3>
               {popular && (
                   <div className="inline-flex text-sm px-4 py-1.5 rounded-xl border border-white/20 ">
                   <span className=" text-white font-bold">
                     {" "}
                     Popular
                   </span>
                 </div>
               )}
                </div>

                <div className="flex items-baseline gap-1 mt-[30px]">
                  <span className="text-4xl font-bold tracking-tighter leading-none text-white">
                    Kz {monthlyPrice}
                  </span>
                  <span className="tracking-tight font-bold text-white/70">
                    {" "}
                    /mês
                  </span>
                </div>
                <button className={twMerge("btn-primary w-full h-10 rounded-md mt-3", inverse === true && "bg-white/70 text-black")}>
                  {buttonText}
                </button>
                <ul className="flex flex-col gap-5 mt-8">
                  {features.map((feature) => (
                    <li
                      className="text-sm flex items-center gap-4 "
                      key={feature}
                    >
                      <CheckIcon className="w-6 h-6 text-violet-500" />

                      <span className="text-white">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
};


export default Pricing;