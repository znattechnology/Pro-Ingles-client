"use client";
// import { useRouter } from "next/navigation";
import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import FormHeader from "../FormHeader";
import FormFooter from "../FormFooter";
import ImageInput from "@/components/FormInputs/ImageInput";
import TextArea from "@/components/FormInputs/TextAreaInput";
import TextInput from "@/components/FormInputs/TextInput";
// import toast from "react-hot-toast";
import PasswordInput from "@/components/FormInputs/PasswordInput";
import FormSelectInput from "@/components/FormInputs/FormSelectInput";
// import { Calendar } from "@/components/ui/calendar"
export type SelectOptionProps = {
  label: string;
  value: string;
};
type SingleStudentFormProps = {
  editingId?: string | undefined;
  initialData?: any | undefined | null;
};

export type StudentProps = {
  name: string;
  email: string;
  password: string;
  imageUrl?: string;
};
// Countries

const countries = [
  { label: "Afeganistão", value: "Afeganistao" },
  { label: "África do Sul", value: "Africa_do_Sul" },
  { label: "Albânia", value: "Albania" },
  { label: "Alemanha", value: "Alemanha" },
  { label: "Andorra", value: "Andorra" },
  { label: "Angola", value: "Angola" },
  { label: "Antígua e Barbuda", value: "Antigua_Barbuda" },
  { label: "Arábia Saudita", value: "Arabia_Saudita" },
  { label: "Argélia", value: "Argelia" },
  { label: "Argentina", value: "Argentina" },
  { label: "Armênia", value: "Armenia" },
  { label: "Austrália", value: "Australia" },
  { label: "Áustria", value: "Austria" },
  { label: "Azerbaijão", value: "Azerbaijao" },
  { label: "Bahamas", value: "Bahamas" },
  { label: "Bangladesh", value: "Bangladesh" },
  { label: "Barbados", value: "Barbados" },
  { label: "Bélgica", value: "Belgica" },
  { label: "Belize", value: "Belize" },
  { label: "Benim", value: "Benim" },
  { label: "Bielorrússia", value: "Bielorrussia" },
  { label: "Bolívia", value: "Bolivia" },
  { label: "Bósnia e Herzegovina", value: "Bosnia_Herzegovina" },
  { label: "Botsuana", value: "Botsuana" },
  { label: "Brasil", value: "Brasil" },
  { label: "Brunei", value: "Brunei" },
  { label: "Bulgária", value: "Bulgaria" },
  { label: "Burkina Faso", value: "Burkina_Faso" },
  { label: "Burundi", value: "Burundi" },
  { label: "Butão", value: "Butao" },
  { label: "Cabo Verde", value: "Cabo_Verde" },
  { label: "Camarões", value: "Camaroes" },
  { label: "Camboja", value: "Camboja" },
  { label: "Canadá", value: "Canada" },
  { label: "Catar", value: "Catar" },
  { label: "Cazaquistão", value: "Cazaquistao" },
  { label: "Chade", value: "Chade" },
  { label: "Chile", value: "Chile" },
  { label: "China", value: "China" },
  { label: "Chipre", value: "Chipre" },
  { label: "Colômbia", value: "Colombia" },
  { label: "Comores", value: "Comores" },
  { label: "Congo", value: "Congo" },
  { label: "Coreia do Norte", value: "Coreia_do_Norte" },
  { label: "Coreia do Sul", value: "Coreia_do_Sul" },
  { label: "Costa do Marfim", value: "Costa_do_Marfim" },
  { label: "Costa Rica", value: "Costa_Rica" },
  { label: "Croácia", value: "Croacia" },
  { label: "Cuba", value: "Cuba" },
  { label: "Dinamarca", value: "Dinamarca" },
  { label: "Djibuti", value: "Djibuti" },
  { label: "Dominica", value: "Dominica" },
  { label: "Egito", value: "Egito" },
  { label: "El Salvador", value: "El_Salvador" },
  { label: "Emirados Árabes Unidos", value: "Emirados_Arabes_Unidos" },
  { label: "Equador", value: "Equador" },
  { label: "Eritreia", value: "Eritreia" },
  { label: "Eslováquia", value: "Eslovaquia" },
  { label: "Eslovênia", value: "Eslovenia" },
  { label: "Espanha", value: "Espanha" },
  { label: "Estados Unidos", value: "Estados_Unidos" },
  { label: "Estônia", value: "Estonia" },
  { label: "Etiópia", value: "Etiopia" },
  { label: "Fiji", value: "Fiji" },
  { label: "Filipinas", value: "Filipinas" },
  { label: "Finlândia", value: "Finlandia" },
  { label: "França", value: "Franca" },
  { label: "Gabão", value: "Gabao" },
  { label: "Gâmbia", value: "Gambia" },
  { label: "Gana", value: "Gana" },
  { label: "Geórgia", value: "Georgia" },
  { label: "Granada", value: "Granada" },
  { label: "Grécia", value: "Grecia" },
  { label: "Guatemala", value: "Guatemala" },
  { label: "Guiana", value: "Guiana" },
  { label: "Guiné", value: "Guine" },
  { label: "Guiné-Bissau", value: "Guine_Bissau" },
  { label: "Guiné Equatorial", value: "Guine_Equatorial" },
  { label: "Haiti", value: "Haiti" },
  { label: "Holanda", value: "Holanda" },
  { label: "Honduras", value: "Honduras" },
  { label: "Hungria", value: "Hungria" },
  { label: "Iêmen", value: "Iemen" },
  { label: "Ilhas Maldivas", value: "Ilhas_Maldivas" },
  { label: "Índia", value: "India" },
  { label: "Indonésia", value: "Indonesia" },
  { label: "Irã", value: "Iran" },
  { label: "Iraque", value: "Iraque" },
  { label: "Irlanda", value: "Irlanda" },
  { label: "Islândia", value: "Islandia" },
  { label: "Israel", value: "Israel" },
  { label: "Itália", value: "Italia" },
  { label: "Jamaica", value: "Jamaica" },
  { label: "Japão", value: "Japao" },
  { label: "Jordânia", value: "Jordania" },
  { label: "Kosovo", value: "Kosovo" },
  { label: "Kuwait", value: "Kuwait" },
  { label: "Líbano", value: "Libano" },
  { label: "Líbia", value: "Libia" },
  { label: "Luxemburgo", value: "Luxemburgo" },
  { label: "Madagáscar", value: "Madagascar" },
  { label: "Malásia", value: "Malasia" },
  { label: "Malta", value: "Malta" },
  { label: "México", value: "Mexico" },
  { label: "Moçambique", value: "Mocambique" },
  { label: "Mônaco", value: "Monaco" },
  { label: "Namíbia", value: "Namibia" },
  { label: "Nepal", value: "Nepal" },
  { label: "Nigéria", value: "Nigeria" },
  { label: "Noruega", value: "Noruega" },
  { label: "Nova Zelândia", value: "Nova_Zelandia" },
  { label: "Países Baixos", value: "Paises_Baixos" },
  { label: "Paquistão", value: "Paquistao" },
  { label: "Paraguai", value: "Paraguai" },
  { label: "Peru", value: "Peru" },
  { label: "Polônia", value: "Polonia" },
  { label: "Portugal", value: "Portugal" },
  { label: "Reino Unido", value: "Reino_Unido" },
  { label: "República Dominicana", value: "Republica_Dominicana" },
  { label: "Romênia", value: "Romenia" },
  { label: "Rússia", value: "Rússia" },
  { label: "Senegal", value: "Senegal" },
  { label: "Sérvia", value: "Servia" },
  { label: "Singapura", value: "Singapura" },
  { label: "Síria", value: "Siria" },
  { label: "Suécia", value: "Suecia" },
  { label: "Suíça", value: "Suica" },
  { label: "Tailândia", value: "Tailandia" },
  { label: "Timor-Leste", value: "Timor_Leste" },
  { label: "Turquia", value: "Turquia" },
  { label: "Ucrânia", value: "Ucrania" },
  { label: "Uruguai", value: "Uruguai" },
  { label: "Venezuela", value: "Venezuela" },
  { label: "Vietnã", value: "Vietna" },
  { label: "Zimbábue", value: "Zimbabue" },
];

// provincies

const provincies = [
  { value: "Bengo", label: "Bengo" },
  { value: "Benguela", label: "Benguela" },
  { value: "Bié", label: "Bié" },
  { value: "Cabinda", label: "Cabinda" },
  { value: "Cuando Cubango", label: "Cuando Cubango" },
  { value: "Cuanza Norte", label: "Cuanza Norte" },
  { value: "Cuanza Sul", label: "Cuanza Sul" },
  { value: "Cunene", label: "Cunene" },
  { value: "Huambo", label: "Huambo" },
  { value: "Huíla", label: "Huíla" },
  { value: "Luanda", label: "Luanda" },
  { value: "Lunda Norte", label: "Lunda Norte" },
  { value: "Lunda Sul", label: "Lunda Sul" },
  { value: "Malanje", label: "Malanje" },
  { value: "Moxico", label: "Moxico" },
  { value: "Namibe", label: "Namibe" },
  { value: "Uíge", label: "Uíge" },
  { value: "Zaire", label: "Zaire" },
  { value: "Outra", label: "outra" },
];
// religioes
const religions = [
  { label: "Cristianismo", value: "Cristianismo" },
  { label: "Islamismo", value: "Islamismo" },
  { label: "Hinduísmo", value: "Hinduismo" },
  { label: "Budismo", value: "Budismo" },
  { label: "Judaísmo", value: "Judaismo" },
  { label: "Espiritismo", value: "Espiritismo" },
  { label: "Sikhismo", value: "Sikhismo" },
  { label: "Ateísmo", value: "Ateismo" },
  { label: "Agnosticismo", value: "Agnosticismo" },
  {
    label: "Religiões Tradicionais Africanas",
    value: "Tradicionais_Africanas",
  },
  { label: "Religiões Indígenas", value: "Religioes_Indigenas" },
  { label: "Taoísmo", value: "Taoismo" },
  { label: "Confucionismo", value: "Confucionismo" },
  { label: "Jainismo", value: "Jainismo" },
  { label: "Xintoísmo", value: "Xintoismo" },
  { label: "Religiões Neo-Pagãs", value: "NeoPaganismo" },
  { label: "Zoroastrismo", value: "Zoroastrismo" },
  { label: "Bahaísmo", value: "Bahaismo" },
  { label: "Seicho-no-Ie", value: "Seicho_no_Ie" },
  { label: "Religiões Novas e Sincréticas", value: "Novas_Sincreticas" },
];

// Parents

const parents = [
  { label: "João Silva", value: "JoaoSilva" },
  { label: "Maria Oliveira", value: "MariaOliveira" },
  { label: "Antônio Santos", value: "AntonioSantos" },
  { label: "Ana Costa", value: "AnaCosta" },
  { label: "Carlos Pereira", value: "CarlosPereira" },
  { label: "Fernanda Almeida", value: "FernandaAlmeida" },
  { label: "Ricardo Ferreira", value: "RicardoFerreira" },
  { label: "Patrícia Gomes", value: "PatriciaGomes" },
  { label: "Luís Rocha", value: "LuisRocha" },
  { label: "Cláudia Martins", value: "ClaudiaMartins" },
];

//gender

const gender = [
  { label: "Masculino", value: "male" },
  { label: "Feminino", value: "female" },
];

const preferredContactMethods = [
  { label: "Telefone", value: "telefone" },
  { label: "E-mail", value: "email" },
  { label: "Mensagem SMS", value: "sms" },
  { label: "WhatsApp", value: "whatsapp" },
  { label: "Carta", value: "carta" },
  { label: "Reunião Presencial", value: "reuniao_presencial" },
  { label: "Outros", value: "outros" },
];

const parentTitle = [
  { label: "Sr.", value: "mr" },
  { label: "Sra.", value: "mrs" },
  { label: "Dr.", value: "dr" },
  { label: "Dra.", value: "dra" },
  { label: "Eng.", value: "eng" },

  { label: "Outro", value: "outro" },
];

// Classes

const classes = [
  { label: "1º Classe", value: "1Ano" },
  { label: "2º Classe", value: "2Ano" },
  { label: "3º Classe", value: "3Ano" },
  { label: "4º Classe", value: "4Ano" },
  { label: "5º Classe", value: "5Ano" },
  { label: "6º Classe", value: "6Ano" },
  { label: "7º Classe", value: "7Ano" },
  { label: "8º Classe", value: "8Ano" },
  { label: "9º Classe", value: "9Ano" },
  { label: "10º Classe", value: "10Ano" },
  { label: "11º Classe", value: "11Ano" },
  { label: "12º Classe", value: "12Ano" },
];

const parentRelationship = [
  { label: "Pai", value: "pai" },
  { label: "Mãe", value: "mae" },
  { label: "Tio", value: "tio" },
  { label: "Tia", value: "tia" },
  { label: "Avô", value: "avo" },
  { label: "Avó", value: "avoa" },
  { label: "Irmão", value: "irmao" },
  { label: "Irmã", value: "irma" },
  { label: "Padrasto", value: "padrasto" },
  { label: "Madrasta", value: "madrasta" },
  { label: "Tutor Legal", value: "tutor" },
  { label: "Outro", value: "outro" },
];

// Sections/ Streams

const streams = [
  { label: "1º Classe - Geral", value: "1Ano_Geral" },
  { label: "2º Classe - Geral", value: "2Ano_Geral" },
  { label: "3º Classe - Geral", value: "3Ano_Geral" },
  { label: "4º Classe - Geral", value: "4Ano_Geral" },
  { label: "5º Classe - Geral", value: "5Ano_Geral" },
  { label: "6º Classe - Geral", value: "6Ano_Geral" },
  { label: "7º Classe - Geral", value: "7Ano_Geral" },
  { label: "7º Classe - Geral", value: "7Ano_Geral" },
  { label: "7º Classe - Geral", value: "7Ano_Geral" },
  { label: "8º Classe - Geral", value: "8Ano_Geral" },
  { label: "8º Classe - Geral", value: "8Ano_Geral" },
  { label: "8º Classe - Geral", value: "8Ano_Geral" },
  { label: "9º Classe - Geral", value: "9Ano_Geral" },
  { label: "9º Classe - Geral", value: "9Ano_Geral" },
  { label: "9º Classe - Geral", value: "9Ano_Geral" },
  { label: "10º Classe - Ciências", value: "10Ano_Ciencias" },
  { label: "10º Classe - Humanidades", value: "10Ano_Humanidades" },
  { label: "10º Classe - Comercial", value: "10Ano_Comercial" },
  { label: "11º Classe - Ciências", value: "11Ano_Ciencias" },
  { label: "11º Classe - Humanidades", value: "11Ano_Humanidades" },
  { label: "11º Classe - Comercial", value: "11Ano_Comercial" },
  { label: "12º Classe - Ciências", value: "12Ano_Ciencias" },
  { label: "12º Classe - Humanidades", value: "12Ano_Humanidades" },
  { label: "12º Classe - Comercial", value: "12Ano_Comercial" },
];
function ParentForm({ editingId, initialData }: SingleStudentFormProps) {
  const [selectedGender, setSelectedGender] = useState<any>(null);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [selectedProvince, setSelectedProvince] = useState<any>(null);
  const [selectedReligioes, setSelectedReligioes] = useState<any>(null);
  const [selectedParentTitle, setSelectedParentTitle] = useState<any>(null);
  const [selectedParentRelationship, setSelectedParentRelationship] =
    useState<any>(null);
  const [selectedPreferredContactMethods, setSelectedPreferredContactMethods] =
    useState<any>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentProps>({
    defaultValues: {
      name: initialData?.name,
    },
  });
  // const router = useRouter();

  const [loading, setLoading] = useState(false);
  const initialImage = initialData?.imageUrl || "/images/placeholder.jpeg";
  const [imageUrl, setImageUrl] = useState(initialImage);

  async function saveStudent(data: StudentProps) {
    try {
      setLoading(true);

      data.imageUrl = imageUrl;
      console.log(data);

      if (editingId) {
        // await updateCategoryById(editingId, data);
        // setLoading(false);
        // // Toast
        // toast.success("Updated Successfully!");
        // //reset
        // reset();
        // //route
        // router.push("/dashboard/categories");
        // setImageUrl("/placeholder.svg");
      } else {
        // await createStudent(data);
        // setLoading(false);
        // // Toast
        // toast.success("Successfully Created!");
        // //reset
        // reset();
        // setImageUrl("/placeholder.svg");
        // //route
        // router.push("/dashboard/categories");
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  }
  // async function handleDeleteAll() {
  // setLoading(true);
  // try {
  // await deleteManyCategories();
  // setLoading(false);
  // } catch (error) {
  // console.log(error);
  // }
  // }

  return (
    <form className="" onSubmit={handleSubmit(saveStudent)}>
      <FormHeader
        href="/users/parents"
        parent=""
        title="Encarregado"
        editingId={editingId}
        loading={loading}
      />

      <div className="grid grid-cols-12 gap-6 py-8">
        <div className="lg:col-span-12 col-span-full space-y-3">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormSelectInput
              label="Titulo"
              options={parentTitle}
              option={selectedParentTitle}
              setOption={setSelectedParentTitle}
            />
            <TextInput
              label="Primeiro Nome"
              register={register}
              name="firstName"
              type="text"
              errors={errors}
            />

            <TextInput
              label="Último Nome"
              register={register}
              name="lastName"
              type="text"
              errors={errors}
            />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <TextInput
              label="Endereço de Email"
              register={register}
              name="email"
              type="email"
              errors={errors}
            />
            <TextInput
              label="Telefone"
              register={register}
              name="phone"
              type="text"
              errors={errors}
            />

            <TextInput
              label="Número de Identificação (BI)"
              register={register}
              name="idNumber"
              type="text"
              errors={errors}
            />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <TextInput
              label="Data de Nascimento"
              register={register}
              name="dob"
              type="date"
              errors={errors}
            />

            <FormSelectInput
              label="Nacionalidade"
              options={countries}
              option={selectedCountry}
              setOption={setSelectedCountry}
            />
            <FormSelectInput
              label="Provincia"
              options={provincies}
              option={selectedProvince}
              setOption={setSelectedProvince}
            />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormSelectInput
              label="Religião"
              options={religions}
              option={selectedReligioes}
              setOption={setSelectedReligioes}
            />
            <TextInput
              label="Morada"
              register={register}
              name="address"
              type="text"
              errors={errors}
            />

            <TextInput
              label="Profissão"
              register={register}
              name="occupation"
              type="text"
              errors={errors}
            />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormSelectInput
              label="Relação com o estudante"
              options={parentRelationship}
              option={selectedParentRelationship}
              setOption={setSelectedParentRelationship}
            />
            {/* <FormSelectInput
              label="Gênero"
              options={gender}
              option={selectedGender}
              setOption={setSelectedGender}
              isSearchable={false}
            /> */}
            <TextInput
              label="Número de Registro"
              register={register}
              name="registrationNumber"
              type="number"
              errors={errors}
            />

            <TextInput
              label="Data de Registro"
              register={register}
              name="registrationDate"
              type="date"
              errors={errors}
            />
            <FormSelectInput
              label="Gênero"
              options={gender}
              option={selectedGender}
              setOption={setSelectedGender}
              isSearchable={false}
            />
            <PasswordInput
              label="Password"
              register={register}
              name="password"
              errors={errors}
              toolTipText="Senha de acesso ao portal do encarregado"
            />
            <TextInput
              label="Numero do WhatsApp"
              register={register}
              name="Whatsapp"
              type="number"
              errors={errors}
            />
            <TextInput
              label="Endereço"
              register={register}
              type="text"
              name="address"
              errors={errors}
            />

            <FormSelectInput
              label="Forma  de contacto"
              options={preferredContactMethods}
              option={selectedPreferredContactMethods}
              setOption={setSelectedPreferredContactMethods}
            />

            <TextArea
              label="Observações Adicionais"
              register={register}
              name="notes"
              errors={errors}
            />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ImageInput
              title="Foto do Encarregado"
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
              endpoint="parentProfileImage"
            />
          </div>
        </div>

        {/* <div className="lg:col-span-4 col-span-full ">
          <div className="grid auto-rows-max items-start gap-4 mb-0">
        
          </div>
        </div> */}
      </div>

      <FormFooter
        href="/users/parents"
        editingId={editingId}
        loading={loading}
        title="Encarregado"
        parent=""
      />
    </form>
  );
}

export default ParentForm;
